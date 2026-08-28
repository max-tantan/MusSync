export const PROFILE_KEY = 'mussync.profile.v1'

export interface ProfileData {
  username: string
  avatar: string | null
  createdAt: string
}

const EMPTY: ProfileData = {
  username: '',
  avatar: null,
  createdAt: '',
}

export function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<ProfileData>) : null
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY }
    return {
      username:
        typeof parsed.username === 'string' ? parsed.username : EMPTY.username,
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar : null,
      createdAt:
        typeof parsed.createdAt === 'string'
          ? parsed.createdAt
          : EMPTY.createdAt,
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveProfile(profile: ProfileData) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // penyimpanan penuh / tidak tersedia — lewati
  }
}

export function loadUser(): string {
  return loadProfile().username || ''
}

export function saveUsername(name: string) {
  const profile = loadProfile()
  saveProfile({ ...profile, username: name, createdAt: profile.createdAt || new Date().toISOString().slice(0, 10) })
}
