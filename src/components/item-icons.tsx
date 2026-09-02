import type { ReactElement } from 'react'

/**
 * Bộ icon vẽ sẵn cho món đồ (nét đơn, ăn theo màu chữ của chủ đề).
 * Icon được GÁN TỰ ĐỘNG từ tên + danh mục món đồ — không có bước chọn tay.
 */
const ICONS: Record<string, ReactElement> = {
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><line x1="10.3" y1="18.3" x2="13.7" y2="18.3" /></>,
  laptop: <><rect x="4.5" y="4.5" width="15" height="10.5" rx="1.5" /><path d="M2.8 19h18.4l-1.8-3.2H4.6z" /></>,
  tv: <><rect x="2.8" y="4.5" width="18.4" height="12" rx="2" /><line x1="12" y1="16.5" x2="12" y2="20" /><line x1="8.5" y1="20" x2="15.5" y2="20" /></>,
  watch: <><circle cx="12" cy="12" r="5.6" /><path d="M9.6 6.7 10.1 2.6h3.8l.5 4.1M9.6 17.3l.5 4.1h3.8l.5-4.1" /><path d="M12 9.6V12l1.8 1.2" /></>,
  headphones: <><path d="M4 14.5v-2.3a8 8 0 0 1 16 0v2.3" /><rect x="3" y="14" width="4" height="6.3" rx="2" /><rect x="17" y="14" width="4" height="6.3" rx="2" /></>,
  camera: <><rect x="2.8" y="6.8" width="18.4" height="13.4" rx="2.5" /><circle cx="12" cy="13.4" r="4" /><path d="M8.4 6.8 10 4.2h4l1.6 2.6" /></>,
  gamepad: <><rect x="2.5" y="8" width="19" height="9.6" rx="4.8" /><path d="M8 10.7v4M6 12.7h4" /><circle cx="15.8" cy="11.6" r="1" fill="currentColor" stroke="none" /><circle cx="18" cy="13.9" r="1" fill="currentColor" stroke="none" /></>,
  speaker: <><rect x="6.5" y="2.8" width="11" height="18.4" rx="2.2" /><circle cx="12" cy="14.8" r="3.4" /><circle cx="12" cy="7.3" r="1.4" /></>,
  fridge: <><rect x="6.5" y="2.5" width="11" height="19" rx="1.8" /><line x1="6.5" y1="9.5" x2="17.5" y2="9.5" /><line x1="9" y1="5.4" x2="9" y2="7.4" /><line x1="9" y1="11.8" x2="9" y2="15" /></>,
  washer: <><rect x="4" y="2.8" width="16" height="18.4" rx="2" /><circle cx="12" cy="13.3" r="4.8" /><circle cx="12" cy="13.3" r="1.9" /><circle cx="7" cy="5.8" r="0.9" fill="currentColor" stroke="none" /><line x1="14.5" y1="5.8" x2="17.5" y2="5.8" /></>,
  aircon: <><rect x="2.8" y="4.5" width="18.4" height="7.2" rx="2" /><line x1="6" y1="9.2" x2="18" y2="9.2" /><path d="M7.8 14.8c0 1.6-1.5 1.7-1.5 3.4M12 14.8c0 1.6-1.5 1.7-1.5 3.4M16.2 14.8c0 1.6-1.5 1.7-1.5 3.4" /></>,
  purifier: <><rect x="7" y="2.8" width="10" height="18.4" rx="3" /><line x1="9.6" y1="6.3" x2="14.4" y2="6.3" /><circle cx="12" cy="13.6" r="3.1" /></>,
  vacuum: <><circle cx="12" cy="12" r="8.6" /><circle cx="12" cy="12" r="3.1" /><path d="M4.7 8.6a8.6 8.6 0 0 1 14.6 0" /></>,
  kitchen: <><path d="M5 10.5h14v5.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" /><path d="M3 10.5h18" /><path d="M6.5 8c1-2 3-3.2 5.5-3.2S16.5 6 17.5 8" /><line x1="12" y1="2.8" x2="12" y2="4.8" /></>,
  coffee: <><path d="M4.8 8.5h11v6.7a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z" /><path d="M15.8 10h1.7a2.3 2.3 0 0 1 0 4.6h-1.7" /><path d="M8.3 5.6c0-1.1 1-1.1 1-2.2M11.8 5.6c0-1.1 1-1.1 1-2.2" /></>,
  chair: <><rect x="8.3" y="2.8" width="7.4" height="9.8" rx="2.4" /><path d="M8.3 13h7.4" /><line x1="12" y1="13" x2="12" y2="17.2" /><path d="M8.2 21l3.8-3.8 3.8 3.8" /></>,
  sofa: <><rect x="2.5" y="10" width="19" height="7" rx="2" /><path d="M5.2 10V7.6A2.6 2.6 0 0 1 7.8 5h8.4a2.6 2.6 0 0 1 2.6 2.6V10" /><line x1="5.5" y1="17" x2="5.5" y2="19.6" /><line x1="18.5" y1="17" x2="18.5" y2="19.6" /></>,
  bed: <><path d="M3 5.2v14M21 19.2v-5.7a3 3 0 0 0-3-3H3M3 15.8h18" /><circle cx="7.2" cy="9" r="1.7" /></>,
  lamp: <><path d="M8 3h8l2.6 6.4H5.4z" /><line x1="12" y1="9.4" x2="12" y2="17.8" /><path d="M7.8 20.8h8.4L14.6 18H9.4z" /></>,
  shoe: <><path d="M3.4 16.8c0-3.8.9-8.3.9-8.3l3 2c2 1.4 4 2 6.4 2.5 3 .6 6.8 1.6 6.8 3.6v1.7H3.4z" /><path d="M9 12.6l1.5-1.6M11.8 13.4l1.4-1.6" /></>,
  bag: <><path d="M5 9.2h14l-1.2 11.3H6.2z" /><path d="M8.5 9.2V7.6a3.5 3.5 0 0 1 7 0v1.6" /></>,
  shirt: <><path d="M8.4 3.6 3.8 6.8l2 3.4 2-1.2v11.4h8.4V9l2 1.2 2-3.4-4.6-3.2a3.6 3.6 0 0 1-7.2 0z" /></>,
  ring: <><circle cx="12" cy="14.6" r="5.6" /><path d="M9.6 6.4h4.8l1.5 2.4-3.9 3-3.9-3z" /></>,
  bike: <><circle cx="6" cy="16.3" r="3.9" /><circle cx="18" cy="16.3" r="3.9" /><path d="M6 16.3 9.4 9h4.8l3.8 7.3M9.4 9l2.4 7.3H6M10.4 9H14" /></>,
  motorbike: <><circle cx="5.8" cy="16.8" r="3.4" /><circle cx="18.2" cy="16.8" r="3.4" /><path d="M5.8 16.8h6.4l2.4-6h3.6" /><path d="M12.2 16.8c0-3-2.2-5-5.2-5" /><path d="M13.6 8h2.6l1 2.8" /></>,
  car: <><path d="M4.2 14 5.7 9.8a2.5 2.5 0 0 1 2.4-1.7h7.8a2.5 2.5 0 0 1 2.4 1.7L19.8 14" /><rect x="3" y="14" width="18" height="4.4" rx="1.5" /><circle cx="7.4" cy="18.4" r="1.7" /><circle cx="16.6" cy="18.4" r="1.7" /></>,
  book: <><path d="M12 6.2c-2-1.8-4.8-2-8-2v13.6c3.2 0 6 .2 8 2 2-1.8 4.8-2 8-2V4.2c-3.2 0-6 .2-8 2z" /><line x1="12" y1="6.2" x2="12" y2="19.8" /></>,
  music: <><path d="M9 17.8V5.2l9-2v12.6" /><circle cx="6.7" cy="17.8" r="2.4" /><circle cx="15.7" cy="15.8" r="2.4" /></>,
  dumbbell: <><path d="M7 7.6v8.8M17 7.6v8.8M4 10v4M20 10v4M7 12h10" /></>,
  gift: <><rect x="4.5" y="8.4" width="15" height="4" rx="1" /><path d="M6 12.4v7.2a1.4 1.4 0 0 0 1.4 1.4h9.2a1.4 1.4 0 0 0 1.4-1.4v-7.2" /><line x1="12" y1="8.4" x2="12" y2="21" /><path d="M12 8.4C12 5.4 8.6 3.4 8 5.6c-.5 2 4 2.8 4 2.8s4.5-.8 4-2.8c-.6-2.2-4-.2-4 2.8" /></>,
}

export type IconKey = keyof typeof ICONS

/** [từ khóa, icon] — xét theo thứ tự, cụm cụ thể đứng trước; so khớp theo ranh giới từ, không phân biệt dấu. */
const KEYWORDS: [string, string][] = [
  ['may loc', 'purifier'], ['may giat', 'washer'], ['may lanh', 'aircon'], ['dieu hoa', 'aircon'],
  ['may anh', 'camera'], ['gopro', 'camera'], ['may chay bo', 'dumbbell'],
  ['xe may', 'motorbike'], ['vespa', 'motorbike'], ['moto', 'motorbike'],
  ['xe dap', 'bike'], ['o to', 'car'], ['oto', 'car'], ['xe hoi', 'car'], ['car', 'car'], ['vinfast', 'car'],
  ['hut bui', 'vacuum'], ['robot', 'vacuum'], ['tu lanh', 'fridge'],
  ['dien thoai', 'phone'], ['iphone', 'phone'], ['smartphone', 'phone'], ['pixel', 'phone'], ['galaxy', 'phone'],
  ['laptop', 'laptop'], ['macbook', 'laptop'], ['notebook', 'laptop'], ['may tinh', 'laptop'], ['pc', 'laptop'],
  ['tivi', 'tv'], ['tv', 'tv'], ['man hinh', 'tv'], ['monitor', 'tv'], ['may chieu', 'tv'],
  ['dong ho', 'watch'], ['watch', 'watch'],
  ['tai nghe', 'headphones'], ['headphone', 'headphones'], ['airpod', 'headphones'], ['earbud', 'headphones'],
  ['game', 'gamepad'], ['ps5', 'gamepad'], ['playstation', 'gamepad'], ['xbox', 'gamepad'], ['nintendo', 'gamepad'], ['switch', 'gamepad'],
  ['loa', 'speaker'], ['speaker', 'speaker'], ['soundbar', 'speaker'],
  ['noi chien', 'kitchen'], ['noi com', 'kitchen'], ['lo vi song', 'kitchen'], ['bep', 'kitchen'], ['am sieu toc', 'kitchen'], ['chao', 'kitchen'], ['lo nuong', 'kitchen'],
  ['ca phe', 'coffee'], ['cafe', 'coffee'], ['coffee', 'coffee'], ['espresso', 'coffee'],
  ['sofa', 'sofa'], ['ghe', 'chair'], ['giuong', 'bed'], ['nem', 'bed'], ['dem', 'bed'],
  ['den', 'lamp'], ['lamp', 'lamp'],
  ['giay', 'shoe'], ['sneaker', 'shoe'], ['boot', 'shoe'],
  ['tui', 'bag'], ['balo', 'bag'], ['vali', 'bag'], ['bag', 'bag'],
  ['ao', 'shirt'], ['quan', 'shirt'], ['vay', 'shirt'], ['dam', 'shirt'],
  ['nhan', 'ring'], ['day chuyen', 'ring'], ['trang suc', 'ring'],
  ['sach', 'book'], ['book', 'book'],
  ['guitar', 'music'], ['piano', 'music'], ['dan', 'music'],
  ['ta', 'dumbbell'], ['gym', 'dumbbell'],
]

const CATEGORY_DEFAULT: Record<string, string> = {
  'Điện tử': 'phone',
  'Gia dụng': 'washer',
  'Nội thất': 'sofa',
  'Cá nhân': 'bag',
  'Khác': 'gift',
}

function stripDiacritics(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/đ/g, 'd')
}

/** Chọn icon cho món đồ từ tên; không nhận ra thì lấy theo danh mục. */
export function iconKeyFor(name: string, category: string): string {
  const n = ` ${stripDiacritics(name)} `
  for (const [kw, key] of KEYWORDS) {
    if (new RegExp(`[^a-z0-9]${kw}[^a-z0-9]`).test(n)) return key
  }
  return CATEGORY_DEFAULT[category] ?? 'gift'
}

export function ItemIcon({ kind, size = 22 }: { kind: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
    >
      {ICONS[kind] ?? ICONS.gift}
    </svg>
  )
}
