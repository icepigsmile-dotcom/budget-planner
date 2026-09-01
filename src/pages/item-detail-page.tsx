import { useMemo, useState } from 'react'
import { useApp } from '../store/app-context'
import { computePlan } from '../lib/feasibility'
import { currentMonth, displayMonth } from '../lib/months'
import { formatVnd } from '../lib/money'
import { itemTotal, PRIORITY_LABEL, STATUS_LABEL } from '../types'
import { ItemAvatar } from '../components/mascot'
import { PriceHistoryChart } from '../components/charts'
import { latestQuotesBySeller, judgeQuotes, QuoteRow } from '../components/quote-table'
import { ItemFormModal } from './item-form'
import { QuoteFormModal } from './quote-form'
import { PurchaseDialog } from './purchase-dialog'
import * as act from '../store/actions'

export function ItemDetailPage({ itemId, onBack }: { itemId: string; onBack: () => void }) {
  const { data, mutate } = useApp()
  const theme = data.settings.theme
  const item = data.items.find((i) => i.id === itemId)
  const plan = useMemo(() => computePlan(data, currentMonth()), [data])
  const [modal, setModal] = useState<'edit' | 'quote' | 'purchase' | null>(null)

  if (!item) {
    return <div><button className="btn btn-ghost" onClick={onBack}>‹ Quay lại</button><p className="muted">Món đồ không còn tồn tại.</p></div>
  }

  const itemQuotes = data.quotes.filter((q) => q.itemId === item.id)
  const latest = latestQuotesBySeller(itemQuotes)
  const verdicts = judgeQuotes(latest)
  const chosenQuote = data.quotes.find((q) => q.id === item.chosenQuoteId)
  const p = plan.byItem[item.id]

  const historySeries = useMemo(() => {
    const bySeller = new Map<string, { t: number; price: number }[]>()
    for (const q of itemQuotes) {
      const t = Date.parse(q.fetchedAt)
      if (Number.isNaN(t)) continue
      if (!bySeller.has(q.seller)) bySeller.set(q.seller, [])
      bySeller.get(q.seller)!.push({ t, price: q.price })
    }
    return [...bySeller.entries()].map(([seller, points]) => ({ seller, points }))
  }, [itemQuotes])

  const remove = () => {
    if (window.confirm(`Xóa "${item.name}" và toàn bộ báo giá của nó?`)) {
      mutate((d) => act.deleteItem(d, item.id))
      onBack()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="muted" style={{ fontSize: 12.5 }}>
        <button onClick={onBack} style={{ color: 'var(--text-2)', fontWeight: 600 }}>‹ Món đồ</button>
        {' / '}<span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.name}</span>
      </div>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ItemAvatar id={item.id} imageUrl={item.imageUrl} size={120} theme={theme} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 14 }}>
              {item.name}{item.quantity > 1 && <span className="muted" style={{ fontWeight: 600 }}> ×{item.quantity}</span>}
            </div>
            <div className="num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ok)', marginTop: 4 }}>
              {formatVnd(itemTotal(item))}
              <span className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>
                {item.quantity > 1 && <> · {formatVnd(item.estimatedPrice)}/cái</>}
                {chosenQuote && <> · giá đã chốt từ {chosenQuote.seller}</>}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="chip chip-ok">{STATUS_LABEL[item.status]}</span>
              <span className="chip chip-warn">Ưu tiên {PRIORITY_LABEL[item.priority].toLowerCase()}</span>
              <span className="chip chip-muted">{item.category}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--row-border)', marginTop: 14, paddingTop: 12, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', fontSize: 12.5 }}>
              <span className="muted">Mong muốn có</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{displayMonth(item.targetMonth)}</span>
              {item.quantity > 1 && <><span className="muted">Số lượng</span><span className="num" style={{ fontWeight: 600, textAlign: 'right' }}>{item.quantity}</span></>}
              {item.description && <><span className="muted">Thông số</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{item.description}</span></>}
              {item.note && <><span className="muted">Ghi chú</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{item.note}</span></>}
              {item.status === 'Purchased' && <><span className="muted">Đã mua</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{item.purchasedAt} · {formatVnd(item.purchasedPrice)}</span></>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModal('edit')}>Sửa</button>
              {item.status !== 'Purchased' && (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setModal('purchase')}>Đã mua</button>
              )}
              <button className="btn btn-danger-outline" style={{ width: 46 }} onClick={remove} aria-label="Xóa món đồ">🗑</button>
            </div>
          </div>

          {p && item.status !== 'Purchased' && (
            <div className="card" style={{ padding: 20, borderColor: p.feasible ? undefined : 'var(--warn-border)' }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Kế hoạch tiết kiệm cho món này</div>
              <div className="grid2" style={{ marginTop: 12 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '11px 13px' }}>
                  <div className="muted" style={{ fontSize: 11 }}>Cần mỗi tháng</div>
                  <div className="num" style={{ fontSize: 15, fontWeight: 800 }}>{formatVnd(p.neededPerMonth)}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '11px 13px' }}>
                  <div className="muted" style={{ fontSize: 11 }}>Đã tích lũy</div>
                  <div className="num" style={{ fontSize: 15, fontWeight: 800 }}>{formatVnd(p.allocatedNow)}</div>
                </div>
              </div>
              {!p.hasTarget ? (
                <div style={{ background: 'var(--chip-bg)', borderRadius: 12, padding: '13px 14px', marginTop: 12, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>
                  Chưa đặt thời điểm mong muốn — bấm "Sửa" và chọn tháng để app tính khả thi.
                </div>
              ) : p.feasible ? (
                <div style={{ background: 'var(--ok-bg)', borderRadius: 12, padding: '13px 14px', marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--ok-deep)' }}>
                  ✓ Khả thi — dự kiến đủ tiền vào {displayMonth(p.fundedMonth ?? '')}
                </div>
              ) : (
                <div style={{ background: 'var(--warn-bg)', borderRadius: 12, padding: '13px 14px', marginTop: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--warn-deep)' }}>
                    ⚠ Không khả thi — thiếu {formatVnd(p.shortfallAtTarget)} tại {displayMonth(item.targetMonth)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--warn-deep)', opacity: 0.9, lineHeight: 1.55, marginTop: 8 }}>
                    <b>Đề xuất 1:</b> dời sang <b>{p.suggestMonth ? displayMonth(p.suggestMonth) : '—'}</b> (giữ mức tiết kiệm hiện tại).<br />
                    <b>Đề xuất 2:</b> tiết kiệm thêm <b>{formatVnd(p.suggestExtraPerMonth)}/tháng</b> để kịp {displayMonth(item.targetMonth)}.
                  </div>
                  {p.suggestMonth && (
                    <button className="btn btn-warn" style={{ marginTop: 11, padding: '7px 13px', fontSize: 11.5 }}
                      onClick={() => mutate((d) => act.upsertItem(d, { ...item, targetMonth: p.suggestMonth! }))}>
                      Áp dụng {displayMonth(p.suggestMonth)}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="row-between" style={{ flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                Báo giá <span className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>· {latest.length} nguồn{item.quantity > 1 ? ' · giá cho 1 cái' : ''}</span>
              </div>
              <button className="btn btn-outline" style={{ padding: '7px 13px', fontSize: 12 }} onClick={() => setModal('quote')}>+ Thêm báo giá</button>
            </div>
            {verdicts.suggestedId && (
              <div style={{ background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', borderRadius: 12, padding: '11px 14px', marginTop: 12, fontSize: 12.5, color: 'var(--ok-deep)' }}>
                <b>Gợi ý của app: {latest.find((q) => q.id === verdicts.suggestedId)?.seller}.</b> {verdicts.reason}
              </div>
            )}
            {latest.length === 0 ? (
              <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                Chưa có báo giá nào. Mở trang nơi bán (Shopee, Tiki, CellphoneS…), xem giá và đánh giá, rồi bấm "+ Thêm báo giá" để lưu vào đây và so sánh.
              </p>
            ) : (
              <div style={{ marginTop: 12, border: '1px solid var(--row-border)', borderRadius: 12, overflow: 'hidden' }}>
                {latest.map((q) => (
                  <QuoteRow key={q.id} quote={q} verdicts={verdicts} chosen={q.id === item.chosenQuoteId}
                    onChoose={() => mutate((d) => act.chooseQuote(d, item.id, q.id))}
                    onDelete={() => { if (window.confirm(`Xóa báo giá ${q.seller}?`)) mutate((d) => act.deleteQuote(d, q.id)) }} />
                ))}
              </div>
            )}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Lịch sử giá</div>
            <div style={{ marginTop: 10 }}>
              <PriceHistoryChart series={historySeries} />
            </div>
          </div>
        </div>
      </div>

      {modal === 'edit' && <ItemFormModal item={item} onSave={(it) => mutate((d) => act.upsertItem(d, it))} onClose={() => setModal(null)} />}
      {modal === 'quote' && <QuoteFormModal itemId={item.id} onSave={(q) => mutate((d) => act.addQuote(d, q))} onClose={() => setModal(null)} />}
      {modal === 'purchase' && (
        <PurchaseDialog item={item} onConfirm={(at, price) => mutate((d) => act.markPurchased(d, item.id, at, price))} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
