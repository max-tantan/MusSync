/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AlbumSnapshot, Library, LibraryEntry } from '../types'

const STORAGE_KEY = 'mussync.library.v1'
const FAVORITES_KEY = 'mussync.favorites.v1'

function loadLibrary(): Library {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Library) : {}
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function persistLibrary(next: Library) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan penuh / tidak tersedia — lewati
  }
}

function loadFavorites(): Record<string, LibraryEntry> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, LibraryEntry>) : {}
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function persistFavorites(next: Record<string, LibraryEntry>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan penuh / tidak tersedia — lewati
  }
}

interface LibraryContextValue {
  library: Library
  favorites: Record<string, LibraryEntry>
  ratedCount: number
  wantCount: number
  favoriteCount: number
  isRated: (id: string) => boolean
  isWanted: (id: string) => boolean
  isFavorite: (id: string) => boolean
  markRated: (item: AlbumSnapshot) => void
  toggleWant: (item: AlbumSnapshot) => void
  toggleFavorite: (item: AlbumSnapshot) => void
  remove: (id: string) => void
  removeFavorite: (id: string) => void
  exportJSON: () => string
  importJSON: (text: string) => { ok: boolean; message: string }
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function toEntry(item: AlbumSnapshot, status: LibraryEntry['status']): LibraryEntry {
  return {
    item,
    status,
    createdAt: new Date().toISOString().slice(0, 10),
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Library>(loadLibrary)
  const [favorites, setFavorites] = useState<Record<string, LibraryEntry>>(
    loadFavorites,
  )

  const markRated = useCallback((item: AlbumSnapshot) => {
    setLibrary((prev) => {
      const next = { ...prev }
      const existing = next[item.id]
      next[item.id] = existing
        ? { ...existing, item, status: 'rated' as const }
        : toEntry(item, 'rated')
      persistLibrary(next)
      return next
    })
  }, [])

  const toggleWant = useCallback((item: AlbumSnapshot) => {
    setLibrary((prev) => {
      const next = { ...prev }
      const existing = next[item.id]
      if (existing) {
        if (existing.status === 'want') delete next[item.id]
        else next[item.id] = existing
      } else {
        next[item.id] = toEntry(item, 'want')
      }
      persistLibrary(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((item: AlbumSnapshot) => {
    setFavorites((prev) => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = toEntry(item, 'favorite')
      }
      persistFavorites(next)
      return next
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = { ...prev }
      delete next[id]
      persistFavorites(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setLibrary((prev) => {
      const next = { ...prev }
      delete next[id]
      persistLibrary(next)
      return next
    })
    setFavorites((prev) => {
      const next = { ...prev }
      delete next[id]
      persistFavorites(next)
      return next
    })
  }, [])

  const exportJSON = useCallback(() => {
    return JSON.stringify(
      {
        app: 'mussync',
        version: 1,
        exportedAt: new Date().toISOString(),
        library,
        favorites,
      },
      null,
      2,
    )
  }, [library, favorites])

  const importJSON = useCallback((text: string) => {
    try {
      const parsed = JSON.parse(text) as {
        library?: unknown
        favorites?: unknown
        version?: unknown
      }
      const raw = parsed?.library ?? (parsed as { [k: string]: unknown })
      if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Isi file tidak dikenali sebagai data MusSync.' }
      }
      const next: Library = {}
      const nextFav: Record<string, LibraryEntry> = {}
      for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
        const e = entry as Partial<LibraryEntry> | undefined
        const item = e?.item as Partial<AlbumSnapshot> | undefined
        if (
          !item ||
          typeof item.id !== 'string' ||
          typeof item.title !== 'string' ||
          typeof item.artist !== 'string' ||
          (e?.status !== 'rated' && e?.status !== 'want' && e?.status !== 'favorite')
        ) {
          return {
            ok: false,
            message: `Entri "${id}" rusak. Impor dibatalkan.`,
          }
        }
        const cleanItem: AlbumSnapshot = {
          id: item.id,
          title: item.title,
          artist: item.artist,
          image: typeof item.image === 'string' ? item.image : null,
          mbid: item.mbid,
          url: item.url,
          tags: Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string') : undefined,
          listeners: typeof item.listeners === 'number' ? item.listeners : undefined,
          playcount: typeof item.playcount === 'number' ? item.playcount : undefined,
        }
        const createdAt =
          typeof e.createdAt === 'string'
            ? e.createdAt
            : new Date().toISOString().slice(0, 10)
        if (e.status === 'favorite') {
          nextFav[String(id)] = { item: cleanItem, status: 'favorite', createdAt }
        } else {
          next[String(id)] = { item: cleanItem, status: e.status, createdAt }
        }
      }

      const importedFav = parsed?.favorites as
        | Record<string, Partial<LibraryEntry>>
        | undefined
      if (importedFav && typeof importedFav === 'object') {
        for (const [id, entry] of Object.entries(importedFav)) {
          const item = entry?.item as Partial<AlbumSnapshot> | undefined
          if (!item || typeof item.id !== 'string') continue
          nextFav[String(id)] = {
            item: {
              id: item.id,
              title: item.title ?? '',
              artist: item.artist ?? '',
              image: typeof item.image === 'string' ? item.image : null,
              mbid: item.mbid,
              url: item.url,
              tags: Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string') : undefined,
            },
            status: 'favorite',
            createdAt:
              typeof entry?.createdAt === 'string'
                ? entry.createdAt
                : new Date().toISOString().slice(0, 10),
          }
        }
      }

      setLibrary(next)
      persistLibrary(next)
      setFavorites(nextFav)
      persistFavorites(nextFav)
      return {
        ok: true,
        message: `${Object.keys(next).length + Object.keys(nextFav).length} entri diimpor.`,
      }
    } catch {
      return { ok: false, message: 'File JSON tidak valid.' }
    }
  }, [])

  const entries = Object.values(library)
  const ratedCount = entries.filter((e) => e.status === 'rated').length
  const wantCount = entries.filter((e) => e.status === 'want').length
  const favoriteCount = Object.keys(favorites).length

  const isRated = useCallback((id: string) => library[id]?.status === 'rated', [library])
  const isWanted = useCallback((id: string) => library[id]?.status === 'want', [library])
  const isFavorite = useCallback((id: string) => Boolean(favorites[id]), [favorites])

  return (
    <LibraryContext.Provider
      value={{
        library,
        favorites,
        ratedCount,
        wantCount,
        favoriteCount,
        isRated,
        isWanted,
        isFavorite,
        markRated,
        toggleWant,
        toggleFavorite,
        remove,
        removeFavorite,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary harus dipakai di dalam LibraryProvider')
  return ctx
}