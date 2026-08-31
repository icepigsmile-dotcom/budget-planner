import { formatVndShort } from '../lib/money'
import { displayMonthShort } from '../lib/months'

interface Marker { month: string; label: string; warn?: boolean }
const SERIES_COLORS = ['var(--ok)', 'var(--warn)', 'var(--lav)', 'var(--primary-deep)', 'var(--gold)']

function scale(min: number, max: number, v: number, lo: number, hi: number): number {
  if (max === min) return (lo + hi) / 2
  return lo + ((v - min) / (max - min)) * (hi - lo)
}

/** Biểu đồ tích lũy cộng dồn + mốc cần tiền của từng món (M5). */
export function CumulativeChart({ points, markers }: { points: { month: string; funds: number }[]; markers: Marker[] }) {
  if (points.length < 2) return null
  const W = 640, H = 230, L = 48, R = 12, T = 34, B = 26
  const maxV = Math.max(...points.map((p) => p.funds), 1)
  const x = (i: number) => scale(0, points.length - 1, i, L, W - R)
  const y = (v: number) => scale(0, maxV * 1.08, v, H - B, T)
  const line = points.map((p, i) => `${x(i)},${y(p.funds)}`).join(' ')
  const area = `M${x(0)} ${y(points[0].funds)} ${points.map((p, i) => `L${x(i)} ${y(p.funds)}`).join(' ')} L${x(points.length - 1)} ${H - B} L${x(0)} ${H - B} Z`
  const gridVals = [maxV, maxV / 2, maxV / 4]
  const monthIndex = new Map(points.map((p, i) => [p.month, i]))
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="var(--row-border)" />
          <text x={L - 6} y={y(v) + 3} fontSize="9" fill="var(--text-3)" textAnchor="end">{formatVndShort(v)}</text>
        </g>
      ))}
      <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--card-border)" />
      <path d={area} fill="var(--ok-bg)" opacity="0.8" />
      <polyline points={line} fill="none" stroke="var(--ok)" strokeWidth="2.4" />
      {markers.map((m) => {
        const i = monthIndex.get(m.month)
        if (i === undefined) return null
        const color = m.warn ? 'var(--warn)' : 'var(--ok)'
        return (
          <g key={m.month + m.label}>
            <line x1={x(i)} y1={T + 6} x2={x(i)} y2={H - B} stroke={color} strokeDasharray="4,4" />
            <circle cx={x(i)} cy={y(points[i].funds)} r="4" fill={color} />
            <text x={x(i)} y={T - 2} fontSize="9.5" fill={color} textAnchor="middle" fontWeight="700">
              {m.label}{m.warn ? ' ⚠' : ''}
            </text>
          </g>
        )
      })}
      <text x={L} y={H - 8} fontSize="9" fill="var(--text-3)">{displayMonthShort(points[0].month)}</text>
      <text x={W - R} y={H - 8} fontSize="9" fill="var(--text-3)" textAnchor="end">{displayMonthShort(points[points.length - 1].month)}</text>
    </svg>
  )
}

/** Biểu đồ lịch sử giá theo nơi bán (M4). */
export function PriceHistoryChart({ series }: { series: { seller: string; points: { t: number; price: number }[] }[] }) {
  const all = series.flatMap((s) => s.points)
  if (all.length < 2) {
    return <div className="faint" style={{ fontSize: 12, padding: '14px 0' }}>Chưa đủ dữ liệu — thêm báo giá ở các thời điểm khác nhau để thấy giá lên hay xuống.</div>
  }
  const W = 640, H = 170, L = 48, R = 12, T = 14, B = 24
  const minT = Math.min(...all.map((p) => p.t)), maxT = Math.max(...all.map((p) => p.t))
  const minP = Math.min(...all.map((p) => p.price)), maxP = Math.max(...all.map((p) => p.price))
  const pad = Math.max((maxP - minP) * 0.15, maxP * 0.02)
  const x = (t: number) => scale(minT, maxT, t, L, W - R)
  const y = (p: number) => scale(minP - pad, maxP + pad, p, H - B, T)
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {[maxP, (maxP + minP) / 2, minP].map((v) => (
          <g key={v}>
            <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="var(--row-border)" />
            <text x={L - 6} y={y(v) + 3} fontSize="9" fill="var(--text-3)" textAnchor="end">{formatVndShort(v)}</text>
          </g>
        ))}
        {series.map((s, si) => {
          const color = SERIES_COLORS[si % SERIES_COLORS.length]
          const pts = [...s.points].sort((a, b) => a.t - b.t)
          const last = pts[pts.length - 1]
          return (
            <g key={s.seller}>
              <polyline points={pts.map((p) => `${x(p.t)},${y(p.price)}`).join(' ')} fill="none" stroke={color} strokeWidth="2.2" />
              <circle cx={x(last.t)} cy={y(last.price)} r="3.5" fill={color} />
            </g>
          )
        })}
        <text x={L} y={H - 8} fontSize="9" fill="var(--text-3)">{new Date(minT).toLocaleDateString('vi-VN')}</text>
        <text x={W - R} y={H - 8} fontSize="9" fill="var(--text-3)" textAnchor="end">{new Date(maxT).toLocaleDateString('vi-VN')}</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, marginTop: 4 }}>
        {series.map((s, si) => (
          <span key={s.seller}>
            <span style={{ display: 'inline-block', width: 10, height: 3, background: SERIES_COLORS[si % SERIES_COLORS.length], borderRadius: 2, verticalAlign: 2, marginRight: 4 }} />
            {s.seller}
          </span>
        ))}
      </div>
    </div>
  )
}
