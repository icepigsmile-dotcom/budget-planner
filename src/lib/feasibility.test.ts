import { describe, expect, it } from 'vitest'
import { computePlan, sortForAllocation } from './feasibility'
import type { AppData, Item } from '../types'

const NOW = '2026-08'

function makeItem(over: Partial<Item>): Item {
  return {
    id: over.id ?? 'item-1',
    name: 'x', category: 'Khác', description: '',
    priority: 'Medium', estimatedPrice: 0, quantity: 1, chosenQuoteId: '',
    targetMonth: '', status: 'Saving', icon: '', imageUrl: '', note: '',
    purchasedAt: '', purchasedPrice: 0,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    ...over,
  }
}

function makeData(items: Item[], savings: [string, number][], opening = 0, defaultSaving = 0): AppData {
  return {
    items,
    quotes: [],
    savings: savings.map(([month, plannedAmount]) => ({ month, plannedAmount, note: '' })),
    settings: { openingBalance: opening, defaultSaving, theme: 'pastel' },
  }
}

describe('ví dụ trong spec: máy lọc 8tr, mong muốn 12/2026', () => {
  // Tiết kiệm: 09→1,5tr; 10→2tr; 11→1,5tr; 12→2tr. Tổng 7tr, thiếu 1tr.
  const data = makeData(
    [makeItem({ id: 'may-loc', estimatedPrice: 8_000_000, targetMonth: '2026-12' })],
    [['2026-09', 1_500_000], ['2026-10', 2_000_000], ['2026-11', 1_500_000], ['2026-12', 2_000_000], ['2027-01', 1_500_000]],
  )
  const plan = computePlan(data, NOW)
  const p = plan.byItem['may-loc']

  it('kết luận không khả thi, thiếu đúng 1.000.000', () => {
    expect(p.feasible).toBe(false)
    expect(p.shortfallAtTarget).toBe(1_000_000)
  })
  it('đề xuất 1: dời sang 01/2027', () => {
    expect(p.suggestMonth).toBe('2027-01')
  })
  it('đề xuất 2: thêm 250.000/tháng (4 tháng còn lại)', () => {
    expect(p.suggestExtraPerMonth).toBe(250_000)
  })
  it('bảng tháng: chênh lệch −1tr đúng tại 12/2026', () => {
    const dec = plan.months.find((m) => m.month === '2026-12')!
    expect(dec.diff).toBe(-1_000_000)
    expect(plan.months.filter((m) => m.diff < 0)).toHaveLength(1)
  })
})

describe('phân bổ tuần tự nhiều món', () => {
  it('món có thời điểm sớm hơn được rót trước; món sau bị đẩy lùi', () => {
    const data = makeData(
      [
        makeItem({ id: 'a', estimatedPrice: 3_000_000, targetMonth: '2026-10' }),
        makeItem({ id: 'b', estimatedPrice: 3_000_000, targetMonth: '2026-12' }),
      ],
      [], 0, 1_000_000, // mặc định 1tr/tháng, tháng 8 hiện tại cũng tính 1tr
    )
    const plan = computePlan(data, NOW)
    // quỹ: 08→1tr, 09→2tr, 10→3tr, 11→4tr, 12→5tr, 01→6tr
    expect(plan.byItem['a'].fundedMonth).toBe('2026-10')
    expect(plan.byItem['a'].feasible).toBe(true)
    expect(plan.byItem['b'].fundedMonth).toBe('2027-01') // cần cộng dồn 6tr
    expect(plan.byItem['b'].feasible).toBe(false)
  })

  it('trùng thời điểm: ưu tiên cao trước; trùng nữa: tạo trước trước', () => {
    const items = [
      makeItem({ id: 'low', priority: 'Low', targetMonth: '2026-12', createdAt: '2026-01-01' }),
      makeItem({ id: 'high', priority: 'High', targetMonth: '2026-12', createdAt: '2026-03-01' }),
      makeItem({ id: 'high2', priority: 'High', targetMonth: '2026-12', createdAt: '2026-04-01' }),
    ]
    const order = sortForAllocation(items).map((i) => i.id)
    expect(order).toEqual(['high', 'high2', 'low'])
  })
})

describe('món đã mua trừ khỏi tích lũy', () => {
  it('availableNow giảm đúng giá mua thực tế', () => {
    const data = makeData(
      [
        makeItem({ id: 'bought', status: 'Purchased', purchasedPrice: 2_000_000, estimatedPrice: 2_500_000 }),
        makeItem({ id: 'active', estimatedPrice: 5_000_000, targetMonth: '2026-12' }),
      ],
      [['2026-07', 3_000_000], ['2026-08', 2_000_000]],
      1_000_000,
    )
    const plan = computePlan(data, NOW)
    // 1tr khởi điểm + 3tr (07) + 2tr (08) − 2tr đã mua = 4tr
    expect(plan.availableNow).toBe(4_000_000)
    expect(plan.byItem['active'].allocatedNow).toBe(4_000_000)
  })
})

describe('số lượng nhiều hơn 1', () => {
  it('mục tiêu tiết kiệm = đơn giá × số lượng', () => {
    // 2 ghế × 3tr = 6tr; quỹ: khởi điểm 1tr + 1tr/tháng (08 hiện tại đã tính) — đủ ở tháng thứ 4 sau hiện tại
    const data = makeData(
      [makeItem({ id: 'ghe', estimatedPrice: 3_000_000, quantity: 2, targetMonth: '2026-10' })],
      [], 1_000_000, 1_000_000,
    )
    const plan = computePlan(data, NOW)
    const p = plan.byItem['ghe']
    expect(p.price).toBe(6_000_000)
    expect(plan.totalTarget).toBe(6_000_000)
    // quỹ: 08→2tr, 09→3tr, 10→4tr, 11→5tr, 12→6tr
    expect(p.fundedMonth).toBe('2026-12')
    expect(p.feasible).toBe(false)
    expect(p.shortfallAtTarget).toBe(2_000_000)
  })
})

describe('món chưa đặt thời điểm mong muốn', () => {
  it('không ra NaN, không kết luận khả thi, không đề xuất', () => {
    const data = makeData(
      [makeItem({ id: 'no-target', estimatedPrice: 5_000_000, targetMonth: '', status: 'ReadyToBuy' })],
      [], 2_000_000,
    )
    const p = computePlan(data, NOW).byItem['no-target']
    expect(p.hasTarget).toBe(false)
    expect(p.feasible).toBe(false)
    expect(Number.isFinite(p.neededPerMonth)).toBe(true)
    expect(p.neededPerMonth).toBe(0)
    expect(p.suggestMonth).toBeNull()
    expect(p.suggestExtraPerMonth).toBe(0)
    expect(p.allocatedNow).toBe(2_000_000)
  })
})

describe('mức mặc định cho tháng chưa nhập', () => {
  it('tháng tương lai không có dòng khai báo dùng defaultSaving, tháng quá khứ thì không', () => {
    const data = makeData(
      [makeItem({ id: 'x', estimatedPrice: 10_000_000, targetMonth: '2027-06' })],
      [['2026-09', 2_000_000]],
      0,
      1_000_000,
    )
    const plan = computePlan(data, NOW)
    const oct = plan.months.find((m) => m.month === '2026-10')!
    expect(oct.planned).toBe(1_000_000)
    expect(oct.isDefault).toBe(true)
    const sep = plan.months.find((m) => m.month === '2026-09')!
    expect(sep.planned).toBe(2_000_000)
    expect(sep.isDefault).toBe(false)
  })
})
