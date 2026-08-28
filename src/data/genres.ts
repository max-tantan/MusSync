import type { Genre, GenreMeta } from '../types'

export const GENRE_META: GenreMeta[] = [
  { label: 'Pop', tag: 'pop' },
  { label: 'Rock', tag: 'rock' },
  { label: 'Electronic', tag: 'electronic' },
  { label: 'Hip-Hop', tag: 'hip hop' },
  { label: 'R&B', tag: 'r&b' },
  { label: 'Indie', tag: 'indie' },
  { label: 'Ambient', tag: 'ambient' },
  { label: 'Metal', tag: 'metal' },
  { label: 'Jazz', tag: 'jazz' },
  { label: 'Classical', tag: 'classical' },
]

export function metaForGenre(genre: Genre): GenreMeta | undefined {
  return GENRE_META.find((g) => g.label === genre)
}

export function metaByTag(tag: string): GenreMeta | undefined {
  return GENRE_META.find((g) => g.tag.toLowerCase() === tag.toLowerCase())
}