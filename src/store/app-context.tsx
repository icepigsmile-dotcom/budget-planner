import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppData } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { completeRedirect, getStoredClientId, login, logout, setStoredClientId } from '../lib/msal'
import { ensureSheets, getMe, readAll, resolveShareLink, writeAll, type FileRef } from '../lib/graph'
import * as local from '../lib/storage-local'

export type SyncStatus = 'synced' | 'syncing' | 'dirty' | 'offline' | 'error'
export type Phase = 'boot' | 'connect' | 'ready'

interface AppStore {
  phase: Phase
  data: AppData
  fileRef: FileRef | null
  shareUrl: string
  accountEmail: string
  syncStatus: SyncStatus
  lastSync: string
  online: boolean
  connectError: string
  signIn: () => Promise<void>
  connectFile: (shareUrl: string, clientId: string) => Promise<void>
  disconnect: () => Promise<void>
  syncNow: () => Promise<void>
  mutate: (updater: (d: AppData) => AppData) => void
}

const EMPTY: AppData = { items: [], quotes: [], savings: [], settings: DEFAULT_SETTINGS }
const Ctx = createContext<AppStore | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('boot')
  const [data, setData] = useState<AppData>(EMPTY)
  const [fileRef, setFileRef] = useState<FileRef | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [lastSync, setLastSync] = useState(local.loadLastSync())
  const [online, setOnline] = useState(navigator.onLine)
  const [connectError, setConnectError] = useState('')
  const writeTimer = useRef<number | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data
  const fileRefRef = useRef(fileRef)
  fileRefRef.current = fileRef
  // dirtyRef phản chiếu cờ bp.dirty: còn true nghĩa là còn thay đổi local chưa ghi lên file
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

  /** Đọc file về. KHÔNG bao giờ đè lên thay đổi local chưa ghi. */
  const refreshFromGraph = useCallback(async (ref: FileRef) => {
    if (dirtyRef.current) return
    setSyncStatus('syncing')
    const fresh = await readAll(ref)
    if (dirtyRef.current) return // người dùng vừa sửa trong lúc đang tải — giữ bản local
    dataRef.current = fresh
    setData(fresh)
    local.saveCachedData(fresh)
    markSynced()
  }, [markSynced])

  /** Ghi toàn bộ dữ liệu hiện tại lên file. Trả về true nếu thành công. Gọi chồng sẽ gộp làm một. */
  const flushWrite = useCallback(async (): Promise<boolean> => {
    if (writeInFlight.current) return writeInFlight.current
    const run = (async () => {
      const ref = fileRefRef.current
      if (!ref || !dirtyRef.current) return !dirtyRef.current
      if (!navigator.onLine) { setSyncStatus('offline'); return false }
      setSyncStatus('syncing')
      try {
        await writeAll(ref, dataRef.current)
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

  // boot: finish a pending login redirect, restore connection, refresh data
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
        // cờ dirty còn nhưng cache mất (bị xóa tay): không có gì để ghi, bỏ cờ để khỏi chặn đọc file
        local.saveDirty(false)
        dirtyRef.current = false
      }
      const ref = local.loadFileRef()
      try {
        const account = await completeRedirect()
        if (account && ref) {
          setFileRef(ref)
          setAccountEmail(account.username)
          setPhase('ready')
          if (!navigator.onLine) { setSyncStatus('offline'); return }
          if (dirtyRef.current) {
            // còn thay đổi chưa ghi từ phiên trước: đẩy bản local lên file trước, không để file cũ đè mất
            const ok = await flushWrite()
            if (!ok) return // ghi chưa được thì tuyệt đối không đọc đè
          }
          await refreshFromGraph(ref)
          return
        }
      } catch {
        if (ref && cached) { setFileRef(ref); setPhase('ready'); setSyncStatus('offline'); return }
      }
      setPhase('connect')
    })().catch(() => setPhase('connect'))
  }, [refreshFromGraph, isDemo])

  const signIn = useCallback(async () => {
    setConnectError('')
    await login()
  }, [])

  const connectFile = useCallback(async (shareUrl: string, clientId: string) => {
    setConnectError('')
    if (clientId && clientId !== getStoredClientId()) setStoredClientId(clientId)
    try {
      const ref = await resolveShareLink(shareUrl)
      await ensureSheets(ref)
      local.saveFileRef(ref, shareUrl)
      setFileRef(ref)
      const me = await getMe().catch(() => ({ email: '', name: '' }))
      setAccountEmail(me.email)
      await refreshFromGraph(ref)
      setPhase('ready')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg === 'NOT_SIGNED_IN' || msg === 'MISSING_CLIENT_ID') throw e
      setConnectError(msg)
      throw e
    }
  }, [refreshFromGraph])

  const disconnect = useCallback(async () => {
    if (writeTimer.current) window.clearTimeout(writeTimer.current)
    if (dirtyRef.current) await flushWrite() // cố ghi nốt thay đổi đang chờ trước khi ngắt
    local.clearConnection()
    dirtyRef.current = false
    setFileRef(null)
    setData(EMPTY)
    setPhase('connect')
    await logout().catch(() => undefined)
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
    const ref = fileRefRef.current
    if (ref && navigator.onLine) await refreshFromGraph(ref).catch(() => setSyncStatus('error'))
  }, [flushWrite, refreshFromGraph])

  const value = useMemo<AppStore>(() => ({
    phase, data, fileRef, shareUrl: local.loadShareUrl(), accountEmail,
    syncStatus, lastSync, online, connectError,
    signIn, connectFile, disconnect, syncNow, mutate,
  }), [phase, data, fileRef, accountEmail, syncStatus, lastSync, online, connectError, signIn, connectFile, disconnect, syncNow, mutate])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
