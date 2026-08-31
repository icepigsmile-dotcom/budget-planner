import { useEffect, useState, type ReactNode } from 'react'
import { formatVnd, parseVnd } from '../lib/money'
import { displayMonth } from '../lib/months'
import type { ItemPlan } from '../lib/feasibility'

export function ProgressBar({ percent, warn }: { percent: number; warn?: boolean }) {
  const w = Math.max(0, Math.min(100, percent))
  return (
    <div className={`progress${warn ? ' warn' : ''}`}>
      <div style={{ width: `${w}%` }} />
    </div>
  )
}

/** Huy hiệu khả thi: ✓ Khả thi · MM/YYYY hoặc ⚠ Thiếu X ₫ */
export function FeasibilityBadge({ plan }: { plan: ItemPlan | undefined }) {
  if (!plan) return <span className="faint">—</span>
  if (!plan.hasTarget) return <span className="chip chip-muted">chưa đặt thời điểm</span>
  if (plan.feasible) {
    return <span className="chip chip-ok">✓ Khả thi · {displayMonth(plan.fundedMonth ?? '')}</span>
  }
  return <span className="chip chip-warn">⚠ Thiếu {formatVnd(plan.shortfallAtTarget)}</span>
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} aria-label="Đóng" style={{ fontSize: 18, color: 'var(--text-3)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Ô nhập tiền: hiển thị định dạng 12.500.000, chấp nhận "12,5tr". */
export function MoneyInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  const [text, setText] = useState(value ? value.toLocaleString('vi-VN') : '')
  useEffect(() => {
    setText(value ? value.toLocaleString('vi-VN') : '')
  }, [value])
  return (
    <input
      className="input num"
      inputMode="numeric"
      placeholder={placeholder ?? '0'}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const n = parseVnd(text)
        onChange(n)
        setText(n ? n.toLocaleString('vi-VN') : '')
      }}
    />
  )
}

/** Ô chọn tháng YYYY-MM dùng input type=month. */
export function MonthInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className="input"
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Stars({ rating, count }: { rating: number; count: number }) {
  if (!rating) return <span className="faint">—</span>
  return (
    <span style={{ color: 'var(--star)', fontWeight: 600, fontSize: 12.5 }}>
      ★ {rating.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}{' '}
      {count > 0 && <span className="faint" style={{ fontWeight: 400 }}>({count.toLocaleString('vi-VN')})</span>}
    </span>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '56px 40px' }}>
      <div style={{ width: 96, height: 96, borderRadius: 36, background: 'var(--card)', border: '1px solid var(--card-border)', display: 'grid', placeItems: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 18 }}>{title}</div>
      <div className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.6, maxWidth: 300 }}>{body}</div>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}
