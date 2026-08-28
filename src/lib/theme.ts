import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'mussync.theme.v1'
const THEME_EVT = 'mussync:theme'

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

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, set] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const handler = (e: Event) => set((e as CustomEvent<Theme>).detail)
    window.addEventListener(THEME_EVT, handler)
    return () => window.removeEventListener(THEME_EVT, handler)
  }, [])

  return [theme, setTheme]
}