import { describe, expect, it } from 'vitest'
import { normalizeData } from './normalize'
import { safeHttpUrl } from './sanitize'

describe('safeHttpUrl — chặn link độc', () => {
  it('cho qua http/https, chặn mọi scheme khác', () => {
    expect(safeHttpUrl('https://tiki.vn/x')).toBe('https://tiki.vn/x')
    expect(safeHttpUrl('javascript:alert(1)')).toBe('')
    expect(safeHttpUrl('data:text/html,x')).toBe('')
    expect(safeHttpUrl('not a url')).toBe('')
    expect(safeHttpUrl('')).toBe('')
  })
})

describe('normalizeData — file JSON bị sửa tay không làm app chết', () => {
  it('priority/status sai chuẩn hóa về mặc định, chấp nhận khác hoa thường', () => {
    const data = normalizeData({
      items: [
        { id: 'i1', name: 'x', priority: 'high', status: 'saving', estimatedPrice: 1000 },
        { id: 'i2', name: 'y', priority: 'RẤT CAO', status: 'linh tinh', estimatedPrice: '2000' },
        { name: 'không có id — bị loại' },
      ],
    })
    expect(data.items).toHaveLength(2)
    expect(data.items[0].priority).toBe('High')
    expect(data.items[0].status).toBe('Saving')
    expect(data.items[1].priority).toBe('Medium')
    expect(data.items[1].status).toBe('Idea')
    expect(data.items[1].estimatedPrice).toBe(2000)
  })

  it('url độc bị loại; rating kẹp 0–5; thiếu mảng nào thì thành mảng rỗng', () => {
    const data = normalizeData({
      quotes: [
        { id: 'q1', itemId: 'i1', seller: 'Shopee', price: 100, url: 'javascript:alert(1)', rating: 45 },
        { id: 'q2', itemId: 'i1', seller: 'Tiki', price: 100, url: 'https://tiki.vn/p', rating: 4.5 },
      ],
      settings: { theme: 'minimal', openingBalance: 'abc' },
    })
    expect(data.quotes[0].url).toBe('')
    expect(data.quotes[0].rating).toBe(5)
    expect(data.quotes[1].url).toBe('https://tiki.vn/p')
    expect(data.items).toEqual([])
    expect(data.savings).toEqual([])
    expect(data.settings.theme).toBe('minimal')
    expect(data.settings.openingBalance).toBe(0)
  })

  it('dữ liệu hoàn toàn rỗng/hỏng vẫn ra cấu trúc hợp lệ', () => {
    expect(normalizeData(null).items).toEqual([])
    expect(normalizeData('xyz').settings.theme).toBe('pastel')
  })
})
