import { useEffect, useState } from 'react'
import { loadLastfmUser, LFM_USER_EVT } from '../utils/lastfmUser'
import type { LastfmUserLink } from '../utils/lastfmUser'

export function useLastfmUser(): LastfmUserLink | null {
  const [link, setLink] = useState<LastfmUserLink | null>(loadLastfmUser)

  useEffect(() => {
    const handler = () => setLink(loadLastfmUser())
    window.addEventListener(LFM_USER_EVT, handler)
    return () => window.removeEventListener(LFM_USER_EVT, handler)
  }, [])

  return link
}
