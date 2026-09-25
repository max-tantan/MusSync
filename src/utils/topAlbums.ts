import type { AlbumSnapshot } from '../types'

export const TOP_ALBUMS_KEY = 'mussync.top-albums.v1'
export const TOP_ALBUMS_MAX = 3

export type TopAlbumSlots = Array<AlbumSnapshot | null>

function parseAlbum(value: unknown): AlbumSnapshot | null {
  if (!value || typeof value !== 'object') return null

  const album = value as Partial<AlbumSnapshot>
  if (
    typeof album.id !== 'string' ||
    typeof album.title !== 'string' ||
    typeof album.artist !== 'string'
  ) {
    return null
  }

  const clean: AlbumSnapshot = {
    id: album.id,
    title: album.title,
    artist: album.artist,
    image: typeof album.image === 'string' ? album.image : null,
  }

  if (typeof album.mbid === 'string') clean.mbid = album.mbid
  if (typeof album.url === 'string') clean.url = album.url

  return clean
}

export function loadTopAlbums(): TopAlbumSlots {
  const empty: TopAlbumSlots = Array.from({ length: TOP_ALBUMS_MAX }, () => null)

  try {
    const raw = localStorage.getItem(TOP_ALBUMS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return empty

    return empty.map((_, index) => parseAlbum(parsed[index]))
  } catch {
    return empty
  }
}

export function saveTopAlbums(slots: TopAlbumSlots) {
  try {
    localStorage.setItem(TOP_ALBUMS_KEY, JSON.stringify(slots.slice(0, TOP_ALBUMS_MAX)))
  } catch {
    return
  }
}
