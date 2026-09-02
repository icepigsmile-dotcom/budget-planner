import type { Item } from '../types'
import { itemIcon, itemTotal, PRIORITY_LABEL } from '../types'
import type { ItemPlan } from '../lib/feasibility'
import { formatVnd } from '../lib/money'
import { displayMonth } from '../lib/months'
import { ItemAvatar } from './mascot'
import { FeasibilityBadge, ProgressBar } from './ui'

/** Thẻ món đồ dùng ở Tổng quan và danh sách Món đồ. */
export function ItemCard({ item, plan, theme, onClick }: { item: Item; plan?: ItemPlan; theme: string; onClick: () => void }) {
  const percent = plan && plan.price > 0 ? (plan.allocatedNow / plan.price) * 100 : 0
  const warn = plan ? plan.hasTarget && !plan.feasible : false
  return (
    <button
      className="card"
      onClick={onClick}
      style={{
        display: 'flex', gap: 13, alignItems: 'center', padding: '14px 15px', textAlign: 'left', width: '100%',
        borderColor: warn ? 'var(--warn-border)' : undefined,
        borderWidth: warn ? 1.5 : 1, borderStyle: 'solid',
      }}
    >
      <ItemAvatar id={item.id} icon={itemIcon(item)} imageUrl={item.imageUrl} size={50} theme={theme} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-between" style={{ alignItems: 'baseline' }}>
          <div className="ellipsis" style={{ fontWeight: 700, fontSize: 13.5 }}>
            {item.name}{item.quantity > 1 && <span className="muted" style={{ fontWeight: 600 }}> ×{item.quantity}</span>}
          </div>
          <div className="num" style={{ fontWeight: 700, fontSize: 13.5, flex: 'none', whiteSpace: 'nowrap' }}>{formatVnd(itemTotal(item))}</div>
        </div>
        <div className="row-between muted" style={{ fontSize: 11.5, fontWeight: 600, margin: '3px 0 7px' }}>
          <span className="ellipsis">{item.targetMonth ? displayMonth(item.targetMonth) : 'chưa đặt thời điểm'} · Ưu tiên {PRIORITY_LABEL[item.priority].toLowerCase()}</span>
          {plan && <span style={{ flex: 'none', whiteSpace: 'nowrap' }}>Đã có {Math.round(percent)}%</span>}
        </div>
        {plan ? <ProgressBar percent={percent} warn={warn} /> : null}
      </div>
      <div className="hide-mobile" style={{ flex: 'none' }}>
        <FeasibilityBadge plan={plan} />
      </div>
    </button>
  )
}
