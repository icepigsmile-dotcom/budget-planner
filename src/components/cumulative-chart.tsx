import { useState } from 'react'
import { formatVnd, formatVndShort } from '../lib/money'
import { displayMonth, displayMonthShort } from '../lib/months'

export interface MilestoneItem {
  icon: string
  name: string
  total: number
  feasible: boolean
}

export interface Milestone {
  month: string
  items: MilestoneItem[]
}

function scale(min: number, max: number, v: number, lo: number, hi: number): number {
  if (max === min) return (lo + hi) / 2
  return lo + ((v - min) / (max - min)) * (hi - lo)
}

/**
 * Biểu đồ tích lũy cộng dồn (M5). Mốc cần tiền của món đồ hiển thị bằng thẻ tròn nhỏ —
 * lia chuột (desktop) hoặc chạm (điện thoại) vào thẻ mới hiện danh sách món đạt được tháng đó.
 */
export function CumulativeChart({ points, milestones }: { points: { month: string; funds: number }[]; milestones: Milestone[] }) {
  const [active, setActive] = useState<string | null>(null)
  if (points.length < 2) return null

  const W = 640, H = 220, L = 48, R = 14, T = 30, B = 24
  const maxV = Math.max(...points.map((p) => p.funds), 1)
  const x = (i: number) => scale(0, points.length - 1, i, L, W - R)
  const y = (v: number) => scale(0, maxV * 1.08, v, H - B, T)
  const line = points.map((p, i) => `${x(i)},${y(p.funds)}`).join(' ')
  const area = `M${x(0)} ${y(points[0].funds)} ${points.map((p, i) => `L${x(i)} ${y(p.funds)}`).join(' ')} L${x(points.length - 1)} ${H - B} L${x(0)} ${H - B} Z`
  const monthIndex = new Map(points.map((p, i) => [p.month, i]))
  const shown = milestones.filter((m) => monthIndex.has(m.month))
  const activeMilestone = shown.find((m) => m.month === active)

  return (
    <div style={{ position: 'relative' }} onMouseLeave={() => setActive(null)} onClick={() => setActive(null)}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {[maxV, maxV / 2, maxV / 4].map((v) => (
          <g key={v}>
            <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="var(--row-border)" />
            <text x={L - 6} y={y(v) + 3} fontSize="9" fill="var(--text-3)" textAnchor="end">{formatVndShort(v)}</text>
          </g>
        ))}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--card-border)" />
        <path d={area} fill="var(--ok-bg)" opacity="0.8" />
        <polyline points={line} fill="none" stroke="var(--ok)" strokeWidth="2.4" />
        {shown.map((m) => {
          const i = monthIndex.get(m.month)!
          const warn = m.items.some((it) => !it.feasible)
          const color = warn ? 'var(--warn)' : 'var(--ok)'
          const isActive = active === m.month
          return (
            <g
              key={m.month}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setActive(m.month)}
              onClick={(e) => { e.stopPropagation(); setActive(m.month) }}
            >
              <line x1={x(i)} y1={T - 8} x2={x(i)} y2={H - B} stroke={color} strokeDasharray="4,4" opacity={isActive ? 1 : 0.55} />
              <circle cx={x(i)} cy={y(points[i].funds)} r="4" fill={color} />
              {/* thẻ đánh dấu: bấm/lia chuột để xem chi tiết */}
              <circle cx={x(i)} cy={T - 8} r={isActive ? 11 : 9.5} fill={color} opacity={isActive ? 1 : 0.9} />
              <text x={x(i)} y={T - 4.5} fontSize="10" fill="#fff" textAnchor="middle" fontWeight="700">
                {m.items.length}
              </text>
              {/* vùng bắt chuột rộng hơn thẻ cho dễ trúng */}
              <rect x={x(i) - 14} y={T - 22} width="28" height={H - T} fill="transparent" />
            </g>
          )
        })}
        <text x={L} y={H - 8} fontSize="9" fill="var(--text-3)">{displayMonthShort(points[0].month)}</text>
        <text x={W - R} y={H - 8} fontSize="9" fill="var(--text-3)" textAnchor="end">{displayMonthShort(points[points.length - 1].month)}</text>
      </svg>

      {activeMilestone && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `min(max(${((monthIndex.get(activeMilestone.month)! / (points.length - 1)) * 100).toFixed(1)}% - 90px, 0px), calc(100% - 190px))`,
            width: 185,
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 12,
            boxShadow: '0 8px 22px rgba(0,0,0,.14)',
            padding: '10px 12px',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800 }}>Tháng {displayMonth(activeMilestone.month)}</div>
          {activeMilestone.items.map((it) => (
            <div key={it.name} style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 5, fontSize: 11.5 }}>
              <span>{it.icon}</span>
              <span className="ellipsis" style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{it.name}</span>
              <span className="num" style={{ flex: 'none', color: it.feasible ? 'var(--ok)' : 'var(--warn)', fontWeight: 700 }}>
                {formatVnd(it.total)}
              </span>
            </div>
          ))}
          <div className="faint" style={{ fontSize: 9.5, marginTop: 5 }}>
            {activeMilestone.items.every((i) => i.feasible) ? '✓ Kịp mốc này theo kế hoạch' : '⚠ Có món chưa đủ tiền ở mốc này'}
          </div>
        </div>
      )}
      {shown.length > 0 && !activeMilestone && (
        <div className="faint" style={{ fontSize: 10, marginTop: 2 }}>Lia chuột / chạm vào thẻ số để xem món đạt được ở mốc đó</div>
      )}
    </div>
  )
}
