import { useState } from 'react'
import type { Item } from '../types'
import { itemTotal } from '../types'
import { Modal, MoneyInput } from '../components/ui'

export function PurchaseDialog({ item, onConfirm, onClose }: {
  item: Item
  onConfirm: (purchasedAt: string, purchasedPrice: number) => void
  onClose: () => void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [price, setPrice] = useState(itemTotal(item))
  const [error, setError] = useState('')

  const submit = () => {
    if (price <= 0) { setError('Cần nhập giá mua thực tế.'); return }
    onConfirm(date, price)
    onClose()
  }

  return (
    <Modal title="Xác nhận đã mua" onClose={onClose}>
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, margin: '0 0 14px' }}>
        Giá mua thực tế sẽ bị trừ khỏi tích lũy; các món còn lại được tính lại.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label className="field-label">Ngày mua</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Giá mua thực tế{item.quantity > 1 ? ` (tổng cho ${item.quantity} cái)` : ''}</label>
          <MoneyInput value={price} onChange={setPrice} />
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>Xác nhận</button>
        </div>
      </div>
    </Modal>
  )
}
