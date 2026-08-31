import type { AppData, Item } from '../types'
import { ceilThousand } from './money'
import { addMonths, compareMonth, monthDiff } from './months'

export interface ItemPlan {
  itemId: string
  price: number
  allocatedNow: number
  neededPerMonth: number
  fundedMonth: string | null
  hasTarget: boolean
  feasible: boolean
  shortfallAtTarget: number
  suggestMonth: string | null
  suggestExtraPerMonth: number
}

export interface MonthPlan {
  month: string
  planned: number
  isDefault: boolean
  allocated: number
  diff: number
}

export interface PlanResult {
  byItem: Record<string, ItemPlan>
  months: MonthPlan[]
  cumulative: { month: string; funds: number }[]
  activeItems: Item[]
  totalTarget: number
  availableNow: number
  plannedThisMonth: number
}

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const
const HORIZON_EXTRA = 60

/** Allocation order: earlier target first, then higher priority, then created first. */
export function sortForAllocation(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const ta = a.targetMonth || '9999-12'
    const tb = b.targetMonth || '9999-12'
    if (ta !== tb) return compareMonth(ta, tb)
    if (a.priority !== b.priority) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    return a.createdAt < b.createdAt ? -1 : 1
  })
}

export function computePlan(data: AppData, now: string, tableMonths = 18): PlanResult {
  const explicit = new Map(data.savings.map((s) => [s.month, s.plannedAmount]))
  const planned = (m: string): number =>
    explicit.get(m) ?? (compareMonth(m, now) >= 0 ? data.settings.defaultSaving : 0)

  const purchasedTotal = data.items
    .filter((i) => i.status === 'Purchased')
    .reduce((sum, i) => sum + (i.purchasedPrice || 0), 0)

  // funds available now = opening balance + all planned savings up to this month − money already spent
  const pastMonths = data.savings.filter((s) => compareMonth(s.month, now) < 0)
  const availableNow =
    data.settings.openingBalance +
    pastMonths.reduce((s, r) => s + r.plannedAmount, 0) +
    planned(now) -
    purchasedTotal

  const active = sortForAllocation(data.items.filter((i) => i.status === 'Saving' || i.status === 'ReadyToBuy'))
  const totalTarget = active.reduce((s, i) => s + i.estimatedPrice, 0)

  const lastTarget = active.reduce((max, i) => (i.targetMonth > max ? i.targetMonth : max), now)
  const horizon = monthDiff(now, lastTarget) + HORIZON_EXTRA

  // cumulative funds month by month from now
  const funds: number[] = []
  let acc = availableNow
  funds.push(acc)
  for (let k = 1; k <= horizon; k++) {
    acc += planned(addMonths(now, k))
    funds.push(acc)
  }
  const fundsAt = (m: string): number => {
    const d = monthDiff(now, m)
    if (d < 0) return availableNow
    return funds[Math.min(d, horizon)]
  }

  // sequential fill: item i is funded when cumulative funds cover the sum of prices up to i
  const byItem: Record<string, ItemPlan> = {}
  let cumBefore = 0
  for (const item of active) {
    const cum = cumBefore + item.estimatedPrice
    let fundedMonth: string | null = null
    for (let k = 0; k <= horizon; k++) {
      if (funds[k] >= cum) {
        fundedMonth = addMonths(now, k)
        break
      }
    }
    const allocatedNow = Math.min(Math.max(availableNow - cumBefore, 0), item.estimatedPrice)
    const target = item.targetMonth
    const hasTarget = !!target
    // chưa đặt thời điểm thì không có kết luận khả thi — coi remaining = 1 chỉ để tránh chia cho NaN
    const remaining = hasTarget ? Math.max(monthDiff(now, target), 1) : 1
    const shortfall = hasTarget ? Math.max(0, cum - fundsAt(target)) : 0
    const feasible = hasTarget && fundedMonth !== null && compareMonth(fundedMonth, target) <= 0
    byItem[item.id] = {
      itemId: item.id,
      price: item.estimatedPrice,
      allocatedNow,
      neededPerMonth: hasTarget ? ceilThousand(Math.max(item.estimatedPrice - allocatedNow, 0) / remaining) : 0,
      fundedMonth,
      hasTarget,
      feasible,
      shortfallAtTarget: shortfall,
      suggestMonth: feasible || !hasTarget ? null : fundedMonth,
      suggestExtraPerMonth: feasible || !hasTarget ? 0 : ceilThousand(shortfall / remaining),
    }
    cumBefore = cum
  }

  // per-month table: how much of the inflow is consumed + shortfalls falling due
  const months: MonthPlan[] = []
  let remainingNeed = Math.max(totalTarget - availableNow, 0)
  for (let k = 1; k <= tableMonths; k++) {
    const m = addMonths(now, k)
    const p = planned(m)
    const consumed = Math.min(p, remainingNeed)
    remainingNeed -= consumed
    const shortfallDue = active
      .filter((i) => i.targetMonth === m)
      .reduce((s, i) => s + (byItem[i.id]?.feasible ? 0 : byItem[i.id]?.shortfallAtTarget ?? 0), 0)
    months.push({
      month: m,
      planned: p,
      isDefault: !explicit.has(m),
      allocated: consumed + shortfallDue,
      diff: -shortfallDue,
    })
  }

  const chartLen = Math.min(Math.max(monthDiff(now, lastTarget) + 2, tableMonths), horizon)
  const cumulative = Array.from({ length: chartLen + 1 }, (_, k) => ({
    month: addMonths(now, k),
    funds: funds[k],
  }))

  return { byItem, months, cumulative, activeItems: active, totalTarget, availableNow, plannedThisMonth: planned(now) }
}
