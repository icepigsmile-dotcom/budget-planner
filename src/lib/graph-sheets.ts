import type { AppData, Item, ItemStatus, Priority, Quote, SavingRow } from '../types'
import { DEFAULT_SETTINGS, PRIORITY_LABEL, STATUS_LABEL } from '../types'
import { safeHttpUrl } from './sanitize'

/** Column layouts of the 4 sheets in the OneDrive Excel file. Order matters. */
export const SHEETS = {
  Items: ['id', 'name', 'category', 'description', 'priority', 'estimated_price', 'chosen_quote_id', 'target_month', 'status', 'image_url', 'note', 'purchased_at', 'purchased_price', 'created_at', 'updated_at'],
  Quotes: ['id', 'item_id', 'seller', 'price', 'url', 'rating', 'review_count', 'review_summary', 'promo', 'fetched_at', 'is_manual', 'is_chosen'],
  Savings: ['month', 'planned_amount', 'note'],
  Settings: ['key', 'value'],
} as const

export type SheetName = keyof typeof SHEETS

type Cell = string | number | boolean | null

const NUMBER_COLUMNS = new Set(['estimated_price', 'purchased_price', 'price', 'rating', 'review_count', 'planned_amount'])

/** Excel date serial -> "YYYY-MM" (defensive: in case a month cell got coerced to a date) */
function serialToMonth(serial: number): string {
  const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function asText(v: Cell): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function asMonth(v: Cell): string {
  if (typeof v === 'number' && v > 10000) return serialToMonth(v)
  return asText(v)
}

function asNumber(v: Cell): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[.,\s₫]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function asBool(v: Cell): boolean {
  return v === true || String(v).toUpperCase() === 'TRUE' || v === 1
}

/** Điểm sao 0–5: chấp nhận "4,5" / "4.5" / 4.5; kẹp trong [0,5]. */
function asRating(v: Cell): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
  if (!Number.isFinite(n)) return 0
  return Math.min(Math.max(n, 0), 5)
}

/** Giá trị enum đọc từ Excel là dữ liệu không tin cậy — chuẩn hóa, sai thì về mặc định thay vì làm app trắng màn hình. */
function asPriority(v: Cell): Priority {
  const s = asText(v)
  const hit = (Object.keys(PRIORITY_LABEL) as Priority[]).find((k) => k.toLowerCase() === s.toLowerCase())
  return hit ?? 'Medium'
}

function asStatus(v: Cell): ItemStatus {
  const s = asText(v)
  const hit = (Object.keys(STATUS_LABEL) as ItemStatus[]).find((k) => k.toLowerCase() === s.toLowerCase())
  return hit ?? 'Idea'
}

export function rowsToItems(rows: Cell[][]): Item[] {
  return rows
    .filter((r) => asText(r[0]))
    .map((r) => ({
      id: asText(r[0]),
      name: asText(r[1]),
      category: asText(r[2]),
      description: asText(r[3]),
      priority: asPriority(r[4]),
      estimatedPrice: asNumber(r[5]),
      chosenQuoteId: asText(r[6]),
      targetMonth: asMonth(r[7]),
      status: asStatus(r[8]),
      imageUrl: safeHttpUrl(asText(r[9])),
      note: asText(r[10]),
      purchasedAt: asText(r[11]),
      purchasedPrice: asNumber(r[12]),
      createdAt: asText(r[13]),
      updatedAt: asText(r[14]),
    }))
}

export function rowsToQuotes(rows: Cell[][]): Quote[] {
  return rows
    .filter((r) => asText(r[0]))
    .map((r) => ({
      id: asText(r[0]),
      itemId: asText(r[1]),
      seller: asText(r[2]),
      price: asNumber(r[3]),
      url: safeHttpUrl(asText(r[4])),
      rating: asRating(r[5]),
      reviewCount: asNumber(r[6]),
      reviewSummary: asText(r[7]),
      promo: asText(r[8]),
      fetchedAt: asText(r[9]),
      isManual: asBool(r[10]),
      isChosen: asBool(r[11]),
    }))
}

export function rowsToSavings(rows: Cell[][]): SavingRow[] {
  return rows
    .filter((r) => asText(r[0]))
    .map((r) => ({ month: asMonth(r[0]), plannedAmount: asNumber(r[1]), note: asText(r[2]) }))
}

export function rowsToSettings(rows: Cell[][]): AppData['settings'] {
  const map = new Map(rows.map((r) => [asText(r[0]), r[1]]))
  return {
    openingBalance: asNumber(map.get('opening_balance') ?? 0),
    defaultSaving: asNumber(map.get('default_saving') ?? 0),
    theme: asText(map.get('theme') ?? '') === 'minimal' ? 'minimal' : DEFAULT_SETTINGS.theme,
  }
}

export function itemsToRows(items: Item[]): Cell[][] {
  return items.map((i) => [i.id, i.name, i.category, i.description, i.priority, i.estimatedPrice, i.chosenQuoteId, i.targetMonth, i.status, i.imageUrl, i.note, i.purchasedAt, i.purchasedPrice, i.createdAt, i.updatedAt])
}

export function quotesToRows(quotes: Quote[]): Cell[][] {
  return quotes.map((q) => [q.id, q.itemId, q.seller, q.price, q.url, q.rating, q.reviewCount, q.reviewSummary, q.promo, q.fetchedAt, q.isManual ? 'TRUE' : 'FALSE', q.isChosen ? 'TRUE' : 'FALSE'])
}

export function savingsToRows(savings: SavingRow[]): Cell[][] {
  return savings.map((s) => [s.month, s.plannedAmount, s.note])
}

export function settingsToRows(s: AppData['settings']): Cell[][] {
  return [
    ['opening_balance', s.openingBalance],
    ['default_saving', s.defaultSaving],
    ['theme', s.theme],
  ]
}

/** numberFormat matrix: "@" (text) everywhere except numeric columns ("0"). Keeps months/ids as text in Excel. */
export function numberFormats(sheet: SheetName, rowCount: number): string[][] {
  const cols = SHEETS[sheet]
  const rowFormat = cols.map((c) => (c === 'rating' ? '0.0' : NUMBER_COLUMNS.has(c) ? '0' : '@'))
  return Array.from({ length: rowCount }, () => [...rowFormat])
}
