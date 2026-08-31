import type { AppData, Item, ItemStatus, Priority, Quote, SavingRow } from '../types'
import { DEFAULT_SETTINGS, PRIORITY_LABEL, STATUS_LABEL } from '../types'
import { safeHttpUrl } from './sanitize'

/** File JSON trong repo có thể bị sửa tay — chuẩn hóa mọi giá trị, sai thì về mặc định thay vì làm app chết. */

function asText(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

function asNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

function asRating(v: unknown): number {
  return Math.min(Math.max(asNumber(v), 0), 5)
}

function asPriority(v: unknown): Priority {
  const s = asText(v)
  return (Object.keys(PRIORITY_LABEL) as Priority[]).find((k) => k.toLowerCase() === s.toLowerCase()) ?? 'Medium'
}

function asStatus(v: unknown): ItemStatus {
  const s = asText(v)
  return (Object.keys(STATUS_LABEL) as ItemStatus[]).find((k) => k.toLowerCase() === s.toLowerCase()) ?? 'Idea'
}

type Raw = Record<string, unknown>

export function normalizeItem(r: Raw): Item {
  return {
    id: asText(r.id),
    name: asText(r.name),
    category: asText(r.category),
    description: asText(r.description),
    priority: asPriority(r.priority),
    estimatedPrice: asNumber(r.estimatedPrice),
    chosenQuoteId: asText(r.chosenQuoteId),
    targetMonth: asText(r.targetMonth),
    status: asStatus(r.status),
    imageUrl: safeHttpUrl(asText(r.imageUrl)),
    note: asText(r.note),
    purchasedAt: asText(r.purchasedAt),
    purchasedPrice: asNumber(r.purchasedPrice),
    createdAt: asText(r.createdAt),
    updatedAt: asText(r.updatedAt),
  }
}

export function normalizeQuote(r: Raw): Quote {
  return {
    id: asText(r.id),
    itemId: asText(r.itemId),
    seller: asText(r.seller),
    price: asNumber(r.price),
    url: safeHttpUrl(asText(r.url)),
    rating: asRating(r.rating),
    reviewCount: asNumber(r.reviewCount),
    reviewSummary: asText(r.reviewSummary),
    promo: asText(r.promo),
    fetchedAt: asText(r.fetchedAt),
    isManual: r.isManual !== false,
    isChosen: r.isChosen === true,
  }
}

function normalizeSaving(r: Raw): SavingRow {
  return { month: asText(r.month), plannedAmount: asNumber(r.plannedAmount), note: asText(r.note) }
}

export function normalizeData(raw: unknown): AppData {
  const d = (raw ?? {}) as Raw
  const items = Array.isArray(d.items) ? (d.items as Raw[]).map(normalizeItem).filter((i) => i.id) : []
  const quotes = Array.isArray(d.quotes) ? (d.quotes as Raw[]).map(normalizeQuote).filter((q) => q.id) : []
  const savings = Array.isArray(d.savings) ? (d.savings as Raw[]).map(normalizeSaving).filter((s) => s.month) : []
  const s = (d.settings ?? {}) as Raw
  return {
    items,
    quotes,
    savings,
    settings: {
      openingBalance: asNumber(s.openingBalance),
      defaultSaving: asNumber(s.defaultSaving),
      theme: asText(s.theme) === 'minimal' ? 'minimal' : DEFAULT_SETTINGS.theme,
    },
  }
}
