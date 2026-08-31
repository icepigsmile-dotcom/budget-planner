import { useMemo, useState } from 'react'
import { useApp } from '../store/app-context'
import { computePlan } from '../lib/feasibility'
import { currentMonth } from '../lib/months'
import { CATEGORIES, PRIORITY_LABEL, STATUS_LABEL, type ItemStatus, type Priority } from '../types'
import { ItemCard } from '../components/item-card'
import { EmptyState } from '../components/ui'
import { CatMascot } from '../components/mascot'

const ALL = 'Tất cả'

export function ItemsPage({ onOpenItem, onAddItem }: { onOpenItem: (id: string) => void; onAddItem: () => void }) {
  const { data } = useApp()
  const plan = useMemo(() => computePlan(data, currentMonth()), [data])
  const theme = data.settings.theme
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(ALL)
  const [priority, setPriority] = useState(ALL)
  const [status, setStatus] = useState(ALL)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const statusOrder: ItemStatus[] = ['Saving', 'ReadyToBuy', 'Idea', 'Purchased', 'Skipped']
    return data.items
      .filter((i) =>
        (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) &&
        (category === ALL || i.category === category) &&
        (priority === ALL || PRIORITY_LABEL[i.priority] === priority) &&
        (status === ALL || STATUS_LABEL[i.status] === status),
      )
      .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || (a.targetMonth || '9999') .localeCompare(b.targetMonth || '9999'))
  }, [data.items, search, category, priority, status])

  const selectStyle = { width: 'auto', padding: '8px 12px', borderRadius: 999, fontSize: 12.5 } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <div className="row-between">
        <h1 className="page-title">Món đồ <span className="muted" style={{ fontSize: 14, fontWeight: 500 }}>· {data.items.length} món</span></h1>
        <button className="btn btn-primary hide-mobile" onClick={onAddItem}>+ Thêm món đồ</button>
      </div>
      <input className="input" style={{ borderRadius: 999 }} placeholder="Tìm món đồ…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="input" style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>{ALL}</option>
          {Object.values(STATUS_LABEL).map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={selectStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>{ALL}</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" style={selectStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>{ALL}</option>
          {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => <option key={p}>{PRIORITY_LABEL[p]}</option>)}
        </select>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={theme === 'pastel' ? <CatMascot size={54} /> : <span style={{ fontSize: 32, color: 'var(--text-3)' }}>＋</span>}
          title="Danh sách trống"
          body='Bấm "+ Thêm món đồ" để bắt đầu — ví dụ chiếc điện thoại mới hoặc máy lọc không khí.'
          action={<button className="btn btn-primary" onClick={onAddItem}>+ Thêm món đồ</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<span style={{ fontSize: 30 }}>🔍</span>} title="Không có món nào khớp bộ lọc" body="Thử xóa bớt điều kiện lọc hoặc tìm từ khóa khác." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item) => (
            <div key={item.id} style={{ opacity: item.status === 'Purchased' || item.status === 'Skipped' ? 0.62 : 1 }}>
              <ItemCard item={item} plan={plan.byItem[item.id]} theme={theme} onClick={() => onOpenItem(item.id)} />
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary hide-desktop"
        onClick={onAddItem}
        style={{ position: 'fixed', right: 20, bottom: 88, height: 52, borderRadius: 26, boxShadow: 'var(--shadow-fab)', zIndex: 30 }}
      >
        + Thêm món
      </button>
    </div>
  )
}
