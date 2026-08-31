import type { AppData } from '../types'
import type { RepoRef } from './github-storage'

const DATA_KEY = 'bp.cache.data'
const REPO_KEY = 'bp.repoRef'
const REPO_INPUT_KEY = 'bp.repoInput'
const SYNC_KEY = 'bp.lastSync'
const DIRTY_KEY = 'bp.dirty'

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

export function loadRepoRef(): RepoRef | null {
  try {
    const raw = localStorage.getItem(REPO_KEY)
    const ref = raw ? (JSON.parse(raw) as RepoRef) : null
    return ref && ref.owner && ref.repo ? ref : null
  } catch {
    return null
  }
}

export function saveRepoRef(ref: RepoRef, repoInput: string): void {
  localStorage.setItem(REPO_KEY, JSON.stringify(ref))
  localStorage.setItem(REPO_INPUT_KEY, repoInput)
}

export function loadRepoInput(): string {
  return localStorage.getItem(REPO_INPUT_KEY) || ''
}

export function saveLastSync(iso: string): void {
  localStorage.setItem(SYNC_KEY, iso)
}

export function loadLastSync(): string {
  return localStorage.getItem(SYNC_KEY) || ''
}

/** Cờ "còn thay đổi chưa ghi lên repo" — sống qua reload. */
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
  localStorage.removeItem(REPO_KEY)
  localStorage.removeItem(REPO_INPUT_KEY)
  localStorage.removeItem(DATA_KEY)
  localStorage.removeItem(SYNC_KEY)
  // dọn cả key của bản OneDrive cũ nếu còn
  localStorage.removeItem('bp.fileRef')
  localStorage.removeItem('bp.shareUrl')
  localStorage.removeItem('bp.msalClientId')
}
