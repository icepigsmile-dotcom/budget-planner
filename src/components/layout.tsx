import type { ReactNode } from 'react'
import { useApp } from '../store/app-context'
import { AppLogo } from './mascot'

export type Tab = 'dashboard' | 'items' | 'savings' | 'settings'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: '🏠︎' },
  { key: 'items', label: 'Món đồ', icon: '🎁︎' },
  { key: 'savings', label: 'Tiết kiệm', icon: '🪙︎' },
  { key: 'settings', label: 'Cài đặt', icon: '⚙︎' },
]

function SyncBadge() {
  const { syncStatus, lastSync, syncNow } = useApp()
  const time = lastSync ? new Date(lastSync).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'
  const label =
    syncStatus === 'syncing' ? 'Đang đồng bộ…'
    : syncStatus === 'dirty' ? 'Có thay đổi chưa lưu'
    : syncStatus === 'offline' ? 'Mất mạng — chưa đồng bộ'
    : syncStatus === 'error' ? 'Lỗi đồng bộ — bấm để thử lại'
    : `Đã đồng bộ lúc ${time}`
  const color = syncStatus === 'error' || syncStatus === 'offline' ? 'var(--warn)' : 'var(--text-2)'
  return (
    <button onClick={() => void syncNow()} style={{ marginTop: 'auto', background: 'var(--sidebar-active-bg)', borderRadius: 14, padding: 12, textAlign: 'left' }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.4, color }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--sidebar-text)', marginTop: 2 }}>GitHub · bấm để đồng bộ lại</div>
    </button>
  )
}

export function Shell({ tab, onTab, children }: { tab: Tab; onTab: (t: Tab) => void; children: ReactNode }) {
  const { data, online, syncStatus } = useApp()
  const theme = data.settings.theme
  return (
    <div className="shell">
      <aside className="sidebar">
        <div style={{ padding: '0 8px 22px' }}>
          <AppLogo theme={theme} />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TABS.map((t) => (
            <button key={t.key} className={`nav-btn${tab === t.key ? ' active' : ''}`} onClick={() => onTab(t.key)}>
              <span style={{ width: 26, height: 26, borderRadius: 9, background: 'var(--chip-bg)', display: 'grid', placeItems: 'center', fontSize: 13 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <SyncBadge />
      </aside>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {(!online || syncStatus === 'offline') && (
          <div className="offline-banner">⚠ Mất kết nối — hiển thị dữ liệu lần cuối, thay đổi sẽ đồng bộ khi có mạng</div>
        )}
        <main className="main">{children}</main>
      </div>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => onTab(t.key)}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
