import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './store/app-context'
import { Shell, type Tab } from './components/layout'
import { ConnectPage } from './pages/connect-page'
import { DashboardPage } from './pages/dashboard-page'
import { ItemsPage } from './pages/items-page'
import { ItemDetailPage } from './pages/item-detail-page'
import { SavingsPage } from './pages/savings-page'
import { SettingsPage } from './pages/settings-page'
import { ItemFormModal } from './pages/item-form'
import * as act from './store/actions'
import { PiggyMascot } from './components/mascot'

type Route = { tab: Tab; itemId?: string }

function Router() {
  const { phase, data, mutate } = useApp()
  const [route, setRoute] = useState<Route>({ tab: 'dashboard' })
  const [adding, setAdding] = useState(false)

  // áp chủ đề lên toàn trang
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
  }, [data.settings.theme])

  if (phase === 'boot') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <PiggyMascot size={56} />
          <div className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            <span className="spin">⟳</span> Đang mở dữ liệu…
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'connect') return <ConnectPage />

  const openItem = (id: string) => setRoute({ tab: 'items', itemId: id })
  const addItem = () => setAdding(true)

  return (
    <Shell tab={route.tab} onTab={(tab) => setRoute({ tab })}>
      {route.tab === 'dashboard' && <DashboardPage onOpenItem={openItem} onAddItem={addItem} />}
      {route.tab === 'items' && !route.itemId && <ItemsPage onOpenItem={openItem} onAddItem={addItem} />}
      {route.tab === 'items' && route.itemId && (
        <ItemDetailPage itemId={route.itemId} onBack={() => setRoute({ tab: 'items' })} />
      )}
      {route.tab === 'savings' && <SavingsPage />}
      {route.tab === 'settings' && <SettingsPage />}
      {adding && (
        <ItemFormModal
          item={null}
          onSave={(it) => { mutate((d) => act.upsertItem(d, it)); setRoute({ tab: 'items', itemId: it.id }) }}
          onClose={() => setAdding(false)}
        />
      )}
    </Shell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
