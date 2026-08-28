/* oxlint-disable react/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GENRE_META, metaByTag } from '../../data/genres'
import { tagTopAlbums, LastFmError } from '../../services/lastfm'
import type { CatalogItem } from '../../types'
import MusicCard from '../../components/catalog/MusicCard'
import { SkeletonCards } from '../../components/skeleton/Skeleton'
import './GenrePage.css'

type Status = 'loading' | 'done' | 'error'

export default function GenrePage() {
  const { name } = useParams()
  const meta = metaByTag(name ?? '')
  const tag = meta?.tag

  const [items, setItems] = useState<CatalogItem[]>([])
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!tag) return
    let cancelled = false
    setStatus('loading')
    setError('')
    setPage(1)
    setItems([])

    tagTopAlbums(tag)
      .then((result) => {
        if (!cancelled) {
          setItems(result)
          setStatus('done')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof LastFmError
              ? e.message
              : 'Tidak bisa menghubungi Last.fm. Coba lagi.',
          )
          setItems([])
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [tag, attempt])

  function loadMore() {
    if (!tag || loadingMore) return
    setLoadingMore(true)
    tagTopAlbums(tag, 24, page + 1)
      .then((list) => {
        setItems((prev) => {
          const seen = new Set(prev.map((a) => a.id))
          return [...prev, ...list.filter((a) => !seen.has(a.id))]
        })
        setPage((p) => p + 1)
      })
      .catch(() => {
        // biarkan tombol tetap bisa dicoba lagi
      })
      .finally(() => setLoadingMore(false))
  }

  if (!tag) {
    return (
      <div className="container page-block">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Genre tidak ditemukan.</h1>
        <p className="page-sub">
          Genre yang kamu cari tidak ada di katalog. Coba cek daftar genre.
        </p>
        <Link to="/genre" className="back-link">
          Lihat semua genre
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container page-block">
        <p className="eyebrow">katalog · genre</p>
        <h1 className="page-title">{meta.label}</h1>
        <p className="page-sub">
          Album ber-tag "{tag}" di Last.fm.
        </p>
      </div>

      <section className="container section">
        <div className="genre-chips" role="list" aria-label="Pilih genre">
          {GENRE_META.map((g) => (
            <Link
              key={g.label}
              to={`/genre/${encodeURIComponent(g.tag)}`}
              role="listitem"
              className={`chip${g.label === meta.label ? ' is-on' : ''}`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        {status === 'loading' && <SkeletonCards count={24} />}

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

        {status === 'done' && (
          <>
            <div className="grid">
              {items.map((m) => (
                <MusicCard key={m.id} item={m} />
              ))}
            </div>
            <button
              type="button"
              className="load-more"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Memuat…' : 'Muat lagi'}
            </button>
          </>
        )}
      </section>
    </div>
  )
}