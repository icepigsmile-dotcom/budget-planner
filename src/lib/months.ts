/** Month keys are "YYYY-MM". Display format is "MM/YYYY". */

export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  return `${ny}-${String(nm).padStart(2, '0')}`
}

/** Number of months from a to b (b - a). Same month = 0. */
export function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number)
  const [by, bm] = b.split('-').map(Number)
  return (by - ay) * 12 + (bm - am)
}

export function compareMonth(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** "2026-12" -> "12/2026" */
export function displayMonth(month: string): string {
  if (!month) return '—'
  const [y, m] = month.split('-')
  return `${m}/${y}`
}

/** "2026-12" -> "12/26" (chart labels) */
export function displayMonthShort(month: string): string {
  const [y, m] = month.split('-')
  return `${m}/${y.slice(2)}`
}

export function monthRange(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(from, i))
}

export function isValidMonth(s: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(s)
}

export function todayIso(): string {
  return new Date().toISOString()
}
