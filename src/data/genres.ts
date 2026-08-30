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
  { label: 'Country', tag: 'country' },
  { label: 'Blues', tag: 'blues' },
  { label: 'Folk', tag: 'folk' },
  { label: 'Punk', tag: 'punk' },
  { label: 'Reggae', tag: 'reggae' },
  { label: 'Soul', tag: 'soul' },
  { label: 'Funk', tag: 'funk' },
  { label: 'Disco', tag: 'disco' },
  { label: 'House', tag: 'house' },
  { label: 'Techno', tag: 'techno' },
  { label: 'Trance', tag: 'trance' },
  { label: 'Dubstep', tag: 'dubstep' },
  { label: 'Gospel', tag: 'gospel' },
  { label: 'Latin', tag: 'latin' },
  { label: 'Ska', tag: 'ska' },
  { label: 'Grunge', tag: 'grunge' },
  { label: 'Progressive', tag: 'progressive rock' },
  { label: 'Shoegaze', tag: 'shoegaze' },
  { label: 'Synthwave', tag: 'synthwave' },
  { label: 'Soundtrack', tag: 'soundtrack' },
]

export function metaForGenre(genre: Genre): GenreMeta | undefined {
  return GENRE_META.find((g) => g.label === genre)
}

export function metaByTag(tag: string): GenreMeta | undefined {
  return GENRE_META.find((g) => g.tag.toLowerCase() === tag.toLowerCase())
}