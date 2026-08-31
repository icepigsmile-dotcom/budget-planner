import { useApp } from '../store/app-context'
import * as act from '../store/actions'
import { PiggyMascot } from '../components/mascot'
import { exportCsv, exportJson } from '../lib/export'

function ThemeCard({ active, name, desc, preview, onPick }: {
  active: boolean; name: string; desc: string; preview: React.ReactNode; onPick: () => void
}) {
  return (
    <button className="card" onClick={onPick}
      style={{ padding: 14, textAlign: 'left', flex: '1 1 200px', maxWidth: 280, borderColor: active ? 'var(--ok)' : undefined, borderWidth: active ? 2 : 1, borderStyle: 'solid' }}>
      {preview}
      <div style={{ fontWeight: 800, fontSize: 13, marginTop: 10 }}>
        {name} {active && <span className="chip chip-ok" style={{ marginLeft: 6 }}>Đang dùng</span>}
      </div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
    </button>
  )
}

export function SettingsPage() {
  const { data, mutate, repoRef, accountLogin, lastSync, syncStatus, syncNow, disconnect } = useApp()
  const theme = data.settings.theme
  const time = lastSync ? new Date(lastSync).toLocaleString('vi-VN') : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <h1 className="page-title">Cài đặt</h1>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Giao diện</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <ThemeCard
            active={theme === 'pastel'}
            name="Heo Đất pastel"
            desc="Pastel dễ thương, bo tròn, linh vật động vật."
            preview={
              <div style={{ background: '#FDF4EE', border: '1px solid #F3E2D8', borderRadius: 14, padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PiggyMascot size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: '#F9D5DC', width: '80%' }} />
                  <div style={{ height: 8, borderRadius: 4, background: '#DFF3E7', width: '55%', marginTop: 5 }} />
                </div>
              </div>
            }
            onPick={() => mutate((d) => act.updateSettings(d, { theme: 'pastel' }))}
          />
          <ThemeCard
            active={theme === 'minimal'}
            name="Xanh tối giản"
            desc="Gọn gàng, chuyên nghiệp, xanh rêu đậm."
            preview={
              <div style={{ background: '#F6F4EE', border: '1px solid #E3E0D6', borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: '#14382E', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>₫</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 3, background: '#1B5E4A', width: '80%' }} />
                  <div style={{ height: 8, borderRadius: 3, background: '#E3E0D6', width: '55%', marginTop: 5 }} />
                </div>
              </div>
            }
            onPick={() => mutate((d) => act.updateSettings(d, { theme: 'minimal' }))}
          />
        </div>
      </div>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Kết nối GitHub</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', fontSize: 12.5, marginTop: 10 }}>
          <span className="muted">Repo</span>
          <span className="ellipsis" style={{ fontWeight: 600 }}>{repoRef ? `${repoRef.owner}/${repoRef.repo}` : '—'} <span className="faint">(riêng tư)</span></span>
          <span className="muted">Tài khoản</span><span style={{ fontWeight: 600 }}>{accountLogin || '—'}</span>
          <span className="muted">Đồng bộ</span>
          <span style={{ fontWeight: 600, color: syncStatus === 'error' || syncStatus === 'offline' ? 'var(--warn)' : 'var(--ok)' }}>
            ● {syncStatus === 'syncing' ? 'Đang đồng bộ…' : syncStatus === 'offline' ? 'Mất mạng' : syncStatus === 'error' ? 'Lỗi đồng bộ' : syncStatus === 'dirty' ? 'Có thay đổi chưa lưu' : `Đã đồng bộ ${time}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ fontSize: 11.5, padding: '7px 13px' }} onClick={() => void syncNow()}>Đồng bộ ngay</button>
          {repoRef?.webUrl && (
            <a className="btn btn-ghost" style={{ fontSize: 11.5, padding: '7px 13px', textDecoration: 'none' }} href={repoRef.webUrl} target="_blank" rel="noreferrer">Mở repo ↗</a>
          )}
          <button className="btn btn-danger-outline" style={{ fontSize: 11.5, padding: '7px 13px' }}
            onClick={() => { if (window.confirm('Ngắt kết nối và xóa token trên thiết bị này? Dữ liệu vẫn nằm nguyên trong repo GitHub.')) void disconnect() }}>
            Ngắt kết nối / đổi repo
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Sao lưu &amp; xuất dữ liệu</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 3, lineHeight: 1.5 }}>Xuất CSV mở được bằng Excel; JSON là bản sao đúng định dạng file trong repo.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ fontSize: 11.5, padding: '7px 13px' }} onClick={() => exportCsv(data)}>Xuất Excel (CSV)</button>
          <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '7px 13px' }} onClick={() => exportJson(data)}>Tải bản sao JSON</button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div className="row-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Tiền tệ &amp; định dạng</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>VND · 12.500.000 ₫</div>
          </div>
          <span className="chip chip-muted">VND (₫)</span>
        </div>
      </div>

      <div className="faint" style={{ fontSize: 11, lineHeight: 1.6 }}>
        Báo giá ở bản này nhập thủ công: mở trang nơi bán, xem giá và đánh giá, rồi thêm vào app để so sánh.
        Tìm giá tự động sẽ bổ sung ở bản sau.
      </div>
    </div>
  )
}
