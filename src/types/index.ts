export const GENRES = [
  'Pop',
  'Rock',
  'Electronic',
  'Hip-Hop',
  'R&B',
  'Indie',
  'Ambient',
  'Metal',
  'Jazz',
  'Classical',
] as const

export type Genre = (typeof GENRES)[number]

export interface ReviewSub {
  production: number
  lyrics: number
  artwork: number
}

export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  sub?: ReviewSub
  medium?: string
}

export interface AlbumSnapshot {
  id: string
  title: string
  artist: string
  image: string | null
  mbid?: string
  url?: string
  tags?: string[]
  listeners?: number
  playcount?: number
}

export type LibraryStatus = 'rated' | 'want' | 'favorite'

export interface LibraryEntry {
  item: AlbumSnapshot
  status: LibraryStatus
  createdAt: string
}

export type Library = Record<string, LibraryEntry>

export interface CatalogItem {
  id: string
  title: string
  artist: string
  image: string | null
  mbid?: string
  listeners?: number
  playcount?: number
  url?: string
}

export interface AlbumTrack {
  rank: number
  name: string
  duration?: number
}

export interface AlbumDetail extends CatalogItem {
  tags: string[]
  summary: string
  tracks: AlbumTrack[]
}

export interface GenreMeta {
  label: Genre
  tag: string
}