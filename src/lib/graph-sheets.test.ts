import { describe, expect, it } from 'vitest'
import { rowsToItems, rowsToQuotes } from './graph-sheets'
import { safeHttpUrl } from './sanitize'

describe('safeHttpUrl — chặn link độc', () => {
  it('cho qua http/https, chặn mọi scheme khác', () => {
    expect(safeHttpUrl('https://tiki.vn/x')).toBe('https://tiki.vn/x')
    expect(safeHttpUrl('http://a.b')).toBe('http://a.b/')
    // eslint-disable-next-line no-script-url
    expect(safeHttpUrl('javascript:alert(1)')).toBe('')
    expect(safeHttpUrl('data:text/html,x')).toBe('')
    expect(safeHttpUrl('vbscript:x')).toBe('')
    expect(safeHttpUrl('not a url')).toBe('')
    expect(safeHttpUrl('')).toBe('')
  })
})

describe('đọc dữ liệu từ Excel — dữ liệu hỏng không làm app chết', () => {
  it('priority/status sai chuẩn hóa về mặc định, chấp nhận khác hoa thường', () => {
    const rows = [
      ['i1', 'x', 'Khác', '', 'high', 1000, '', '2026-12', 'saving', '', '', '', 0, '2026-01-01', '2026-01-01'],
      ['i2', 'y', 'Khác', '', 'RẤT CAO', 1000, '', '2026-12', 'linh tinh', '', '', '', 0, '2026-01-01', '2026-01-01'],
    ]
    const items = rowsToItems(rows as never)
    expect(items[0].priority).toBe('High')
    expect(items[0].status).toBe('Saving')
    expect(items[1].priority).toBe('Medium')
    expect(items[1].status).toBe('Idea')
  })

  it('url độc trong sheet bị loại; rating "4,5" dạng chữ đọc đúng và kẹp 0–5', () => {
    const rows = [
      ['q1', 'i1', 'Shopee', 100, 'javascript:alert(1)', '4,5', 10, '', '', '2026-01-01', 'TRUE', 'FALSE'],
      ['q2', 'i1', 'Tiki', 100, 'https://tiki.vn/p', 45, 10, '', '', '2026-01-01', 'TRUE', 'FALSE'],
    ]
    const quotes = rowsToQuotes(rows as never)
    expect(quotes[0].url).toBe('')
    expect(quotes[0].rating).toBe(4.5)
    expect(quotes[1].url).toBe('https://tiki.vn/p')
    expect(quotes[1].rating).toBe(5)
  })
})
