/* oxlint-disable react/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  homeAlbums,
  albumSearch,
  tagTopAlbums,
  artistSearch,
  topArtists,
  similarAlbums,
  LastFmError,
} from '../../services/lastfm'
import { useReviews } from '../../contexts/ReviewsContext'
import { useLibrary } from '../../contexts/LibraryContext'
import { useRecents } from '../../hooks/useRecents'
import type { ArtistItem, CatalogItem } from '../../types'
import { GENRES } from '../../types'
import Hero from '../../components/hero/Hero'
import FilterBar from '../../components/catalog/FilterBar'
import type { SortKey } from '../../components/catalog/FilterBar'
import CoverArt from '../../components/catalog/CoverArt'
import MusicCard from '../../components/catalog/MusicCard'
import ArtistRow from '../../components/home/ArtistRow'
import EditorialRow from '../../components/home/EditorialRow'
import { SkeletonCards } from '../../components/skeleton/Skeleton'
import './HomePage.css'

type Status = 'loading' | 'done' | 'error'

const ROW_SIZE = 12

function byListenersDesc(list: CatalogItem[]) {
  return [...list].sort((a, b) => (b.listeners ?? 0) - (a.listeners ?? 0))
}

function byListenersAsc(list: CatalogItem[]) {
  return [...list].sort((a, b) => (a.listeners ?? 0) - (b.listeners ?? 0))
}

function firstN(list: CatalogItem[], n: number) {
  return list.slice(0, n)
}

export default function HomePage() {
  const { reviewCount } = useReviews()
  const recents = useRecents()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('default')
  const [attempt, setAttempt] = useState(0)

  const [trending, setTrending] = useState<CatalogItem[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [timeless, setTimeless] = useState<CatalogItem[]>([])
  const [timelessLoading, setTimelessLoading] = useState(true)
  const [indonesia, setIndonesia] = useState<CatalogItem[]>([])
  const [indonesiaLoading, setIndonesiaLoading] = useState(true)
  const [global, setGlobal] = useState<CatalogItem[]>([])
  const [globalLoading, setGlobalLoading] = useState(true)
  const [underrated, setUnderrated] = useState<CatalogItem[]>([])
  const [underratedLoading, setUnderratedLoading] = useState(true)

  const [topArtistsList, setTopArtistsList] = useState<ArtistItem[]>([])
  const [topArtistsLoading, setTopArtistsLoading] = useState(true)
  const [artistResults, setArtistResults] = useState<ArtistItem[]>([])
  const [artistResultsStatus, setArtistResultsStatus] = useState(false)
  const [recs, setRecs] = useState<CatalogItem[]>([])
  const [recsLoading, setRecsLoading] = useState(false)

  const { library } = useLibrary()

  useEffect(() => {
    const root = document.documentElement
    root.dataset.scrollbar = 'minimal-neon'
    return () => {
      delete root.dataset.scrollbar
    }
  }, [])

  useEffect(() => {
    let alive = true
    homeAlbums()
      .then((list) => {
        if (alive) {
          setTrending(firstN(byListenersDesc(list), ROW_SIZE))
          setTrendingLoading(false)
        }
      })
      .catch(() => alive && setTrendingLoading(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    tagTopAlbums('classic rock', ROW_SIZE)
      .then((list) => {
        if (alive) {
          setTimeless(firstN(list, ROW_SIZE))
          setTimelessLoading(false)
        }
      })
      .catch(() => alive && setTimelessLoading(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    tagTopAlbums('indonesian', ROW_SIZE)
      .then((list) => {
        if (alive) {
          setIndonesia(firstN(list, ROW_SIZE))
          setIndonesiaLoading(false)
        }
      })
      .catch(() => alive && setIndonesiaLoading(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    tagTopAlbums('pop', ROW_SIZE)
      .then((list) => {
        if (alive) {
          setGlobal(firstN(list, ROW_SIZE))
          setGlobalLoading(false)
        }
      })
      .catch(() => alive && setGlobalLoading(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    tagTopAlbums('rock', 60)
      .then((list) => {
        if (alive) {
          setUnderrated(firstN(byListenersAsc(list), ROW_SIZE))
          setUnderratedLoading(false)
        }
      })
      .catch(() => alive && setUnderratedLoading(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    topArtists(12)
      .then((list) => {
        if (alive) {
          setTopArtistsList(list)
          setTopArtistsLoading(false)
        }
      })
      .catch(() => alive && setTopArtistsLoading(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setArtistResults([])
      setArtistResultsStatus(false)
      return
    }
    let alive = true
    setArtistResultsStatus(false)
    const t = setTimeout(() => {
      artistSearch(q, 8)
        .then((list) => {
          if (alive) {
            setArtistResults(list)
            setArtistResultsStatus(true)
          }
        })
        .catch(() => alive && setArtistResultsStatus(true))
    }, 400)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [query])

  useEffect(() => {
    const entries = Object.values(library)
    const rated = entries
      .filter((e) => e.status === 'rated')
      .map((e) => e.item)
    if (rated.length === 0) {
      setRecs([])
      setRecsLoading(false)
      return
    }
    let alive = true
    setRecsLoading(true)
    const artists = [...new Set(rated.slice(0, 3).map((a) => a.artist))]
    const sourceByArtist = new Map<string, string>()
    for (const r of rated) {
      if (!sourceByArtist.has(r.artist)) sourceByArtist.set(r.artist, r.title)
    }
    Promise.allSettled(
      artists.map((a) =>
        similarAlbums({ artist: a, album: sourceByArtist.get(a) ?? '' }, 8),
      ),
    ).then((results) => {
      if (!alive) return
      const seen = new Set(rated.map((r) => r.id))
      const out: CatalogItem[] = []
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        for (const item of result.value) {
          if (seen.has(item.id)) continue
          const key = item.mbid ?? item.id
          if (out.some((o) => (o.mbid ?? o.id) === key)) continue
          seen.add(item.id)
          out.push(item)
          if (out.length >= ROW_SIZE) break
        }
        if (out.length >= ROW_SIZE) break
      }
      setRecs(out)
      setRecsLoading(false)
    })
    return () => {
      alive = false
    }
  }, [library])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError('')

    const t = setTimeout(async () => {
      const q = query.trim()
      try {
        const result = q ? await albumSearch(q) : await homeAlbums()
        if (!cancelled) {
          setItems(result)
          setStatus('done')
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof LastFmError
              ? e.message
              : 'Tidak bisa menghubungi Last.fm. Coba lagi.',
          )
          setItems([])
          setStatus('error')
        }
      }
    }, query.trim() ? 400 : 0)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, attempt])

  const sorted = useMemo(() => {
    switch (sort) {
      case 'az':
        return [...items].sort((a, b) => a.title.localeCompare(b.title))
      case 'listeners':
        return [...items].sort((a, b) => (b.listeners ?? 0) - (a.listeners ?? 0))
      default:
        return items
    }
  }, [items, sort])

  return (
    <div className="page">
      <div className="container">
        <Hero albums={items.length} reviews={reviewCount} genres={GENRES.length} />
      </div>

      {status === 'done' && !query.trim() && recents.length > 0 && (
        <section className="container section section--recent">
          <h2 className="recent__heading">Terakhir dilihat</h2>
          <div className="recent__list">
            {recents.map((r) => (
              <Link
                key={r.id}
                to={`/music/${encodeURIComponent(r.id)}`}
                className="recent__item"
              >
                <CoverArt title={r.title} seed={r.id} image={r.image} size="card" />
                <span className="recent__title">{r.title}</span>
                <span className="recent__artist">{r.artist}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!query.trim() && (
        <>
          <ArtistRow
            title="Artis paling didengar"
            artists={topArtistsList}
            loading={topArtistsLoading}
          />
          {recs.length > 0 && (
            <EditorialRow
              title="Rekomendasi untukmu"
              items={recs}
              loading={recsLoading}
            />
          )}
          <EditorialRow
            title="Paling banyak didengar"
            items={trending}
            loading={trendingLoading}
          />
          <EditorialRow
            title="Abadi sepanjang masa"
            items={timeless}
            loading={timelessLoading}
          />
          <EditorialRow
            title="Musik Indonesia"
            items={indonesia}
            loading={indonesiaLoading}
          />
          <EditorialRow
            title="Hits mancanegara"
            items={global}
            loading={globalLoading}
          />
          <EditorialRow
            title="Underrated — biarkan kupingmu menjelajah"
            items={underrated}
            loading={underratedLoading}
          />
        </>
      )}

      <section className="container section">
        <FilterBar query={query} onQuery={setQuery} sort={sort} onSort={setSort} />

        {query.trim() && artistResultsStatus && artistResults.length > 0 && (
          <div className="artist-hit">
            <h2 className="artist-hit__heading">Artis</h2>
            <div className="artist-hit__list">
              {artistResults.map((a) => (
                <Link
                  key={a.name}
                  to={`/artist/${encodeURIComponent(a.name)}`}
                  className="artist-hit__item"
                >
                  <span className="artist-hit__avatar">
                    {a.image ? (
                      <img src={a.image} alt="" loading="lazy" />
                    ) : (
                      <span className="artist-hit__initial">
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="artist-hit__name">{a.name}</span>
                  {a.listeners != null && (
                    <span className="artist-hit__meta">
                      {a.listeners.toLocaleString('id-ID')} pendengar
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {status === 'loading' && <SkeletonCards count={12} />}

        {status === 'error' && (
          <div className="state state--error">
            <p>{error}</p>
            <button
              type="button"
              className="state__retry"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Coba lagi
            </button>
          </div>
        )}

        {status === 'done' &&
          (sorted.length > 0 ? (
            <div className="grid">
              {sorted.map((m) => (
                <MusicCard key={m.id} item={m} />
              ))}
            </div>
          ) : (
            <div className="grid-empty">
              <h2>Tidak ada hasil untuk "{query}".</h2>
              <p>Coba kata kunci lain.</p>
              <button type="button" className="grid-empty__reset" onClick={() => setQuery('')}>
                Bersihkan pencarian
              </button>
            </div>
          ))}
      </section>
    </div>
  )
}