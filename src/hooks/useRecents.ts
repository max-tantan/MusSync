import { useEffect, useState } from 'react'
import { loadRecents, RECENT_EVT } from '../utils/recent'
import type { RecentEntry } from '../utils/recent'

export function useRecents(): RecentEntry[] {
  const [list, setList] = useState<RecentEntry[]>(loadRecents)

  useEffect(() => {
    const handler = () => setList(loadRecents())
    window.addEventListener(RECENT_EVT, handler)
    return () => window.removeEventListener(RECENT_EVT, handler)
  }, [])

  return list
}