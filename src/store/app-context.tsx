import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppData } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { connectRepo, readData, writeData, whoAmI, setStoredToken, getStoredToken, clearToken, type RepoRef } from '../lib/github-storage'
import * as local from '../lib/storage-local'

export type SyncStatus = 'synced' | 'syncing' | 'dirty' | 'offline' | 'error'
export type Phase = 'boot' | 'connect' | 'ready'

interface AppStore {
  phase: Phase
  data: AppData
  repoRef: RepoRef | null
  accountLogin: string
  syncStatus: SyncStatus
  lastSync: string
  online: boolean
  connect: (repoInput: string, token: string) => Promise<void>
  disconnect: () => Promise<void>
  syncNow: () => Promise<void>
  mutate: (updater: (d: AppData) => AppData) => void
}

const EMPTY: AppData = { items: [], quotes: [], savings: [], settings: DEFAULT_SETTINGS }
const Ctx = createContext<AppStore | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('boot')
  const [data, setData] = useState<AppData>(EMPTY)
  const [repoRef, setRepoRef] = useState<RepoRef | null>(null)
  const [accountLogin, setAccountLogin] = useState('')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [lastSync, setLastSync] = useState(local.loadLastSync())
  const [online, setOnline] = useState(navigator.onLine)
  const writeTimer = useRef<number | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data
  const repoRefRef = useRef(repoRef)
  repoRefRef.current = repoRef
  // dirtyRef phản chiếu cờ bp.dirty: còn true nghĩa là còn thay đổi local chưa ghi lên repo
  const dirtyRef = useRef(local.loadDirty())
  const writeInFlight = useRef<Promise<boolean> | null>(null)

  const markSynced = useCallback(() => {
    local.saveDirty(false)
    dirtyRef.current = false
    const now = new Date().toISOString()
    local.saveLastSync(now)
    setLastSync(now)
    setSyncStatus('synced')
  }, [])

  /** Đọc dữ liệu từ repo về. KHÔNG bao giờ đè lên thay đổi local chưa ghi. */
  const refresh = useCallback(async (ref: RepoRef) => {
    if (dirtyRef.current) return
    setSyncStatus('syncing')
    const fresh = await readData(ref)
    if (dirtyRef.current) return // người dùng vừa sửa trong lúc đang tải — giữ bản local
    if (fresh !== null) {
      dataRef.current = fresh
      setData(fresh)
      local.saveCachedData(fresh)
    }
    markSynced()
  }, [markSynced])

  /** Ghi toàn bộ dữ liệu hiện tại lên repo. Trả về true nếu thành công. Gọi chồng sẽ gộp làm một. */
  const flushWrite = useCallback(async (): Promise<boolean> => {
    if (writeInFlight.current) return writeInFlight.current
    const run = (async () => {
      const ref = repoRefRef.current
      if (!ref || !dirtyRef.current) return !dirtyRef.current
      if (!navigator.onLine) { setSyncStatus('offline'); return false }
      setSyncStatus('syncing')
      try {
        await writeData(ref, dataRef.current)
        markSynced()
        return true
      } catch {
        setSyncStatus('error')
        return false
      }
    })()
    writeInFlight.current = run
    try {
      return await run
    } finally {
      writeInFlight.current = null
    }
  }, [markSynced])

  useEffect(() => {
    const on = () => {
      setOnline(true)
      if (dirtyRef.current) void flushWrite() // có mạng lại: tự đồng bộ thay đổi đang chờ
    }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [flushWrite])

  const isDemo = useMemo(() => new URLSearchParams(window.location.search).get('demo') === '1', [])

  // boot: khôi phục kết nối repo + đọc dữ liệu mới nhất
  useEffect(() => {
    if (isDemo) {
      void import('./demo-data').then(({ demoData }) => {
        const d = demoData()
        dataRef.current = d
        setData(d)
        setPhase('ready')
        setSyncStatus('synced')
      })
      return
    }
    ;(async () => {
      const cached = local.loadCachedData()
      if (cached) {
        setData(cached)
        dataRef.current = cached // gán thẳng: flushWrite bên dưới có thể chạy trước khi React render lại
      } else if (dirtyRef.current) {
        // cờ dirty còn nhưng cache mất (bị xóa tay): không có gì để ghi, bỏ cờ để khỏi chặn đọc
        local.saveDirty(false)
        dirtyRef.current = false
      }
      const ref = local.loadRepoRef()
      if (!ref || !getStoredToken()) { setPhase('connect'); return }
      setRepoRef(ref)
      setPhase('ready')
      if (!navigator.onLine) { setSyncStatus('offline'); return }
      try {
        setAccountLogin(await whoAmI())
        if (dirtyRef.current) {
          // còn thay đổi chưa ghi từ phiên trước: đẩy bản local lên repo trước, không để bản cũ đè mất
          const ok = await flushWrite()
          if (!ok) return // ghi chưa được thì tuyệt đối không đọc đè
        }
        await refresh(ref)
      } catch {
        setSyncStatus('error')
      }
    })().catch(() => setPhase('connect'))
  }, [refresh, flushWrite, isDemo])

  const connect = useCallback(async (repoInput: string, token: string) => {
    setStoredToken(token)
    const ref = await connectRepo(repoInput)
    const login = await whoAmI().catch(() => '')
    const existing = await readData(ref)
    if (existing === null) {
      // repo chưa có file dữ liệu: tạo file đầu tiên từ trạng thái rỗng
      await writeData(ref, dataRef.current.items.length ? dataRef.current : EMPTY)
    } else {
      dataRef.current = existing
      setData(existing)
      local.saveCachedData(existing)
    }
    local.saveRepoRef(ref, repoInput)
    setRepoRef(ref)
    setAccountLogin(login)
    markSynced()
    setPhase('ready')
  }, [markSynced])

  const disconnect = useCallback(async () => {
    if (writeTimer.current) window.clearTimeout(writeTimer.current)
    if (dirtyRef.current) await flushWrite() // cố ghi nốt thay đổi đang chờ trước khi ngắt
    local.clearConnection()
    clearToken()
    dirtyRef.current = false
    setRepoRef(null)
    setData(EMPTY)
    setPhase('connect')
  }, [flushWrite])

  const mutate = useCallback((updater: (d: AppData) => AppData) => {
    const next = updater(dataRef.current)
    dataRef.current = next
    setData(next)
    if (isDemo) return
    local.saveCachedData(next)
    local.saveDirty(true)
    dirtyRef.current = true
    setSyncStatus('dirty')
    if (writeTimer.current) window.clearTimeout(writeTimer.current)
    writeTimer.current = window.setTimeout(() => void flushWrite(), 2000)
  }, [flushWrite, isDemo])

  const syncNow = useCallback(async () => {
    if (writeTimer.current) window.clearTimeout(writeTimer.current)
    const ok = await flushWrite()
    if (!ok && dirtyRef.current) return // ghi chưa xong thì không đọc đè
    const ref = repoRefRef.current
    if (ref && navigator.onLine) await refresh(ref).catch(() => setSyncStatus('error'))
  }, [flushWrite, refresh])

  const value = useMemo<AppStore>(() => ({
    phase, data, repoRef, accountLogin,
    syncStatus, lastSync, online,
    connect, disconnect, syncNow, mutate,
  }), [phase, data, repoRef, accountLogin, syncStatus, lastSync, online, connect, disconnect, syncNow, mutate])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
