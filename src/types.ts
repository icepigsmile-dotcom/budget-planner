export type Priority = 'High' | 'Medium' | 'Low'

export type ItemStatus = 'Idea' | 'Saving' | 'ReadyToBuy' | 'Purchased' | 'Skipped'

export interface Item {
  id: string
  name: string
  category: string
  description: string
  priority: Priority
  /** đơn giá 1 cái — thành tiền = estimatedPrice × quantity */
  estimatedPrice: number
  quantity: number
  chosenQuoteId: string
  /** YYYY-MM */
  targetMonth: string
  status: ItemStatus
  /** emoji biểu tượng món đồ; rỗng = tự lấy theo danh mục */
  icon: string
  imageUrl: string
  note: string
  purchasedAt: string
  purchasedPrice: number
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  itemId: string
  seller: string
  price: number
  url: string
  rating: number
  reviewCount: number
  reviewSummary: string
  promo: string
  fetchedAt: string
  isManual: boolean
  isChosen: boolean
}

export interface SavingRow {
  /** YYYY-MM */
  month: string
  plannedAmount: number
  note: string
}

export interface Settings {
  openingBalance: number
  defaultSaving: number
  theme: 'pastel' | 'minimal'
}

export interface AppData {
  items: Item[]
  quotes: Quote[]
  savings: SavingRow[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = { openingBalance: 0, defaultSaving: 0, theme: 'pastel' }

export const PRIORITY_LABEL: Record<Priority, string> = { High: 'Cao', Medium: 'Trung bình', Low: 'Thấp' }

export const STATUS_LABEL: Record<ItemStatus, string> = {
  Idea: 'Ý tưởng',
  Saving: 'Đang tiết kiệm',
  ReadyToBuy: 'Sẵn sàng mua',
  Purchased: 'Đã mua',
  Skipped: 'Bỏ qua',
}

export const CATEGORIES = ['Điện tử', 'Gia dụng', 'Nội thất', 'Cá nhân', 'Khác']

// Icon món đồ được gán tự động từ tên + danh mục — xem components/item-icons.tsx.
// Trường Item.icon giữ lại trong schema (không dùng ở giao diện) để tương thích dữ liệu cũ.

/** Thành tiền của món đồ = đơn giá × số lượng (số lượng thiếu/hỏng coi là 1). */
export function itemTotal(item: Pick<Item, 'estimatedPrice' | 'quantity'>): number {
  return item.estimatedPrice * Math.max(1, Math.round(item.quantity || 1))
}
