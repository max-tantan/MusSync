/* oxlint-disable react/set-state-in-effect */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { artistInfo, artistTopAlbums, LastFmError } from '../lib/lastfm'
import type { ArtistInfo } from '../lib/lastfm'
import type { CatalogItem } from '../types'
import MusicCard from '../components/MusicCard'
import { SkeletonCards } from '../components/Skeleton'
import './ArtistPage.css'

type Status = 'loading' | 'done' | 'error'

function formatNumber(n?: number): string | null {
  if (n == null) return null
  return n.toLocaleString('id-ID')
}

export default function ArtistPage() {
  const { name } = useParams()
  const artistName = name ?? ''

  const [info, setInfo] = useState<ArtistInfo | null>(null)
  const [albums, setAlbums] = useState<CatalogItem[]>([])
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!artistName) return
    let cancelled = false
    setStatus('loading')
    setError('')
    setPage(1)
    setAlbums([])

    Promise.all([artistInfo(artistName), artistTopAlbums(artistName)])
      .then(([i, list]) => {
        if (!cancelled) {
          setInfo(i)
          setAlbums(list)
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
          setAlbums([])
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [artistName, attempt])

  function loadMore() {
    if (loadingMore) return
    setLoadingMore(true)
    artistTopAlbums(artistName, 24, page + 1)
      .then((list) => {
        setAlbums((prev) => {
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

  return (
    <div className="page">
      <div className="container page-block">
        <p className="eyebrow">katalog · artis</p>
        <h1 className="page-title">{artistName}</h1>

        {status === 'loading' ? (
          <div className="ske-header" aria-hidden="true">
            <div className="sk sk__hline" />
            <div className="sk sk__hline sk__hline--short" />
          </div>
        ) : (
          <>
            {status === 'done' && (
              <div className="artist__meta">
                {info?.listeners != null && (
                  <span>
                    {formatNumber(info.listeners)} <em>pendengar</em>
                  </span>
                )}
                {info?.playcount != null && (
                  <span>
                    {formatNumber(info.playcount)} <em>diputar</em>
                  </span>
                )}
                {info?.url && (
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noreferrer"
                    className="artist__link"
                  >
                    Profil di Last.fm →
                  </a>
                )}
              </div>
            )}

            {status === 'done' && info?.bio && (
              <p className="artist__bio">{info.bio}</p>
            )}

            {status === 'done' && (info?.tags.length ?? 0) > 0 && (
              <div className="artist__tags">
                {info?.tags.map((t) => (
                  <span key={t} className="tag">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <section className="container section">
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

        {status === 'done' &&
          (albums.length > 0 ? (
            <>
              <div className="grid">
                {albums.map((m) => (
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
          ) : (
            <div className="state">
              <p>Tidak ada album ditemukan untuk {artistName}.</p>
            </div>
          ))}
      </section>
    </div>
  )
}