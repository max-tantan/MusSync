import { useCallback, useState } from 'react'
import type { AlbumSnapshot } from '../types'
import {
  loadTopAlbums,
  saveTopAlbums,
  TOP_ALBUMS_MAX,
  type TopAlbumSlots,
} from '../utils/topAlbums'

export function useTopAlbums() {
  const [slots, setSlots] = useState<TopAlbumSlots>(loadTopAlbums)

  const setSlot = useCallback((index: number, album: AlbumSnapshot) => {
    if (index < 0 || index >= TOP_ALBUMS_MAX) return

    setSlots((current) => {
      if (current.some((item, slotIndex) => slotIndex !== index && item?.id === album.id)) {
        return current
      }

      const next = [...current]
      next[index] = album
      saveTopAlbums(next)
      return next
    })
  }, [])

  const removeSlot = useCallback((index: number) => {
    if (index < 0 || index >= TOP_ALBUMS_MAX) return

    setSlots((current) => {
      const next = [...current]
      next[index] = null
      saveTopAlbums(next)
      return next
    })
  }, [])

  return { slots, setSlot, removeSlot }
}
