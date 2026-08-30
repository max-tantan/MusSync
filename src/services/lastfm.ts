import type { AlbumDetail, AlbumTrack, ArtistItem, CatalogItem, SimilarAlbumRef } from '../types'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY ?? ''
const CACHE_PREFIX = 'mussync.lf.v1.'
const DEFAULT_TTL = 6 * 60 * 60 * 1000
const DETAIL_TTL = 24 * 60 * 60 * 1000

export class LastFmError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

interface ImageEntry {
  size: string
  '#text': string
}

const IMAGE_PRIORITY = ['mega', 'extralarge', 'large', 'medium', 'small']

const PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f'

function isPlaceholder(url: string): boolean {
  return url.includes(PLACEHOLDER_HASH) || url.includes('/i/u/34s/')
}

function pickImage(images: ImageEntry[] | undefined): string | null {
  if (!images) return null
  for (const size of IMAGE_PRIORITY) {
    const img = images.find((i) => i.size === size && i['#text'])
    if (img && !isPlaceholder(img['#text'])) return img['#text']
  }
  return null
}

function parseNum(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function albumId(artist: string, title: string, mbid?: string): string {
  return mbid || `${artist}::${title}`
}

export function isMbidCandidate(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

interface LastFmParams {
  [key: string]: string
}

async function request<T>(params: LastFmParams): Promise<T> {
  if (!API_KEY) {
    throw new LastFmError(
      8,
      'API key Last.fm belum diisi. Salin .env.example ke .env.local dan isi VITE_LASTFM_API_KEY.',
    )
  }

  const qs = new URLSearchParams({ format: 'json', api_key: API_KEY, ...params })
  const res = await fetch(`/lastfm/?${qs.toString()}`)

  if (!res.ok) {
    if (res.status === 429) {
      throw new LastFmError(29, 'Last.fm lagi membatasi permintaan. Coba lagi sebentar lagi.')
    }
    throw new LastFmError(res.status, `Last.fm menolak permintaan (${res.status}).`)
  }

  const data = (await res.json()) as { error?: number; message?: string } & T
  if (data.error) {
    const msg =
      data.message ?? (data.error === 29 ? 'Rate limit terlampaui.' : 'Last.fm mengembalikan error.')
    throw new LastFmError(data.error, msg)
  }
  return data as T
}

function cached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cacheKey = CACHE_PREFIX + key
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const { t, v } = JSON.parse(raw) as { t: number; v: T }
      if (Date.now() - t < ttl) return Promise.resolve(v)
    }
  } catch {
    // cache rusak — ambil segar
  }

  return fetcher().then((data) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: data }))
    } catch {
      // penyimpanan penuh — lewati
    }
    return data
  })
}

interface RawAlbumMatch {
  name: string
  artist: string | { name: string }
  mbid?: string
  image?: ImageEntry[]
  listeners?: string
  playcount?: string
  url?: string
}

interface RawAlbumInfo {
  album: {
    name: string
    artist: string
    mbid?: string
    url?: string
    image?: ImageEntry[]
    listeners?: string
    playcount?: string
    tags?: { tag?: Array<{ name: string }> }
    wiki?: { summary?: string; content?: string }
    tracks?: { track?: Array<{ name: string; rank?: string | number }> }
  }
}

function toCatalogItem(raw: RawAlbumMatch): CatalogItem {
  const artist =
    typeof raw.artist === 'string' ? raw.artist : (raw.artist?.name ?? '?')
  return {
    id: albumId(artist, raw.name ?? '', raw.mbid),
    title: raw.name ?? '(tanpa judul)',
    artist,
    image: pickImage(raw.image),
    mbid: raw.mbid || undefined,
    listeners: parseNum(raw.listeners),
    playcount: parseNum(raw.playcount),
    url: raw.url,
  }
}

const TAGS_IGNORED = new Set([
  'albums i own',
  'my top albums',
  'favorite albums',
  'seen live',
])

const HOME_TAGS = [
  'electronic',
  'jazz',
  'metal',
  'hip hop',
  'classical',
  'indie',
  'r&b',
  'rock',
]

export interface HomeOptions {
  limit?: number
  skipCache?: boolean
}

export function homeAlbums(opts: HomeOptions = {}): Promise<CatalogItem[]> {
  const { limit = 24, skipCache = false } = opts
  const perTag = Math.max(4, Math.ceil((limit + 8) / HOME_TAGS.length))

  const fetchIt = async () => {
    const pages = await Promise.all(HOME_TAGS.map((t) => tagTopAlbums(t, perTag)))
    const seen = new Set<string>()
    const out: CatalogItem[] = []
    const max = Math.max(...pages.map((p) => p.length))

    for (let i = 0; i < max && out.length < limit; i++) {
      for (const page of pages) {
        const item = page[i]
        if (!item) continue
        const key = item.mbid ?? item.id
        if (seen.has(key)) continue
        seen.add(key)
        out.push(item)
        if (out.length >= limit) return out
      }
    }
    return out
  }

  if (skipCache) return fetchIt()
  return cached(`home-${limit}`, DEFAULT_TTL, fetchIt)
}

export function albumSearch(
  query: string,
  limit = 24,
  page = 1,
): Promise<CatalogItem[]> {
  const fetchIt = () =>
    request<{ results: { albummatches: { album: RawAlbumMatch[] } } }>({
      method: 'album.search',
      album: query,
      limit: String(limit),
      page: String(page),
    }).then((d) => (d.results?.albummatches?.album ?? []).map(toCatalogItem))

  return cached(`search-${query}-${limit}-${page}`, 30 * 60 * 1000, fetchIt)
}

export function tagTopAlbums(
  tag: string,
  limit = 24,
  page = 1,
): Promise<CatalogItem[]> {
  const fetchIt = () =>
    request<{ albums: { album: RawAlbumMatch[] } }>({
      method: 'tag.gettopalbums',
      tag,
      limit: String(limit),
      page: String(page),
    }).then((d) => (d.albums?.album ?? []).map(toCatalogItem))

  return cached(`tag-${tag}-${limit}-${page}`, DEFAULT_TTL, fetchIt)
}

function toTrack(
  raw: { name: string; rank?: string | number },
  index: number,
): AlbumTrack {
  return {
    rank: Number(raw.rank) || index + 1,
    name: raw.name,
  }
}

function stripWiki(text: string): string {
  return text.replace(/<a href=.*?<\/a>/g, '').trim()
}

export function artistTopAlbums(
  name: string,
  limit = 24,
  page = 1,
): Promise<CatalogItem[]> {
  const fetchIt = () =>
    request<{ topalbums: { album: RawAlbumMatch[] } }>({
      method: 'artist.gettopalbums',
      artist: name,
      limit: String(limit),
      page: String(page),
    }).then((d) => (d.topalbums?.album ?? []).map(toCatalogItem))

  return cached(`artalb-${name}-${limit}-${page}`, DEFAULT_TTL, fetchIt)
}

export interface ArtistInfo {
  name: string
  image: string | null
  mbid?: string
  url?: string
  listeners?: number
  playcount?: number
  tags: string[]
  bio: string
}

interface RawArtistInfo {
  artist: {
    name: string
    mbid?: string
    url?: string
    image?: ImageEntry[]
    listeners?: string
    playcount?: string
    tags?: { tag?: Array<{ name: string }> }
    bio?: { summary?: string; content?: string }
  }
}

export function artistInfo(name: string): Promise<ArtistInfo> {
  const fetchIt = () =>
    request<RawArtistInfo>({ method: 'artist.getinfo', artist: name }).then(
      (d) => {
        const a = d.artist
        const tags = (a.tags?.tag ?? [])
          .map((t) => t.name)
          .filter((n) => n && !TAGS_IGNORED.has(n.toLowerCase()))
          .slice(0, 8)
        return {
          name: a.name ?? name,
          image: pickImage(a.image),
          mbid: a.mbid || undefined,
          url: a.url,
          listeners: parseNum(a.listeners),
          playcount: parseNum(a.playcount),
          tags,
          bio: stripWiki(a.bio?.summary ?? ''),
        }
      },
    )

  return cached(`artist-${name}-info`, DETAIL_TTL, fetchIt)
}

interface RawArtistMatch {
  name: string
  mbid?: string
  image?: ImageEntry[]
  listeners?: string
  url?: string
}

function toArtistItem(raw: RawArtistMatch): ArtistItem {
  return {
    name: raw.name ?? '',
    image: pickImage(raw.image),
    mbid: raw.mbid || undefined,
    listeners: parseNum(raw.listeners),
    url: raw.url,
  }
}

export function artistSearch(
  query: string,
  limit = 12,
): Promise<ArtistItem[]> {
  const fetchIt = () =>
    request<{ results: { artistmatches: { artist: RawArtistMatch[] } } }>({
      method: 'artist.search',
      artist: query,
      limit: String(limit),
    }).then((d) => (d.results?.artistmatches?.artist ?? []).map(toArtistItem))

  return cached(`artist-search-${query}-${limit}`, 30 * 60 * 1000, fetchIt)
}

export function topArtists(limit = 12): Promise<ArtistItem[]> {
  const fetchIt = () =>
    request<{ artists: { artist: RawArtistMatch[] } }>({
      method: 'chart.gettopartists',
      limit: String(limit),
    }).then((d) => (d.artists?.artist ?? []).map(toArtistItem))

  return cached(`top-artists-${limit}`, DEFAULT_TTL, fetchIt)
}

interface RawSimilarAlbums {
  similaralbums: {
    album?: Array<{
      name: string
      artist: string | { name: string }
      mbid?: string
      image?: ImageEntry[]
      url?: string
    }>
  }
}

export function similarAlbums(
  ref: SimilarAlbumRef,
  limit = 12,
): Promise<CatalogItem[]> {
  const params: LastFmParams = { method: 'album.getsimilar', limit: String(limit) }
  if ('mbid' in ref) params.mbid = ref.mbid
  else {
    params.artist = ref.artist
    params.album = ref.album
  }

  const fetchIt = () =>
    request<RawSimilarAlbums>(params).then((d) =>
      (d.similaralbums?.album ?? []).map((raw) => {
        const artist =
          typeof raw.artist === 'string' ? raw.artist : (raw.artist?.name ?? '?')
        return {
          id: albumId(artist, raw.name ?? '', raw.mbid),
          title: raw.name ?? '(tanpa judul)',
          artist,
          image: pickImage(raw.image),
          mbid: raw.mbid || undefined,
          url: raw.url,
        }
      }),
    )

  const cacheKey = 'mbid' in ref ? `sim-${ref.mbid}` : `sim-${ref.artist}-${ref.album}`
  return cached(cacheKey, DETAIL_TTL, fetchIt)
}

interface RawSimilarArtists {
  similarartists: {
    artist?: RawArtistMatch[]
  }
}

export function similarArtists(name: string, limit = 6): Promise<ArtistItem[]> {
  const fetchIt = () =>
    request<RawSimilarArtists>({
      method: 'artist.getsimilar',
      artist: name,
      limit: String(limit),
    }).then((d) => (d.similarartists?.artist ?? []).map(toArtistItem))

  return cached(`sim-artist-${name}-${limit}`, DEFAULT_TTL, fetchIt)
}

export async function randomAlbum(): Promise<CatalogItem> {
  let last: CatalogItem | undefined
  for (let i = 0; i < 5; i++) {
    const tag = HOME_TAGS[Math.floor(Math.random() * HOME_TAGS.length)]
    const page = 1 + Math.floor(Math.random() * 200)
    const [first] = await tagTopAlbums(tag, 24, page)
    if (first) last = first
    if (last && i >= 2) break
  }
  if (!last) {
    throw new LastFmError(404, 'Tidak ada album yang bisa dipilih. Coba lagi.')
  }
  return last
}

export async function albumGetInfo(
  ref: { mbid: string } | { artist: string; album: string },
): Promise<AlbumDetail> {
  const params: LastFmParams = { method: 'album.getinfo' }
  if ('mbid' in ref) params.mbid = ref.mbid
  else {
    params.artist = ref.artist
    params.album = ref.album
    params.autocorrect = '1'
  }

  const fetchIt = () =>
    request<RawAlbumInfo>(params).then((d) => {
      const a = d.album
      const artist = a.artist ?? '?'
      const tags = (a.tags?.tag ?? [])
        .map((t) => t.name)
        .filter((n) => n && !TAGS_IGNORED.has(n.toLowerCase()))
        .slice(0, 6)
      const rawTracks = a.tracks?.track
      const trackList = Array.isArray(rawTracks)
        ? rawTracks
        : rawTracks
          ? [rawTracks]
          : []
      const tracks = trackList.map((t, i) => toTrack(t, i))
      return {
        id: albumId(artist, a.name ?? '', a.mbid),
        title: a.name ?? '(tanpa judul)',
        artist,
        image: pickImage(a.image),
        mbid: a.mbid || undefined,
        listeners: parseNum(a.listeners),
        playcount: parseNum(a.playcount),
        url: a.url,
        tags,
        summary: stripWiki(a.wiki?.summary ?? ''),
        tracks,
      }
    })

  const cacheKey = 'mbid' in ref ? `info-${ref.mbid}` : `info-${ref.artist}-${ref.album}`
  return cached(cacheKey, DETAIL_TTL, fetchIt)
}