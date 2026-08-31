import { useState } from 'react'
import { useApp } from '../store/app-context'
import { PiggyMascot } from '../components/mascot'
import { loadRepoInput } from '../lib/storage-local'
import { getStoredToken } from '../lib/github-storage'

type State = 'idle' | 'checking' | 'error'

const ERROR_TEXT: Record<string, string> = {
  BAD_REPO: 'Repo không đúng dạng. Nhập "tên-tài-khoản/tên-repo" hoặc dán link https://github.com/…',
  NO_TOKEN: 'Cần dán mã truy cập (token) — xem hướng dẫn bên dưới.',
  GH_401: 'Token không hợp lệ hoặc đã hết hạn. Tạo token mới theo hướng dẫn bên dưới.',
  GH_403: 'Token không có quyền trên repo này. Khi tạo token, mục Repository access phải chọn đúng repo, quyền Contents: Read and write.',
  REPO_NOT_FOUND: 'Không tìm thấy repo. Kiểm tra tên repo, và token phải được cấp quyền truy cập đúng repo đó.',
  REPO_IS_PUBLIC: 'Repo này đang PUBLIC — dữ liệu chi tiêu sẽ bị lộ. Tạo repo Private (hoặc chuyển repo này sang Private) rồi kết nối lại.',
  NO_WRITE_PERMISSION: 'Token chỉ có quyền đọc. Tạo lại token với quyền Contents: Read and write.',
}

export function ConnectPage() {
  const { connect } = useApp()
  const [repoInput, setRepoInput] = useState(loadRepoInput())
  const [token, setToken] = useState(getStoredToken())
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')
  const [showGuide, setShowGuide] = useState(!getStoredToken())

  const doConnect = async () => {
    setError('')
    if (!repoInput.trim()) { setError('Nhập repo GitHub riêng tư của anh, ví dụ: icepigsmile-dotcom/budget-planner-data'); return }
    if (!token.trim()) { setError('Dán mã truy cập (Personal Access Token) vào ô bên dưới.'); return }
    setState('checking')
    try {
      await connect(repoInput, token)
      setState('idle')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setState('error')
      setError(ERROR_TEXT[msg] ?? `Không kết nối được: ${msg}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hero-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440, color: 'var(--hero-text)' }}>
        <PiggyMascot size={64} />
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 16, lineHeight: 1.25 }}>Kế hoạch mua sắm của bạn</h1>
        <p style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.55 }}>Lập danh sách, so sánh giá và biết chính xác khi nào bạn đủ tiền mua.</p>
      </div>
      <div className="card" style={{ width: '100%', maxWidth: 440, marginTop: 20, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>Kết nối dữ liệu</div>
        <p className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, margin: '4px 0 12px' }}>
          Dữ liệu lưu thành 1 file trong repo GitHub <b>riêng tư</b> của bạn — đồng bộ mọi thiết bị, kèm lịch sử mọi thay đổi.
        </p>
        <div>
          <label className="field-label">Repo riêng tư (tên-tài-khoản/tên-repo)</label>
          <input className="input" placeholder="icepigsmile-dotcom/budget-planner-data" value={repoInput} onChange={(e) => setRepoInput(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="field-label">Mã truy cập (Personal Access Token)</label>
          <input className="input" type="password" placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <button className="btn" style={{ fontSize: 11.5, color: 'var(--text-2)', padding: '8px 0' }} onClick={() => setShowGuide(!showGuide)}>
          {showGuide ? '▾' : '▸'} Cách tạo repo + token (làm 1 lần, ~3 phút)
        </button>
        {showGuide && (
          <div style={{ background: 'var(--chip-bg)', borderRadius: 12, padding: 12, fontSize: 11, lineHeight: 1.65, color: 'var(--text-2)' }}>
            <b>1. Tạo repo:</b> github.com → New repository → tên ví dụ <b>budget-planner-data</b> → chọn <b>Private</b> → Create.<br />
            <b>2. Tạo token:</b> github.com → ảnh đại diện → Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → Generate new token:<br />
            · Repository access: <b>Only select repositories</b> → chọn repo vừa tạo<br />
            · Permissions → Repository permissions → <b>Contents: Read and write</b><br />
            · Expiration: chọn dài nhất có thể (hết hạn thì tạo lại, dán lại vào đây)<br />
            <b>3.</b> Copy token (bắt đầu bằng <b>github_pat_</b>) dán vào ô trên. Token chỉ lưu trên thiết bị này.
          </div>
        )}
        {state === 'checking' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--chip-bg)', borderRadius: 12, padding: '12px 14px', marginTop: 12, fontSize: 12.5 }}>
            <span className="spin">⟳</span> Đang kiểm tra repo và quyền truy cập…
          </div>
        )}
        {error && state !== 'checking' && (
          <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--warn-deep)' }}>✕ Không kết nối được</div>
            <div style={{ fontSize: 11.5, color: 'var(--warn-deep)', marginTop: 3, lineHeight: 1.5 }}>{error}</div>
          </div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={state === 'checking'} onClick={() => void doConnect()}>
          Kết nối
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--hero-text)', opacity: 0.6, marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
        Chỉ một người dùng · dữ liệu nằm trong repo riêng tư của bạn · không có server trung gian
      </div>
    </div>
  )
}
