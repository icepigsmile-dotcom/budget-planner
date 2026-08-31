import { useMemo, useState } from 'react'
import { useApp } from '../store/app-context'
import { computePlan } from '../lib/feasibility'
import { currentMonth, displayMonth } from '../lib/months'
import { formatVnd, parseVnd } from '../lib/money'
import { CumulativeChart } from '../components/charts'
import * as act from '../store/actions'

function MonthAmountCell({ value, isDefault, onCommit }: { value: number; isDefault: boolean; onCommit: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  if (!editing) {
    return (
      <button
        className="num"
        onClick={() => { setText(value ? value.toLocaleString('vi-VN') : ''); setEditing(true) }}
        style={{
          textAlign: 'right', width: '100%', fontWeight: isDefault ? 500 : 700,
          color: isDefault ? 'var(--text-3)' : 'var(--text)',
          borderBottom: '1.5px dashed var(--input-border)', paddingBottom: 2,
        }}
        title="Bấm để sửa"
      >
        {value.toLocaleString('vi-VN')}{isDefault ? '*' : ''}
      </button>
    )
  }
  return (
    <input
      className="input num"
      autoFocus
      inputMode="numeric"
      style={{ padding: '4px 8px', textAlign: 'right', fontSize: 12.5 }}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => { onCommit(parseVnd(text)); setEditing(false) }}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
    />
  )
}

export function SavingsPage() {
  const { data, mutate } = useApp()
  const now = currentMonth()
  const plan = useMemo(() => computePlan(data, now, 18), [data, now])
  const markers = plan.activeItems
    .filter((i) => i.targetMonth)
    .map((i) => ({ month: i.targetMonth, label: i.name.split(' ')[0], warn: !plan.byItem[i.id]?.feasible }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 className="page-title">Kế hoạch tiết kiệm</h1>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '13px 16px', flex: '1 1 220px', maxWidth: 280 }}>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Số dư khởi điểm</div>
          <div style={{ marginTop: 4 }}>
            <MonthAmountCell value={data.settings.openingBalance} isDefault={false}
              onCommit={(v) => mutate((d) => act.updateSettings(d, { openingBalance: v }))} />
          </div>
        </div>
        <div className="card" style={{ padding: '13px 16px', flex: '1 1 220px', maxWidth: 280 }}>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Mức mặc định mỗi tháng</div>
          <div style={{ marginTop: 4 }}>
            <MonthAmountCell value={data.settings.defaultSaving} isDefault={false}
              onCommit={(v) => mutate((d) => act.updateSettings(d, { defaultSaving: v }))} />
          </div>
          <div className="faint" style={{ fontSize: 10.5, marginTop: 3 }}>Tự áp dụng cho tháng chưa nhập</div>
        </div>
      </div>

      <div className="savings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '86px 1fr 1fr 1fr', gap: 10, padding: '10px 18px' }}>
            <span>Tháng</span><span style={{ textAlign: 'right' }}>Khai báo</span>
            <span style={{ textAlign: 'right' }}>Phân bổ</span><span style={{ textAlign: 'right' }}>Chênh lệch</span>
          </div>
          {plan.months.map((m) => {
            const hasMilestone = plan.activeItems.some((i) => i.targetMonth === m.month)
            return (
              <div key={m.month}
                style={{ display: 'grid', gridTemplateColumns: '86px 1fr 1fr 1fr', gap: 10, alignItems: 'center', padding: '10px 18px', borderTop: '1px solid var(--row-border)', fontSize: 12.5, background: m.diff < 0 ? 'var(--warn-bg)' : 'transparent' }}>
                <span style={{ fontWeight: 700 }}>
                  {displayMonth(m.month)}{hasMilestone && <span style={{ fontSize: 9, color: m.diff < 0 ? 'var(--warn)' : 'var(--ok)' }}> ●</span>}
                </span>
                <MonthAmountCell value={m.planned} isDefault={m.isDefault}
                  onCommit={(v) => mutate((d) => act.setSavingMonth(d, m.month, v))} />
                <span className="num" style={{ textAlign: 'right', color: m.diff < 0 ? 'var(--warn)' : 'var(--text-2)', fontWeight: m.diff < 0 ? 700 : 400 }}>
                  {m.allocated.toLocaleString('vi-VN')}
                </span>
                <span className="num" style={{ textAlign: 'right', color: m.diff < 0 ? 'var(--warn)' : 'var(--text-3)', fontWeight: m.diff < 0 ? 700 : 400 }}>
                  {m.diff < 0 ? `−${Math.abs(m.diff).toLocaleString('vi-VN')}` : '0'}
                </span>
              </div>
            )
          })}
          <div className="faint" style={{ padding: '10px 18px', borderTop: '1px solid var(--row-border)', fontSize: 10.5 }}>
            * mức mặc định — bấm vào ô để sửa · ● mốc cần tiền của món đồ · chênh lệch âm = tháng đó thiếu tiền cho món đến hạn
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Tích lũy cộng dồn</div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
            Hiện có {formatVnd(Math.max(plan.availableNow, 0))} · mục tiêu {formatVnd(plan.totalTarget)}
          </div>
          <div style={{ marginTop: 10 }}>
            <CumulativeChart points={plan.cumulative} markers={markers} />
          </div>
        </div>
      </div>
    </div>
  )
}
