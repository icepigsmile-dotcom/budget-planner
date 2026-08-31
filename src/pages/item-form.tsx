import { useState } from 'react'
import type { Item, ItemStatus, Priority } from '../types'
import { CATEGORIES, PRIORITY_LABEL, STATUS_LABEL } from '../types'
import { Modal, MoneyInput, MonthInput } from '../components/ui'
import { newId } from '../store/actions'
import { todayIso } from '../lib/months'

export function ItemFormModal({ item, onSave, onClose }: { item: Item | null; onSave: (item: Item) => void; onClose: () => void }) {
  const [form, setForm] = useState<Item>(
    item ?? {
      id: newId('item'),
      name: '', category: CATEGORIES[0], description: '',
      priority: 'Medium', estimatedPrice: 0, chosenQuoteId: '',
      targetMonth: '', status: 'Saving', imageUrl: '', note: '',
      purchasedAt: '', purchasedPrice: 0,
      createdAt: todayIso(), updatedAt: todayIso(),
    },
  )
  const [error, setError] = useState('')
  const set = <K extends keyof Item>(key: K, value: Item[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = () => {
    if (!form.name.trim()) { setError('Cần nhập tên món đồ.'); return }
    if (form.estimatedPrice <= 0) { setError('Cần nhập giá dự kiến lớn hơn 0.'); return }
    if (!form.targetMonth && form.status === 'Saving') { setError('Món đang tiết kiệm cần thời điểm mong muốn có.'); return }
    onSave({ ...form, name: form.name.trim() })
    onClose()
  }

  return (
    <Modal title={item ? 'Sửa món đồ' : 'Thêm món đồ'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="field-label">Tên món đồ *</label>
          <input className="input" autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="ví dụ: iPhone 17 Pro 256GB" />
        </div>
        <div className="grid2">
          <div>
            <label className="field-label">Danh mục</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Độ ưu tiên</label>
            <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid2">
          <div>
            <label className="field-label">Giá dự kiến *</label>
            <MoneyInput value={form.estimatedPrice} onChange={(v) => set('estimatedPrice', v)} placeholder="8.000.000" />
          </div>
          <div>
            <label className="field-label">Mong muốn có vào</label>
            <MonthInput value={form.targetMonth} onChange={(v) => set('targetMonth', v)} />
          </div>
        </div>
        <div>
          <label className="field-label">Trạng thái</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as ItemStatus)}>
            {(Object.keys(STATUS_LABEL) as ItemStatus[]).filter((s) => s !== 'Purchased').map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
            {form.status === 'Purchased' && <option value="Purchased">{STATUS_LABEL.Purchased}</option>}
          </select>
        </div>
        <div>
          <label className="field-label">Thông số mong muốn</label>
          <input className="input" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="màu, dung lượng, kích thước…" />
        </div>
        <div>
          <label className="field-label">Link ảnh minh họa</label>
          <input className="input" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className="field-label">Ghi chú</label>
          <input className="input" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="ví dụ: chờ sale 11/11 nếu kịp" />
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>{item ? 'Lưu' : 'Thêm'}</button>
        </div>
      </div>
    </Modal>
  )
}
