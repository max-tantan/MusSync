const LFM_USER_KEY = 'mussync.lfm-user.v1'
export const LFM_USER_EVT = 'mussync:lfm-user'

export interface LastfmUserLink {
  username: string
  linkedAt: string
}

export function loadLastfmUser(): LastfmUserLink | null {
  try {
    const raw = localStorage.getItem(LFM_USER_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<LastfmUserLink>) : null
    const username = parsed?.username?.trim() ?? ''
    if (!username) return null
    return { username, linkedAt: parsed?.linkedAt ?? '' }
  } catch {
    return null
  }
}

function persist(entry: LastfmUserLink | null) {
  try {
    if (entry) localStorage.setItem(LFM_USER_KEY, JSON.stringify(entry))
    else localStorage.removeItem(LFM_USER_KEY)
  } catch {
    return
  }
  window.dispatchEvent(new Event(LFM_USER_EVT))
}

export function saveLastfmUser(username: string): LastfmUserLink | null {
  const trimmed = username.trim()
  if (!trimmed) return null
  const entry: LastfmUserLink = { username: trimmed, linkedAt: new Date().toISOString() }
  persist(entry)
  return entry
}

export function clearLastfmUser() {
  persist(null)
}
