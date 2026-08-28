/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { CatalogItem } from '../types'

const ARTIST_KEY = 'mussync.artist-favs.v1'

export interface ArtistFavorite {
  name: string
  image: string | null
}

function loadArtistFavorites(): Record<string, ArtistFavorite> {
  try {
    const raw = localStorage.getItem(ARTIST_KEY)
    const parsed = raw
      ? (JSON.parse(raw) as Record<string, ArtistFavorite>)
      : {}
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function persistArtistFavorites(next: Record<string, ArtistFavorite>) {
  try {
    localStorage.setItem(ARTIST_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan penuh / tidak tersedia — lewati
  }
}

interface ArtistFavoritesContextValue {
  favorites: Record<string, ArtistFavorite>
  favoriteCount: number
  isArtistFavorite: (name: string) => boolean
  toggleArtistFavorite: (item: CatalogItem) => void
  toggleArtistByName: (name: string, image?: string | null) => void
  removeArtist: (name: string) => void
}

const ArtistFavoritesContext =
  createContext<ArtistFavoritesContextValue | null>(null)

export function ArtistFavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Record<string, ArtistFavorite>>(
    loadArtistFavorites,
  )

  const toggle = useCallback((name: string, image: string | null = null) => {
    setFavorites((prev) => {
      const key = name.toLowerCase()
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = { name, image }
      }
      persistArtistFavorites(next)
      return next
    })
  }, [])

  const toggleArtistFavorite = useCallback(
    (item: CatalogItem) => toggle(item.artist, item.image),
    [toggle],
  )

  const toggleArtistByName = useCallback(
    (name: string, image?: string | null) => toggle(name, image ?? null),
    [toggle],
  )

  const removeArtist = useCallback((name: string) => {
    setFavorites((prev) => {
      const next = { ...prev }
      delete next[name.toLowerCase()]
      persistArtistFavorites(next)
      return next
    })
  }, [])

  const isArtistFavorite = useCallback(
    (name: string) => Boolean(favorites[name.toLowerCase()]),
    [favorites],
  )

  const favoriteCount = Object.keys(favorites).length

  return (
    <ArtistFavoritesContext.Provider
      value={{
        favorites,
        favoriteCount,
        isArtistFavorite,
        toggleArtistFavorite,
        toggleArtistByName,
        removeArtist,
      }}
    >
      {children}
    </ArtistFavoritesContext.Provider>
  )
}

export function useArtistFavorites() {
  const ctx = useContext(ArtistFavoritesContext)
  if (!ctx)
    throw new Error('useArtistFavorites harus dipakai di dalam ArtistFavoritesProvider')
  return ctx
}
