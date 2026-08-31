import type { Quote } from '../types'
import { formatVnd } from '../lib/money'
import { Stars } from './ui'

export const QUOTE_STALE_MS = 30 * 86400000

/** Bản ghi mới nhất của mỗi nơi bán. */
export function latestQuotesBySeller(quotes: Quote[]): Quote[] {
  const map = new Map<string, Quote>()
  for (const q of quotes) {
    const cur = map.get(q.seller)
    if (!cur || q.fetchedAt > cur.fetchedAt) map.set(q.seller, q)
  }
  return [...map.values()].sort((a, b) => a.price - b.price)
}

export interface QuoteVerdicts {
  cheapestId: string
  bestRatedId: string
  suggestedId: string
  reason: string
}

/** Gợi ý của app: cân bằng giá (60%) và đánh giá (40%). */
export function judgeQuotes(latest: Quote[]): QuoteVerdicts {
  if (latest.length === 0) return { cheapestId: '', bestRatedId: '', suggestedId: '', reason: '' }
  const cheapest = latest.reduce((a, b) => (b.price < a.price ? b : a))
  const rated = latest.filter((q) => q.rating > 0)
  const bestRated = rated.length ? rated.reduce((a, b) => (b.rating > a.rating ? b : a)) : cheapest
  const maxPrice = Math.max(...latest.map((q) => q.price))
  const score = (q: Quote) => (q.price / maxPrice) * 0.6 - (q.rating / 5) * 0.4
  const suggested = latest.reduce((a, b) => (score(b) < score(a) ? b : a))
  let reason = ''
  if (suggested.id === cheapest.id && suggested.id === bestRated.id) reason = 'Vừa rẻ nhất vừa được đánh giá tốt nhất.'
  else if (suggested.id === cheapest.id) reason = `Rẻ nhất trong các nguồn, đánh giá ${suggested.rating ? `${suggested.rating}★` : 'chưa có'} vẫn ổn.`
  else reason = `Đắt hơn nơi rẻ nhất ${formatVnd(suggested.price - cheapest.price)} nhưng đánh giá ${suggested.rating}★ trên ${suggested.reviewCount.toLocaleString('vi-VN')} lượt — cân bằng tốt nhất giữa giá và độ tin cậy.`
  return { cheapestId: cheapest.id, bestRatedId: bestRated.id, suggestedId: suggested.id, reason }
}

function isStale(q: Quote): boolean {
  const t = Date.parse(q.fetchedAt)
  return !Number.isNaN(t) && Date.now() - t > QUOTE_STALE_MS
}

export function QuoteRow({ quote, verdicts, chosen, onChoose, onDelete }: {
  quote: Quote
  verdicts: QuoteVerdicts
  chosen: boolean
  onChoose: () => void
  onDelete: () => void
}) {
  const stale = isStale(quote)
  const days = stale ? Math.floor((Date.now() - Date.parse(quote.fetchedAt)) / 86400000) : 0
  return (
    <div
      style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center',
        padding: '11px 14px', borderTop: '1px solid var(--row-border)', fontSize: 12.5,
        background: chosen ? 'var(--ok-bg)' : stale ? 'var(--table-head-bg)' : 'transparent',
      }}
    >
      <div style={{ flex: '1 1 150px', minWidth: 0 }}>
        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {quote.url ? <a href={quote.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{quote.seller} ↗</a> : quote.seller}
          {chosen && <span style={{ background: 'var(--ok)', color: '#fff', fontSize: 9.5, borderRadius: 4, padding: '2px 5px' }}>ĐÃ CHỌN</span>}
          {stale && <span style={{ background: 'var(--warn-bg)', color: 'var(--warn)', fontSize: 9.5, borderRadius: 4, padding: '2px 5px' }}>GIÁ CŨ · {days} NGÀY</span>}
        </div>
        <div style={{ fontSize: 10.5, marginTop: 2 }}>
          {quote.id === verdicts.suggestedId && <span style={{ color: 'var(--ok)', fontWeight: 600 }}>Gợi ý của app</span>}
          {quote.id === verdicts.suggestedId && (quote.id === verdicts.cheapestId || quote.id === verdicts.bestRatedId) && ' · '}
          {quote.id === verdicts.cheapestId && <span style={{ color: 'var(--warn)', fontWeight: 600 }}>Rẻ nhất</span>}
          {quote.id === verdicts.cheapestId && quote.id === verdicts.bestRatedId && ' · '}
          {quote.id === verdicts.bestRatedId && quote.rating > 0 && <span style={{ color: 'var(--lav)', fontWeight: 600 }}>Đánh giá tốt nhất</span>}
          {quote.isManual && <span className="faint"> · nhập thủ công</span>}
        </div>
      </div>
      <div className="num" style={{ fontWeight: 700, flex: 'none' }}>{formatVnd(quote.price)}</div>
      <div style={{ flex: 'none', minWidth: 86 }}><Stars rating={quote.rating} count={quote.reviewCount} /></div>
      <div className="muted" style={{ flex: '1 1 90px', fontSize: 11.5 }}>{quote.promo || '—'}</div>
      <div style={{ flex: 'none', display: 'flex', gap: 6 }}>
        {!chosen && (
          <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={onChoose}>Chọn mua ở đây</button>
        )}
        <button aria-label="Xóa báo giá" onClick={onDelete} style={{ color: 'var(--text-3)', fontSize: 13, padding: '0 4px' }}>✕</button>
      </div>
    </div>
  )
}
