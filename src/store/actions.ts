import type { AppData, Item, Quote, SavingRow, Settings } from '../types'
import { todayIso } from '../lib/months'
import { safeHttpUrl } from '../lib/sanitize'

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function upsertItem(d: AppData, item: Item): AppData {
  const prev = d.items.find((i) => i.id === item.id)
  const updated = { ...item, imageUrl: safeHttpUrl(item.imageUrl), updatedAt: todayIso() }
  // giá bị sửa tay khác với giá của báo giá đã chọn: bỏ liên kết "giá đã chốt từ X" cho khỏi hiểu nhầm
  if (updated.chosenQuoteId) {
    const chosen = d.quotes.find((q) => q.id === updated.chosenQuoteId)
    if (chosen && chosen.price !== updated.estimatedPrice) updated.chosenQuoteId = ''
  }
  return { ...d, items: prev ? d.items.map((i) => (i.id === item.id ? updated : i)) : [...d.items, updated] }
}

export function deleteItem(d: AppData, itemId: string): AppData {
  return {
    ...d,
    items: d.items.filter((i) => i.id !== itemId),
    quotes: d.quotes.filter((q) => q.itemId !== itemId),
  }
}

export function addQuote(d: AppData, quote: Quote): AppData {
  return { ...d, quotes: [...d.quotes, { ...quote, url: safeHttpUrl(quote.url) }] }
}

export function deleteQuote(d: AppData, quoteId: string): AppData {
  return { ...d, quotes: d.quotes.filter((q) => q.id !== quoteId) }
}

/** Chosen quote becomes the item's official price. */
export function chooseQuote(d: AppData, itemId: string, quoteId: string): AppData {
  const quote = d.quotes.find((q) => q.id === quoteId)
  if (!quote) return d
  return {
    ...d,
    quotes: d.quotes.map((q) => (q.itemId === itemId ? { ...q, isChosen: q.id === quoteId } : q)),
    items: d.items.map((i) =>
      i.id === itemId ? { ...i, chosenQuoteId: quoteId, estimatedPrice: quote.price, updatedAt: todayIso() } : i,
    ),
  }
}

/** Mark purchased: the real price is deducted from the accumulated pool (engine reads purchasedPrice). */
export function markPurchased(d: AppData, itemId: string, purchasedAt: string, purchasedPrice: number): AppData {
  return {
    ...d,
    items: d.items.map((i) =>
      i.id === itemId ? { ...i, status: 'Purchased' as const, purchasedAt, purchasedPrice, updatedAt: todayIso() } : i,
    ),
  }
}

export function setSavingMonth(d: AppData, month: string, plannedAmount: number): AppData {
  const exists = d.savings.some((s) => s.month === month)
  const savings: SavingRow[] = exists
    ? d.savings.map((s) => (s.month === month ? { ...s, plannedAmount } : s))
    : [...d.savings, { month, plannedAmount, note: '' }]
  savings.sort((a, b) => (a.month < b.month ? -1 : 1))
  return { ...d, savings }
}

export function updateSettings(d: AppData, patch: Partial<Settings>): AppData {
  return { ...d, settings: { ...d.settings, ...patch } }
}
