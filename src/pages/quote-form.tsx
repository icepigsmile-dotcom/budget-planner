import { useState } from 'react'
import type { Quote } from '../types'
import { Modal, MoneyInput } from '../components/ui'
import { newId } from '../store/actions'
import { todayIso } from '../lib/months'

const KNOWN_SELLERS = [
  'Shopee Mall', 'Lazada (LazMall)', 'Tiki Trading', 'Thế Giới Di Động',
  'Điện Máy Xanh', 'CellphoneS', 'FPT Shop', 'Hoàng Hà Mobile', 'Trang chính hãng',
]

export function QuoteFormModal({ itemId, onSave, onClose }: { itemId: string; onSave: (q: Quote) => void; onClose: () => void }) {
  const [seller, setSeller] = useState('')
  const [customSeller, setCustomSeller] = useState('')
  const [price, setPrice] = useState(0)
  const [url, setUrl] = useState('')
  const [rating, setRating] = useState('')
  const [reviewCount, setReviewCount] = useState('')
  const [promo, setPromo] = useState('')
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    const sellerName = (seller === '__other__' ? customSeller : seller).trim()
    if (!sellerName) { setError('Cần chọn hoặc nhập nơi bán.'); return }
    if (price <= 0) { setError('Cần nhập giá lớn hơn 0.'); return }
    const r = parseFloat(rating.replace(',', '.'))
    onSave({
      id: newId('quote'),
      itemId,
      seller: sellerName,
      price,
      url: url.trim(),
      rating: Number.isFinite(r) ? Math.min(Math.max(r, 0), 5) : 0,
      reviewCount: parseInt(reviewCount.replace(/\D/g, ''), 10) || 0,
      reviewSummary: summary.trim(),
      promo: promo.trim(),
      fetchedAt: todayIso(),
      isManual: true,
      isChosen: false,
    })
    onClose()
  }

  return (
    <Modal title="Thêm báo giá" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="field-label">Nơi bán *</label>
          <select className="input" value={seller} onChange={(e) => setSeller(e.target.value)}>
            <option value="">— chọn nơi bán —</option>
            {KNOWN_SELLERS.map((s) => <option key={s}>{s}</option>)}
            <option value="__other__">Nơi khác…</option>
          </select>
          {seller === '__other__' && (
            <input className="input" style={{ marginTop: 8 }} placeholder="tên nơi bán" value={customSeller} onChange={(e) => setCustomSeller(e.target.value)} />
          )}
        </div>
        <div>
          <label className="field-label">Giá *</label>
          <MoneyInput value={price} onChange={setPrice} placeholder="7.890.000" />
        </div>
        <div>
          <label className="field-label">Link sản phẩm</label>
          <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="grid2">
          <div>
            <label className="field-label">Điểm đánh giá (0–5)</label>
            <input className="input num" inputMode="decimal" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4,8" />
          </div>
          <div>
            <label className="field-label">Số lượt đánh giá</label>
            <input className="input num" inputMode="numeric" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} placeholder="2140" />
          </div>
        </div>
        <div>
          <label className="field-label">Khuyến mãi</label>
          <input className="input" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="ví dụ: voucher 200k, trả góp 0%" />
        </div>
        <div>
          <label className="field-label">Nhận xét nổi bật</label>
          <input className="input" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="tóm tắt bình luận người mua" />
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>Thêm báo giá</button>
        </div>
      </div>
    </Modal>
  )
}
