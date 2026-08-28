import { useEffect, useState } from 'react'
import { getInitialTheme, setTheme, THEME_EVT } from '../utils/theme'
import type { Theme } from '../utils/theme'

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, set] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const handler = (e: Event) => set((e as CustomEvent<Theme>).detail)
    window.addEventListener(THEME_EVT, handler)
    return () => window.removeEventListener(THEME_EVT, handler)
  }, [])

  return [theme, setTheme]
}