/** Chỉ chấp nhận link http/https — chặn javascript:, data:, vbscript:… (dữ liệu từ Excel là dữ liệu không tin cậy). */
export function safeHttpUrl(raw: string): string {
  const s = (raw ?? '').trim()
  if (!s) return ''
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : ''
  } catch {
    return ''
  }
}
