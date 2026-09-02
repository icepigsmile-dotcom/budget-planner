import type { AppData } from '../types'
import { addMonths, currentMonth, todayIso } from '../lib/months'

/** Dữ liệu mẫu cho chế độ dùng thử (?demo=1) — dựa trên ví dụ trong mockup. */
export function demoData(): AppData {
  const now = currentMonth()
  const iso = todayIso()
  const staleIso = new Date(Date.now() - 34 * 86400000).toISOString()
  return {
    items: [
      {
        id: 'demo-iphone', name: 'iPhone 17 Pro 256GB', category: 'Điện tử', description: 'Màu titan tự nhiên',
        priority: 'High', estimatedPrice: 34_590_000, quantity: 1, chosenQuoteId: '', targetMonth: addMonths(now, 7),
        status: 'Saving', icon: '📱', imageUrl: '', note: '', purchasedAt: '', purchasedPrice: 0, createdAt: iso, updatedAt: iso,
      },
      {
        id: 'demo-mayloc', name: 'Máy lọc không khí Xiaomi 4 Pro', category: 'Gia dụng', description: 'Bản quốc tế, màu trắng',
        priority: 'Medium', estimatedPrice: 8_000_000, quantity: 1, chosenQuoteId: 'demo-q1', targetMonth: addMonths(now, 4),
        status: 'Saving', icon: '💨', imageUrl: '', note: 'Chờ sale 11/11 nếu kịp', purchasedAt: '', purchasedPrice: 0, createdAt: iso, updatedAt: iso,
      },
      {
        id: 'demo-ghe', name: 'Ghế công thái học Epione', category: 'Nội thất', description: '',
        priority: 'Low', estimatedPrice: 6_490_000, quantity: 2, chosenQuoteId: 'demo-q5', targetMonth: addMonths(now, 3),
        status: 'Saving', icon: '🪑', imageUrl: '', note: '', purchasedAt: '', purchasedPrice: 0, createdAt: iso, updatedAt: iso,
      },
    ],
    quotes: [
      { id: 'demo-q1', itemId: 'demo-mayloc', seller: 'Tiki Trading', price: 8_000_000, url: '', rating: 4.8, reviewCount: 2140, reviewSummary: 'Giao nhanh, hàng chính hãng', promo: 'Giảm 5% thẻ VIB', fetchedAt: iso, isManual: true, isChosen: true },
      { id: 'demo-q2', itemId: 'demo-mayloc', seller: 'Shopee Mall', price: 7_890_000, url: '', rating: 4.6, reviewCount: 870, reviewSummary: '', promo: 'Voucher 200k', fetchedAt: iso, isManual: true, isChosen: false },
      { id: 'demo-q3', itemId: 'demo-mayloc', seller: 'Điện Máy Xanh', price: 8_190_000, url: '', rating: 4.9, reviewCount: 3410, reviewSummary: '', promo: 'Trả góp 0%', fetchedAt: iso, isManual: true, isChosen: false },
      { id: 'demo-q4', itemId: 'demo-mayloc', seller: 'Shopee Mall', price: 8_150_000, url: '', rating: 4.6, reviewCount: 820, reviewSummary: '', promo: '', fetchedAt: new Date(Date.now() - 60 * 86400000).toISOString(), isManual: true, isChosen: false },
      { id: 'demo-q5', itemId: 'demo-ghe', seller: 'Trang chính hãng', price: 6_490_000, url: '', rating: 4.7, reviewCount: 512, reviewSummary: '', promo: '', fetchedAt: staleIso, isManual: true, isChosen: true },
    ],
    savings: [
      { month: addMonths(now, 1), plannedAmount: 1_500_000, note: '' },
      { month: addMonths(now, 2), plannedAmount: 2_000_000, note: '' },
      { month: addMonths(now, 3), plannedAmount: 1_500_000, note: '' },
      { month: addMonths(now, 4), plannedAmount: 2_000_000, note: '' },
    ],
    settings: { openingBalance: 12_000_000, defaultSaving: 2_000_000, theme: 'pastel' },
  }
}
