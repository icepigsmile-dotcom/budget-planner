/** Format 12500000 -> "12.500.000 ₫" */
export function formatVnd(amount: number): string {
  if (!Number.isFinite(amount)) return '0 ₫'
  return `${Math.round(amount).toLocaleString('vi-VN')} ₫`
}

/** Short format for chart axes: 12500000 -> "12,5tr" */
export function formatVndShort(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) return `${(amount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tỷ`
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`
  if (Math.abs(amount) >= 1_000) return `${Math.round(amount / 1_000)}k`
  return String(Math.round(amount))
}

/** Parse user input "12.500.000" / "12500000" / "12,5tr" -> number */
export function parseVnd(input: string): number {
  const s = input.trim().toLowerCase().replace(/₫/g, '').trim()
  const trMatch = s.match(/^([\d.,]+)\s*(tr|m)$/)
  if (trMatch) return Math.round(parseFloat(trMatch[1].replace(/\./g, '').replace(',', '.')) * 1_000_000)
  const kMatch = s.match(/^([\d.,]+)\s*k$/)
  if (kMatch) return Math.round(parseFloat(kMatch[1].replace(/\./g, '').replace(',', '.')) * 1_000)
  const n = parseInt(s.replace(/[.,\s]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

/** Round up to the nearest 1.000 ₫ (for suggested extra saving per month) */
export function ceilThousand(amount: number): number {
  return Math.ceil(amount / 1000) * 1000
}
