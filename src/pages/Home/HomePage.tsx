/* oxlint-disable react/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { homeAlbums, albumSearch, LastFmError } from '../../services/lastfm'
import { useReviews } from '../../contexts/ReviewsContext'
import { useRecents } from '../../hooks/useRecents'
import type { CatalogItem } from '../../types'
import { GENRES } from '../../types'
import Hero from '../../components/hero/Hero'
import FilterBar from '../../components/catalog/FilterBar'
import type { SortKey } from '../../components/catalog/FilterBar'
import CoverArt from '../../components/catalog/CoverArt'
import MusicCard from '../../components/catalog/MusicCard'
import { SkeletonCards } from '../../components/skeleton/Skeleton'
import './HomePage.css'

type Status = 'loading' | 'done' | 'error'

export default function HomePage() {
  const { reviewCount } = useReviews()
  const recents = useRecents()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('default')
  const [attempt, setAttempt] = useState(0)

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

      <section className="container section">
        <FilterBar query={query} onQuery={setQuery} sort={sort} onSort={setSort} />

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