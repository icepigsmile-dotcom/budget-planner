import { useState } from 'react'
import { useApp } from '../store/app-context'
import { getAccount, getStoredClientId } from '../lib/msal'
import { PiggyMascot } from '../components/mascot'
import { loadShareUrl } from '../lib/storage-local'

type State = 'idle' | 'checking' | 'error'

export function ConnectPage() {
  const { signIn, connectFile, connectError } = useApp()
  const [link, setLink] = useState(loadShareUrl())
  const [clientId, setClientId] = useState(getStoredClientId())
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(!getStoredClientId())
  const account = getAccount()

  const doConnect = async () => {
    setError('')
    if (!clientId.trim()) { setError('Cần nhập Application (client) ID — xem hướng dẫn trong mục Cài đặt nâng cao.'); return }
    if (!link.trim()) { setError('Dán link file Excel trên OneDrive của anh vào ô trên.'); return }
    setState('checking')
    try {
      await connectFile(link, clientId)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setState('error')
      if (msg === 'NOT_SIGNED_IN') setError('Chưa đăng nhập — bấm "Đăng nhập Microsoft" trước.')
      else if (msg === 'NOT_XLSX') setError('Link không trỏ tới file Excel (.xlsx). Tạo 1 file Excel trống trên OneDrive rồi lấy link chia sẻ.')
      else if (msg.startsWith('GRAPH_403') || msg.startsWith('GRAPH_401')) setError('Không có quyền trên file này. Dùng link của file trong chính OneDrive của tài khoản đang đăng nhập (OneDrive → chuột phải file → Sao chép liên kết). Không cần mở quyền cho người khác.')
      else if (msg.startsWith('GRAPH_404')) setError('Không tìm thấy file từ link này. Kiểm tra lại link chia sẻ.')
      else setError(`Không truy cập được file: ${msg}`)
      return
    }
    setState('idle')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hero-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420, color: 'var(--hero-text)' }}>
        <PiggyMascot size={64} />
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 16, lineHeight: 1.25 }}>Kế hoạch mua sắm của bạn</h1>
        <p style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.55 }}>Lập danh sách, so sánh giá và biết chính xác khi nào bạn đủ tiền mua.</p>
      </div>
      <div className="card" style={{ width: '100%', maxWidth: 420, marginTop: 20, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>Kết nối dữ liệu</div>
        <p className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, margin: '4px 0 12px' }}>
          Dán link file Excel trên OneDrive cá nhân của bạn. Mọi dữ liệu được lưu vào file này.
        </p>
        <button className="btn btn-ghost" style={{ width: '100%', color: 'var(--text)' }} onClick={() => void signIn()}>
          <svg width="14" height="14" viewBox="0 0 16 16"><rect x="1" y="1" width="6.5" height="6.5" fill="#F25022" /><rect x="8.5" y="1" width="6.5" height="6.5" fill="#7FBA00" /><rect x="1" y="8.5" width="6.5" height="6.5" fill="#00A4EF" /><rect x="8.5" y="8.5" width="6.5" height="6.5" fill="#FFB900" /></svg>
          {account ? `Đã đăng nhập: ${account.username}` : 'Đăng nhập Microsoft'}
        </button>
        <div style={{ marginTop: 12 }}>
          <label className="field-label">Link file Excel trên OneDrive</label>
          <input className="input" placeholder="https://1drv.ms/x/…" value={link} onChange={(e) => setLink(e.target.value)} />
        </div>
        <button className="btn" style={{ fontSize: 11.5, color: 'var(--text-2)', padding: '8px 0' }} onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? '▾' : '▸'} Cài đặt nâng cao (lần đầu dùng)
        </button>
        {showAdvanced && (
          <div style={{ background: 'var(--chip-bg)', borderRadius: 12, padding: 12 }}>
            <label className="field-label">Application (client) ID</label>
            <input className="input" placeholder="00000000-0000-0000-0000-000000000000" value={clientId} onChange={(e) => setClientId(e.target.value)} />
            <p className="muted" style={{ fontSize: 10.5, lineHeight: 1.5, margin: '8px 0 0' }}>
              Lấy 1 lần duy nhất tại <b>entra.microsoft.com</b> → App registrations → New registration → chọn
              "Personal Microsoft accounts only", Redirect URI loại <b>Single-page application</b> = địa chỉ app này.
              Chi tiết trong file SETUP.md kèm theo app.
            </p>
          </div>
        )}
        {state === 'checking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--chip-bg)', borderRadius: 12, padding: '12px 14px', marginTop: 12, fontSize: 12.5 }}>
            <span className="spin">⟳</span> Đang kiểm tra quyền truy cập file…
          </div>
        )}
        {(error || connectError) && state !== 'checking' && (
          <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--warn-deep)' }}>✕ Không kết nối được</div>
            <div style={{ fontSize: 11.5, color: 'var(--warn-deep)', marginTop: 3, lineHeight: 1.5 }}>{error || connectError}</div>
          </div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={state === 'checking'} onClick={() => void doConnect()}>
          Kết nối
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--hero-text)', opacity: 0.6, marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
        Chỉ một người dùng · dữ liệu nằm trong OneDrive của bạn
      </div>
    </div>
  )
}
