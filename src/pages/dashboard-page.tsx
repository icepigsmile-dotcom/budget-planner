import { useMemo } from 'react'
import { useApp } from '../store/app-context'
import { computePlan } from '../lib/feasibility'
import { currentMonth, displayMonth } from '../lib/months'
import { formatVnd } from '../lib/money'
import { ItemCard } from '../components/item-card'
import { EmptyState } from '../components/ui'
import { BunnyMascot, CatMascot } from '../components/mascot'

const QUOTE_STALE_DAYS = 30

export function DashboardPage({ onOpenItem, onAddItem }: { onOpenItem: (id: string) => void; onAddItem: () => void }) {
  const { data, syncNow, syncStatus } = useApp()
  const now = currentMonth()
  const plan = useMemo(() => computePlan(data, now), [data, now])
  const theme = data.settings.theme
  const savingItems = plan.activeItems
  const infeasible = savingItems.filter((i) => !plan.byItem[i.id]?.feasible && i.targetMonth)
  const totalAllocated = savingItems.reduce((s, i) => s + (plan.byItem[i.id]?.allocatedNow ?? 0), 0)

  const staleQuotes = useMemo(() => {
    const cutoff = Date.now() - QUOTE_STALE_DAYS * 86400000
    return savingItems
      .map((item) => {
        const chosen = data.quotes.find((q) => q.id === item.chosenQuoteId)
        if (!chosen?.fetchedAt) return null
        const age = Date.parse(chosen.fetchedAt)
        if (Number.isNaN(age) || age >= cutoff) return null
        return { item, days: Math.floor((Date.now() - age) / 86400000) }
      })
      .filter((x): x is { item: (typeof savingItems)[number]; days: number } => x !== null)
  }, [savingItems, data.quotes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="row-between">
        <div>
          <h1 className="page-title">{theme === 'pastel' ? 'Chào bạn, hôm nay để dành chút nhé ✿' : 'Tổng quan'}</h1>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Tháng {displayMonth(now)} · {savingItems.length} món đang tiết kiệm</div>
        </div>
        <button className="btn btn-ghost hide-mobile" onClick={() => void syncNow()}>⟳ {syncStatus === 'syncing' ? 'Đang đồng bộ…' : 'Đồng bộ lại'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div style={{ background: 'var(--ok-bg)', borderRadius: 'var(--radius-card)', padding: '17px 19px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ok)' }}>Tổng giá trị đang tiết kiệm</div>
          <div className="num" style={{ fontSize: 23, fontWeight: 700, marginTop: 5, color: 'var(--ok-deep)' }}>{formatVnd(plan.totalTarget)}</div>
          <div style={{ fontSize: 12, color: 'var(--ok)', marginTop: 3, fontWeight: 600 }}>{savingItems.length} món đồ</div>
        </div>
        <div style={{ background: 'var(--stat2-bg)', borderRadius: 'var(--radius-card)', padding: '17px 19px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--stat2-text)', opacity: 0.8 }}>Đã tích lũy được</div>
          <div className="num" style={{ fontSize: 23, fontWeight: 700, marginTop: 5, color: 'var(--stat2-text)' }}>{formatVnd(Math.max(plan.availableNow, 0))}</div>
          <div className="progress" style={{ marginTop: 9, background: 'rgba(255,255,255,.35)' }}>
            <div style={{ width: `${plan.totalTarget > 0 ? Math.min((totalAllocated / plan.totalTarget) * 100, 100) : 0}%`, background: 'var(--stat2-accent)' }} />
          </div>
        </div>
        <div style={{ background: 'var(--stat3-bg)', border: theme === 'minimal' ? '1px solid var(--card-border)' : 'none', borderRadius: 'var(--radius-card)', padding: '17px 19px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--stat3-text)', opacity: 0.75 }}>Tiết kiệm khai báo tháng này</div>
          <div className="num" style={{ fontSize: 23, fontWeight: 700, marginTop: 5, color: 'var(--stat3-text)' }}>{formatVnd(plan.plannedThisMonth)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--stat3-text)', opacity: 0.75, marginTop: 3 }}>
            {infeasible.length === 0 && savingItems.length > 0 ? `Đã chia đủ cho ${savingItems.length} món ✓` : infeasible.length > 0 ? `${infeasible.length} món chưa đủ` : '—'}
          </div>
        </div>
      </div>

      {savingItems.length === 0 ? (
        <EmptyState
          icon={theme === 'pastel' ? <BunnyMascot size={54} /> : <span style={{ fontSize: 34, color: 'var(--ok)' }}>🎁︎</span>}
          title={theme === 'pastel' ? 'Chưa có bé nào trong danh sách' : 'Chưa có món nào đang tiết kiệm'}
          body="Thêm món đồ đầu tiên và đặt thời điểm mong muốn — app sẽ tính giúp bạn kế hoạch để dành."
          action={<button className="btn btn-primary" onClick={onAddItem}>+ Thêm món đồ</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 20 }} className="dash-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div className="section-title">Đang tiết kiệm</div>
            {savingItems.map((item) => (
              <ItemCard key={item.id} item={item} plan={plan.byItem[item.id]} theme={theme} onClick={() => onOpenItem(item.id)} />
            ))}
          </div>
          {(infeasible.length > 0 || staleQuotes.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div className="section-title">Cần chú ý</div>
              {infeasible.map((item) => {
                const p = plan.byItem[item.id]
                return (
                  <div key={item.id} style={{ background: 'var(--warn-bg)', borderRadius: 'var(--radius-card)', padding: '15px 17px', display: 'flex', gap: 10 }}>
                    {theme === 'pastel' && <span style={{ flex: 'none' }}><CatMascot size={32} tone="#F8D9BE" /></span>}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--warn-deep)' }}>
                        {theme === 'pastel' ? `Bé ${item.name.split(' ').slice(0, 2).join(' ')} chưa kịp về nhà!` : `⚠ ${item.name} không khả thi`}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--warn-deep)', opacity: 0.85, margin: '5px 0 9px', lineHeight: 1.5 }}>
                        Đến {displayMonth(item.targetMonth)} còn thiếu {formatVnd(p?.shortfallAtTarget ?? 0)} theo mức để dành hiện tại.
                      </div>
                      <button className="btn btn-warn" style={{ padding: '7px 13px', fontSize: 12 }} onClick={() => onOpenItem(item.id)}>Xem đề xuất</button>
                    </div>
                  </div>
                )
              })}
              {staleQuotes.map(({ item, days }) => (
                <div key={item.id} className="card" style={{ padding: '15px 17px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Báo giá đã cũ</div>
                  <div className="muted" style={{ fontSize: 12, margin: '5px 0 9px', lineHeight: 1.5 }}>
                    {item.name} — giá lấy cách đây {days} ngày. Nên cập nhật lại trước khi mua.
                  </div>
                  <button className="btn btn-outline" style={{ padding: '6px 13px', fontSize: 12 }} onClick={() => onOpenItem(item.id)}>Cập nhật báo giá</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
