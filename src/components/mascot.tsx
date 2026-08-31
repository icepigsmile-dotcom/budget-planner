import type { ReactElement } from 'react'

/** Linh vật pastel lấy từ mockup: heo, thỏ, mèo, gấu. */

export function PiggyMascot({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 40) / 44} viewBox="0 0 44 40">
      <circle cx="9" cy="9" r="5" fill="#F6B8C8" />
      <circle cx="35" cy="9" r="5" fill="#F6B8C8" />
      <ellipse cx="22" cy="23" rx="17" ry="15" fill="#F9C9D4" />
      <rect x="16" y="6" width="12" height="3" rx="1.5" fill="#B96A85" />
      <ellipse cx="22" cy="26" rx="6.5" ry="5" fill="#F29BB1" />
      <circle cx="19.8" cy="26" r="1.2" fill="#B96A85" />
      <circle cx="24.2" cy="26" r="1.2" fill="#B96A85" />
      <circle cx="13" cy="19" r="1.8" fill="#5C4450" />
      <circle cx="31" cy="19" r="1.8" fill="#5C4450" />
      <circle cx="9.5" cy="24" r="2.5" fill="#FBD3DE" />
      <circle cx="34.5" cy="24" r="2.5" fill="#FBD3DE" />
    </svg>
  )
}

export function BunnyMascot({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 40) / 36} viewBox="0 0 36 40">
      <ellipse cx="12" cy="8" rx="4" ry="8" fill="#F6B8C8" />
      <ellipse cx="24" cy="8" rx="4" ry="8" fill="#F6B8C8" />
      <ellipse cx="18" cy="26" rx="14" ry="12" fill="#F9D5DC" />
      <circle cx="13" cy="24" r="1.7" fill="#5C4450" />
      <circle cx="23" cy="24" r="1.7" fill="#5C4450" />
      <ellipse cx="18" cy="28" rx="1.6" ry="1.1" fill="#F29BB1" />
    </svg>
  )
}

export function CatMascot({ size = 30, tone = '#DCD6F7' }: { size?: number; tone?: string }) {
  const ear = tone === '#FBE7B2' ? '#F2CF8D' : '#CBC2F0'
  return (
    <svg width={size} height={(size * 36) / 40} viewBox="0 0 40 36">
      <path d="M8 12 L5 2 L15 7z" fill={ear} />
      <path d="M32 12 L35 2 L25 7z" fill={ear} />
      <ellipse cx="20" cy="21" rx="15" ry="13" fill={tone} />
      <circle cx="14" cy="19" r="1.8" fill="#5C4450" />
      <circle cx="26" cy="19" r="1.8" fill="#5C4450" />
      <path d="M18 24 q2 2 4 0" stroke="#5C4450" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="10.5" cy="23" r="2.2" fill="#F9D5DC" />
      <circle cx="29.5" cy="23" r="2.2" fill="#F9D5DC" />
    </svg>
  )
}

const AVATARS: { bg: string; render: (size: number) => ReactElement }[] = [
  { bg: '#EFEBFC', render: (s) => <CatMascot size={s} tone="#DCD6F7" /> },
  { bg: '#FBEFF2', render: (s) => <BunnyMascot size={s} /> },
  { bg: '#FDF3DE', render: (s) => <CatMascot size={s} tone="#FBE7B2" /> },
  { bg: '#FBEFF2', render: (s) => <PiggyMascot size={s} /> },
]

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Ô ảnh của món đồ: có ảnh thì hiện ảnh; không thì pastel hiện linh vật, minimal hiện ô "Ảnh". */
export function ItemAvatar({ id, imageUrl, size = 46, theme }: { id: string; imageUrl?: string; size?: number; theme: string }) {
  const radius = theme === 'pastel' ? size * 0.35 : size * 0.2
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: radius, objectFit: 'cover', flex: 'none' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  if (theme === 'pastel') {
    const a = AVATARS[hashCode(id) % AVATARS.length]
    return (
      <div style={{ width: size, height: size, flex: 'none', borderRadius: radius, background: a.bg, display: 'grid', placeItems: 'center' }}>
        {a.render(Math.round(size * 0.58))}
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, flex: 'none', borderRadius: radius, background: 'var(--progress-track)', display: 'grid', placeItems: 'center', fontSize: 9, color: 'var(--text-3)' }}>
      Ảnh
    </div>
  )
}

/** Logo góc sidebar: pastel = heo đất, minimal = ô ₫ xanh. */
export function AppLogo({ theme }: { theme: string }) {
  if (theme === 'pastel') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PiggyMascot size={40} />
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25, fontFamily: 'var(--font-head)' }}>Heo Đất<br />Planner</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: '#2E7D5F', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>₫</div>
      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: 'var(--sidebar-active-text)' }}>Kế hoạch<br />mua sắm</div>
    </div>
  )
}
