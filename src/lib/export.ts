import type { AppData } from '../types'
import { itemTotal, PRIORITY_LABEL, STATUS_LABEL } from '../types'

const UTF8_BOM = String.fromCharCode(0xfeff) // để Excel nhận đúng tiếng Việt khi mở CSV

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function csvRows(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\n')
}

/** Tải bản sao toàn bộ dữ liệu dạng JSON (đúng định dạng file trong repo). */
export function exportJson(data: AppData): void {
  const stamp = new Date().toISOString().slice(0, 10)
  download(`budget-data-${stamp}.json`, JSON.stringify(data, null, 2), 'application/json')
}

/** Xuất CSV mở được bằng Excel. */
export function exportCsv(data: AppData): void {
  const stamp = new Date().toISOString().slice(0, 10)
  const lines: string[] = []
  lines.push('MÓN ĐỒ')
  lines.push(csvRows([
    ['Tên', 'Danh mục', 'Ưu tiên', 'Đơn giá', 'Số lượng', 'Thành tiền', 'Mong muốn có', 'Trạng thái', 'Ngày mua', 'Giá mua thực tế', 'Ghi chú'],
    ...data.items.map((i) => [i.name, i.category, PRIORITY_LABEL[i.priority], i.estimatedPrice, i.quantity, itemTotal(i), i.targetMonth, STATUS_LABEL[i.status], i.purchasedAt, i.purchasedPrice, i.note] as (string | number)[]),
  ]))
  lines.push('')
  lines.push('BÁO GIÁ')
  lines.push(csvRows([
    ['Món đồ', 'Nơi bán', 'Giá', 'Sao', 'Lượt đánh giá', 'Khuyến mãi', 'Ngày lấy giá', 'Đã chọn', 'Link'],
    ...data.quotes.map((q) => {
      const item = data.items.find((i) => i.id === q.itemId)
      return [item?.name ?? q.itemId, q.seller, q.price, q.rating, q.reviewCount, q.promo, q.fetchedAt.slice(0, 10), q.isChosen ? 'x' : '', q.url] as (string | number)[]
    }),
  ]))
  lines.push('')
  lines.push('TIẾT KIỆM THEO THÁNG')
  lines.push(csvRows([
    ['Tháng', 'Khai báo', 'Ghi chú'],
    ...data.savings.map((s) => [s.month, s.plannedAmount, s.note] as (string | number)[]),
  ]))
  download(`budget-plan-${stamp}.csv`, UTF8_BOM + lines.join('\n'), 'text/csv;charset=utf-8')
}
