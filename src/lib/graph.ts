import { getToken } from './msal'
import type { AppData } from '../types'
import {
  SHEETS, type SheetName,
  rowsToItems, rowsToQuotes, rowsToSavings, rowsToSettings,
  itemsToRows, quotesToRows, savingsToRows, settingsToRows, numberFormats,
} from './graph-sheets'

const GRAPH = 'https://graph.microsoft.com/v1.0'

export interface FileRef {
  driveId: string
  itemId: string
  name: string
  webUrl: string
}

const RETRYABLE = new Set([429, 500, 502, 503, 504])

async function graphFetch(path: string, init?: RequestInit, retries = 2): Promise<Response> {
  const token = await getToken()
  const res = await fetch(`${GRAPH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    if (RETRYABLE.has(res.status) && retries > 0) {
      const retryAfter = Number(res.headers.get('Retry-After')) || 1.5
      await new Promise((r) => setTimeout(r, retryAfter * 1000))
      return graphFetch(path, init, retries - 1)
    }
    const body = await res.text().catch(() => '')
    throw new Error(`GRAPH_${res.status}: ${body.slice(0, 300)}`)
  }
  return res
}

/** Share link -> Graph share id ("u!" + base64url of the URL) */
function encodeShareUrl(url: string): string {
  const b64 = btoa(unescape(encodeURIComponent(url.trim())))
  return 'u!' + b64.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-')
}

/** Resolve a OneDrive share link to a concrete drive item. */
export async function resolveShareLink(shareUrl: string): Promise<FileRef> {
  const res = await graphFetch(`/shares/${encodeShareUrl(shareUrl)}/driveItem?$select=id,name,webUrl,parentReference,file`)
  const it = await res.json()
  if (!it.file || !/\.xlsx$/i.test(it.name)) throw new Error('NOT_XLSX')
  return { driveId: it.parentReference.driveId, itemId: it.id, name: it.name, webUrl: it.webUrl }
}

export async function getMe(): Promise<{ email: string; name: string }> {
  const res = await graphFetch('/me?$select=displayName,userPrincipalName,mail')
  const me = await res.json()
  return { email: me.mail || me.userPrincipalName || '', name: me.displayName || '' }
}

function wbPath(f: FileRef, rest: string): string {
  return `/drives/${f.driveId}/items/${f.itemId}/workbook${rest}`
}

/** Create any missing sheets and write header rows. Returns names that were created. */
export async function ensureSheets(f: FileRef): Promise<string[]> {
  const res = await graphFetch(wbPath(f, '/worksheets?$select=name'))
  const existing = new Set(((await res.json()).value as { name: string }[]).map((w) => w.name))
  const created: string[] = []
  for (const name of Object.keys(SHEETS) as SheetName[]) {
    if (!existing.has(name)) {
      await graphFetch(wbPath(f, '/worksheets/add'), { method: 'POST', body: JSON.stringify({ name }) })
      created.push(name)
    }
  }
  return created
}

async function readSheet(f: FileRef, name: SheetName): Promise<(string | number | boolean | null)[][]> {
  const res = await graphFetch(wbPath(f, `/worksheets('${name}')/usedRange(valuesOnly=true)?$select=values`))
  const values = ((await res.json()).values ?? []) as (string | number | boolean | null)[][]
  // drop the header row if present
  if (values.length > 0 && String(values[0][0]).toLowerCase() === SHEETS[name][0]) return values.slice(1)
  return values
}

function columnLetter(n: number): string {
  if (n < 1 || n > 26) throw new Error(`SHEET_TOO_WIDE: ${n} columns`) // đủ cho 15 cột hiện tại; mở rộng thì viết helper AA/AB
  return String.fromCharCode(64 + n)
}

async function writeSheet(f: FileRef, name: SheetName, dataRows: (string | number | boolean | null)[][]): Promise<void> {
  // Ghi đè dữ liệu mới TRƯỚC, sau đó mới dọn các dòng thừa bên dưới —
  // nếu rớt mạng giữa chừng thì file vẫn còn dữ liệu, không bao giờ có cửa sổ sheet trắng.
  const header = [...SHEETS[name]] as (string | number | boolean | null)[]
  const all = [header, ...dataRows]
  const lastCol = columnLetter(header.length)

  const usedRes = await graphFetch(wbPath(f, `/worksheets('${name}')/usedRange(valuesOnly=true)?$select=rowCount`))
  const oldRows = ((await usedRes.json()).rowCount ?? 0) as number

  await graphFetch(wbPath(f, `/worksheets('${name}')/range(address='A1:${lastCol}${all.length}')`), {
    method: 'PATCH',
    body: JSON.stringify({ values: all, numberFormat: numberFormats(name, all.length) }),
  })

  if (oldRows > all.length) {
    await graphFetch(wbPath(f, `/worksheets('${name}')/range(address='A${all.length + 1}:${lastCol}${oldRows}')/clear`), {
      method: 'POST',
      body: JSON.stringify({ applyTo: 'Contents' }),
    })
  }
}

export async function readAll(f: FileRef): Promise<AppData> {
  const [items, quotes, savings, settings] = await Promise.all([
    readSheet(f, 'Items'),
    readSheet(f, 'Quotes'),
    readSheet(f, 'Savings'),
    readSheet(f, 'Settings'),
  ])
  return {
    items: rowsToItems(items),
    quotes: rowsToQuotes(quotes),
    savings: rowsToSavings(savings),
    settings: rowsToSettings(settings),
  }
}

export async function writeAll(f: FileRef, data: AppData): Promise<void> {
  // sequential to avoid workbook write conflicts
  await writeSheet(f, 'Items', itemsToRows(data.items))
  await writeSheet(f, 'Quotes', quotesToRows(data.quotes))
  await writeSheet(f, 'Savings', savingsToRows(data.savings))
  await writeSheet(f, 'Settings', settingsToRows(data.settings))
}
