/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AlbumSnapshot, Library, LibraryEntry } from '../types'

const STORAGE_KEY = 'mussync.library.v1'

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

interface LibraryContextValue {
  library: Library
  ratedCount: number
  wantCount: number
  isRated: (id: string) => boolean
  isWanted: (id: string) => boolean
  markRated: (item: AlbumSnapshot) => void
  toggleWant: (item: AlbumSnapshot) => void
  remove: (id: string) => void
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

  const remove = useCallback((id: string) => {
    setLibrary((prev) => {
      const next = { ...prev }
      delete next[id]
      persistLibrary(next)
      return next
    })
  }, [])

  const exportJSON = useCallback(() => {
    return JSON.stringify(
      { app: 'mussync', version: 1, exportedAt: new Date().toISOString(), library },
      null,
      2,
    )
  }, [library])

  const importJSON = useCallback((text: string) => {
    try {
      const parsed = JSON.parse(text) as {
        library?: unknown
        version?: unknown
      }
      const raw = parsed?.library ?? (parsed as { [k: string]: unknown })
      if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Isi file tidak dikenali sebagai data MusSync.' }
      }
      const next: Library = {}
      for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
        const e = entry as Partial<LibraryEntry> | undefined
        const item = e?.item as Partial<AlbumSnapshot> | undefined
        if (
          !item ||
          typeof item.id !== 'string' ||
          typeof item.title !== 'string' ||
          typeof item.artist !== 'string' ||
          (e?.status !== 'rated' && e?.status !== 'want')
        ) {
          return {
            ok: false,
            message: `Entri "${id}" rusak. Impor dibatalkan.`,
          }
        }
        next[String(id)] = {
          item: {
            id: item.id,
            title: item.title,
            artist: item.artist,
            image: typeof item.image === 'string' ? item.image : null,
            mbid: item.mbid,
            url: item.url,
            tags: Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string') : undefined,
            listeners: typeof item.listeners === 'number' ? item.listeners : undefined,
            playcount: typeof item.playcount === 'number' ? item.playcount : undefined,
          },
          status: e.status,
          createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date().toISOString().slice(0, 10),
        }
      }
      setLibrary(next)
      persistLibrary(next)
      return { ok: true, message: `${Object.keys(next).length} entri diimpor.` }
    } catch {
      return { ok: false, message: 'File JSON tidak valid.' }
    }
  }, [])

  const entries = Object.values(library)
  const ratedCount = entries.filter((e) => e.status === 'rated').length
  const wantCount = entries.filter((e) => e.status === 'want').length

  const isRated = useCallback((id: string) => library[id]?.status === 'rated', [library])
  const isWanted = useCallback((id: string) => library[id]?.status === 'want', [library])

  return (
    <LibraryContext.Provider
      value={{
        library,
        ratedCount,
        wantCount,
        isRated,
        isWanted,
        markRated,
        toggleWant,
        remove,
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