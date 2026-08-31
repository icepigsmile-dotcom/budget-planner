import type { AppData } from '../types'
import type { FileRef } from './graph'

const DATA_KEY = 'bp.cache.data'
const FILE_KEY = 'bp.fileRef'
const LINK_KEY = 'bp.shareUrl'
const SYNC_KEY = 'bp.lastSync'

export function loadCachedData(): AppData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    return raw ? (JSON.parse(raw) as AppData) : null
  } catch {
    return null
  }
}

export function saveCachedData(data: AppData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  } catch {
    /* storage full or blocked — cache is best-effort */
  }
}

export function loadFileRef(): FileRef | null {
  try {
    const raw = localStorage.getItem(FILE_KEY)
    return raw ? (JSON.parse(raw) as FileRef) : null
  } catch {
    return null
  }
}

export function saveFileRef(ref: FileRef, shareUrl: string): void {
  localStorage.setItem(FILE_KEY, JSON.stringify(ref))
  localStorage.setItem(LINK_KEY, shareUrl)
}

export function loadShareUrl(): string {
  return localStorage.getItem(LINK_KEY) || ''
}

export function saveLastSync(iso: string): void {
  localStorage.setItem(SYNC_KEY, iso)
}

export function loadLastSync(): string {
  return localStorage.getItem(SYNC_KEY) || ''
}

const DIRTY_KEY = 'bp.dirty'

/** Cờ "còn thay đổi chưa ghi lên file" — sống qua reload/redirect đăng nhập. */
export function saveDirty(dirty: boolean): void {
  try {
    if (dirty) localStorage.setItem(DIRTY_KEY, '1')
    else localStorage.removeItem(DIRTY_KEY)
  } catch { /* best-effort */ }
}

export function loadDirty(): boolean {
  return localStorage.getItem(DIRTY_KEY) === '1'
}

export function clearConnection(): void {
  localStorage.removeItem(DIRTY_KEY)
  localStorage.removeItem(FILE_KEY)
  localStorage.removeItem(LINK_KEY)
  localStorage.removeItem(DATA_KEY)
  localStorage.removeItem(SYNC_KEY)
}
