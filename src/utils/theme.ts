export type Theme = 'dark' | 'light'

export const THEME_KEY = 'mussync.theme.v1'
export const THEME_EVT = 'mussync:theme'

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'dark' || v === 'light') return v
  } catch {
    // penyimpanan tidak tersedia
  }
  return null
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function getInitialTheme(): Theme {
  return getStoredTheme() ?? (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
}

export function setTheme(next: Theme) {
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // penyimpanan penuh — lewati
  }
  applyTheme(next)
  window.dispatchEvent(new CustomEvent(THEME_EVT, { detail: next }))
}