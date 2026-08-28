const RECENT_KEY = 'mussync.recent.v1'
export const RECENT_EVT = 'mussync:recent'
const MAX = 8

export interface RecentEntry {
  id: string
  title: string
  artist: string
  image: string | null
}

export function loadRecents(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const arr = raw ? (JSON.parse(raw) as RecentEntry[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function persist(list: RecentEntry[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // penyimpanan penuh — lewati
  }
}

export function pushRecent(entry: RecentEntry) {
  const next = [
    entry,
    ...loadRecents().filter((r) => r.id !== entry.id),
  ].slice(0, MAX)
  persist(next)
  window.dispatchEvent(new Event(RECENT_EVT))
}