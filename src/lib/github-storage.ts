import type { AppData } from '../types'
import { normalizeData } from './normalize'

/** Nơi lưu dữ liệu: 1 file JSON trong repo GitHub riêng tư của người dùng. */
export interface RepoRef {
  owner: string
  repo: string
  webUrl: string
}

export const DATA_PATH = 'budget-data.json'
const API = 'https://api.github.com'

const TOKEN_KEY = 'bp.ghToken'
// sha của phiên bản file đã biết — GitHub dùng nó để phát hiện ghi đè chồng chéo giữa 2 thiết bị
let lastSha: string | null = null

export function getStoredToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim())
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  lastSha = null
}

async function gh(path: string, init?: RequestInit): Promise<Response> {
  const token = getStoredToken()
  if (!token) throw new Error('NO_TOKEN')
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  })
  return res
}

function b64EncodeUtf8(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(bin)
}

function b64DecodeUtf8(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** "owner/repo" hoặc "https://github.com/owner/repo" thành RepoRef. */
export function parseRepoInput(input: string): { owner: string; repo: string } {
  const s = input.trim().replace(/\.git$/, '').replace(/\/+$/, '')
  const m = s.match(/(?:github\.com[/:])?([\w.-]+)\/([\w.-]+)$/)
  if (!m) throw new Error('BAD_REPO')
  return { owner: m[1], repo: m[2] }
}

export async function whoAmI(): Promise<string> {
  const res = await gh('/user')
  if (!res.ok) throw new Error(`GH_${res.status}`)
  return ((await res.json()).login as string) ?? ''
}

/** Kiểm tra repo tồn tại, token có quyền, và BẮT BUỘC repo phải private (dữ liệu chi tiêu cá nhân). */
export async function connectRepo(input: string): Promise<RepoRef> {
  const { owner, repo } = parseRepoInput(input)
  const res = await gh(`/repos/${owner}/${repo}`)
  if (res.status === 404) throw new Error('REPO_NOT_FOUND')
  if (!res.ok) throw new Error(`GH_${res.status}`)
  const info = await res.json()
  if (!info.private) throw new Error('REPO_IS_PUBLIC')
  if (!info.permissions?.push) throw new Error('NO_WRITE_PERMISSION')
  lastSha = null
  return { owner, repo, webUrl: info.html_url as string }
}

/** Đọc file dữ liệu. File chưa có thì trả null (lần đầu dùng). */
export async function readData(ref: RepoRef): Promise<AppData | null> {
  const res = await gh(`/repos/${ref.owner}/${ref.repo}/contents/${DATA_PATH}`)
  if (res.status === 404) { lastSha = null; return null }
  if (!res.ok) throw new Error(`GH_${res.status}`)
  const body = await res.json()
  lastSha = body.sha as string
  return normalizeData(JSON.parse(b64DecodeUtf8(body.content as string)))
}

/** Ghi file dữ liệu (tạo mới nếu chưa có). Đụng độ phiên bản thì đọc sha mới rồi ghi lại một lần. */
export async function writeData(ref: RepoRef, data: AppData, retry = true): Promise<void> {
  if (lastSha === null) {
    // chưa biết sha (vừa mở app) — hỏi trước để không ghi mù
    const head = await gh(`/repos/${ref.owner}/${ref.repo}/contents/${DATA_PATH}`)
    if (head.ok) lastSha = (await head.json()).sha as string
    else if (head.status !== 404) throw new Error(`GH_${head.status}`)
  }
  const res = await gh(`/repos/${ref.owner}/${ref.repo}/contents/${DATA_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `data: cập nhật ${new Date().toISOString()}`,
      content: b64EncodeUtf8(JSON.stringify(data, null, 2)),
      ...(lastSha ? { sha: lastSha } : {}),
    }),
  })
  if (res.status === 409 || res.status === 422) {
    if (!retry) throw new Error(`GH_CONFLICT`)
    lastSha = null
    return writeData(ref, data, false)
  }
  if (!res.ok) throw new Error(`GH_${res.status}`)
  lastSha = ((await res.json()).content?.sha as string) ?? null
}
