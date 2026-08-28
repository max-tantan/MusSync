/* oxlint-disable react/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  albumGetInfo,
  artistTopAlbums,
  isMbidCandidate,
  LastFmError,
} from '../lib/lastfm'
import { useReviews } from '../context/ReviewsContext'
import { useLibrary } from '../context/LibraryContext'
import { pushRecent } from '../lib/recent'
import { averageRating } from '../lib/score'
import type {
  AlbumDetail,
  AlbumSnapshot,
  CatalogItem,
  ReviewSub as SubRating,
} from '../types'
import NeonScore from '../components/NeonScore'
import CoverArt from '../components/CoverArt'
import RatingStars from '../components/RatingStars'
import RatingBreakdown from '../components/RatingBreakdown'
import ReviewForm from '../components/ReviewForm'
import MusicCard from '../components/MusicCard'
import { SkeletonDetail, SkeletonScoring } from '../components/Skeleton'
import './MusicPage.css'

type Status = 'loading' | 'done' | 'error'

function formatNumber(n?: number): string | null {
  if (n == null) return null
  return n.toLocaleString('id-ID')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function toSnapshot(album: AlbumDetail): AlbumSnapshot {
  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    image: album.image,
    mbid: album.mbid,
    url: album.url,
    tags: album.tags.length > 0 ? album.tags : undefined,
    listeners: album.listeners,
    playcount: album.playcount,
  }
}

export default function MusicPage() {
  const { id } = useParams()
  const { reviewsFor, myReview, removeReview } = useReviews()
  const { isWanted, toggleWant, markRated } = useLibrary()

  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const [others, setOthers] = useState<CatalogItem[]>([])
  const [othersStatus, setOthersStatus] = useState<Status>('loading')

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setStatus('loading')
    setError('')
    setAlbum(null)

    const ref = isMbidCandidate(id)
      ? { mbid: id }
      : { artist: id.split('::')[0] ?? '', album: id.split('::')[1] ?? '' }

    albumGetInfo(ref)
      .then((result) => {
        if (!cancelled) {
          setAlbum(result)
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
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, attempt])

  useEffect(() => {
    if (!album) return
    let cancelled = false
    setOthersStatus('loading')

    artistTopAlbums(album.artist, 10)
      .then((list) => {
        if (!cancelled) {
          const rest = list.filter(
            (a) => (a.mbid ? a.mbid !== album.mbid : a.id !== album.id),
          )
          setOthers(rest)
          setOthersStatus('done')
        }
      })
      .catch(() => {
        if (!cancelled) setOthersStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [album])

  useEffect(() => {
    if (album) {
      pushRecent({
        id: album.id,
        title: album.title,
        artist: album.artist,
        image: album.image,
      })
    }
  }, [album])

  const snapshot = useMemo(() => (album ? toSnapshot(album) : null), [album])

  const reviews = useMemo(
    () => (album ? reviewsFor(album.id) : []),
    [album, reviewsFor],
  )
  const mine = useMemo(
    () => (album ? myReview(album.id) : null),
    [album, myReview],
  )

  if (!id) {
    return (
      <div className="container page-notfound">
        <h1>Album tidak ditemukan.</h1>
        <Link to="/" className="back-link">
          ← Kembali ke beranda
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="page">
        <div className="container">
          <SkeletonDetail />
          <SkeletonScoring />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="container state state--error">
        <p>{error}</p>
        <button
          type="button"
          className="state__retry"
          onClick={() => setAttempt((a) => a + 1)}
        >
          Coba lagi
        </button>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="container page-notfound">
        <h1>Album tidak ditemukan.</h1>
        <p className="page-sub">Mungkin judul atau artisnya keliru.</p>
        <Link to="/" className="back-link">
          ← Kembali ke beranda
        </Link>
      </div>
    )
  }

  const avg = averageRating(reviews)
  const listeners = formatNumber(album.listeners)
  const plays = formatNumber(album.playcount)
  const wanted = snapshot ? isWanted(snapshot.id) : false
  const othersList = others

  function handleShare() {
    const url = window.location.href
    const fallback = () => {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
      } catch {
        // gagal — abaikan
      }
      ta.remove()
      setTimeout(() => setCopied(false), 2000)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(fallback)
    } else {
      fallback()
    }
  }

  return (
    <div className="page">
      <div className="container detail">
        <CoverArt title={album.title} seed={album.id} image={album.image} size="detail" />

        <div className="detail__info">
          <div className="detail__crumbs">
            <Link to="/">Beranda</Link>
            <span>/</span>
            <Link to={`/artist/${encodeURIComponent(album.artist)}`}>
              {album.artist}
            </Link>
            <span>/</span>
            <span>{album.title}</span>
          </div>

          <h1 className="detail__title">{album.title}</h1>
          <p className="detail__artist">
            oleh{" "}
            <Link to={`/artist/${encodeURIComponent(album.artist)}`} className="detail__artist-link">
              {album.artist}
            </Link>
          </p>

          {album.tags.length > 0 && (
            <div className="detail__tags">
              {album.tags.map((t) => (
                <span key={t} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="detail__metrics">
            {listeners && (
              <span>
                {listeners} <em>pendengar</em>
              </span>
            )}
            {plays && (
              <span>
                {plays} <em>diputar</em>
              </span>
            )}
          </div>

          {album.summary && <p className="detail__summary">{album.summary}</p>}

          {album.tracks.length > 0 && (
            <ol className="detail__tracks">
              {album.tracks.slice(0, 10).map((t) => (
                <li key={`${t.rank}-${t.name}`}>
                  <span className="detail__track-num">{t.rank}</span>
                  <span>{t.name}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="container scoring">
        <div className="scoring__left">
          <NeonScore score={avg} />
          <div className="scoring__row">
            <RatingStars rating={Math.round(avg)} size="md" />
            <span className="detail__count">{reviews.length} ulasan</span>
          </div>
        </div>

        <div className="scoring__right">
          <RatingBreakdown reviews={reviews} />
          <div className="detail__actions">
            {snapshot && (
              <button
                type="button"
                className={`detail__ghost${wanted ? ' is-on' : ''}`}
                onClick={() => toggleWant(snapshot)}
              >
                {wanted ? 'Batal mau dengar' : 'Mau dengar'}
              </button>
            )}
            <button type="button" className="detail__ghost" onClick={handleShare}>
              {copied ? 'Tersalin ✓' : 'Salin tautan'}
            </button>
            <a href="#review-form" className="detail__cta">
              Tulis review
            </a>
          </div>
        </div>
      </div>

      <div className="container reviews" id="review-form">
        <section className="reviews__list">
          <h2 className="reviews__heading">
            Ulasan <span className="reviews__count">({reviews.length})</span>
          </h2>

          {editing && mine && (
            <ReviewForm
              musicId={album.id}
              initial={mine}
              onSaved={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          )}

          {reviews.length === 0 && !mine ? (
            <div className="reviews__empty">
              <p>Belum ada ulasan. Jadilah yang pertama kasih skor.</p>
            </div>
          ) : (
            <div className="reviews__items">
              {mine && (
                <article className="review review--mine">
                  <header className="review__head">
                    <span className="review__author">{mine.author} · milikmu</span>
                    <div className="review__tools">
                      <span className="review__date">{formatDate(mine.date)}</span>
                      {mine.medium && (
                        <span className="review__medium">{mine.medium}</span>
                      )}
                      <button type="button" className="review__act" onClick={() => setEditing(true)}>
                        Ubah
                      </button>
                      {confirmDelete ? (
                        <>
                          <button
                            type="button"
                            className="review__act review__act--danger"
                            onClick={() => {
                              removeReview(album.id, mine.id)
                              setConfirmDelete(false)
                            }}
                          >
                            Yakin hapus?
                          </button>
                          <button
                            type="button"
                            className="review__act"
                            onClick={() => setConfirmDelete(false)}
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="review__act review__act--danger"
                          onClick={() => setConfirmDelete(true)}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </header>
                  <RatingStars rating={mine.rating} size="sm" />
                  <ReviewSub sub={mine.sub} />
                  <p className="review__text">{mine.text}</p>
                </article>
              )}

              {reviews
                .filter((r) => r.id !== mine?.id)
                .map((r) => (
                  <article className="review" key={r.id}>
                    <header className="review__head">
                      <span className="review__author">{r.author}</span>
                      <div className="review__tools">
                        <span className="review__date">{formatDate(r.date)}</span>
                        {r.medium && (
                          <span className="review__medium">{r.medium}</span>
                        )}
                      </div>
                    </header>
                    <RatingStars rating={r.rating} size="sm" />
                    <ReviewSub sub={r.sub} />
                    <p className="review__text">{r.text}</p>
                  </article>
                ))}
            </div>
          )}
        </section>

        <aside className="reviews__form">
          <h2 className="reviews__heading">
            {mine && !editing ? 'Rating kamu' : 'Kasih skormu'}
          </h2>
          {mine && !editing ? (
            <div className="form__closed">
              <p className="form__closed-title">
                Kamu sudah merating album ini — {mine.rating}/5.
              </p>
              <button
                type="button"
                className="form__submit"
                onClick={() => setEditing(true)}
              >
                Ubah review
              </button>
            </div>
          ) : (
            <ReviewForm
              musicId={album.id}
              onReviewAdded={() => snapshot && markRated(snapshot)}
            />
          )}
          {album.url && (
            <a
              className="detail__lastfm"
              href={album.url}
              target="_blank"
              rel="noreferrer"
            >
              Lihat di Last.fm →
            </a>
          )}
        </aside>
      </div>

      {othersStatus === 'done' && othersList.length > 0 && (
        <section className="container section more">
          <h2 className="more__heading">Album lain dari {album.artist}</h2>
          <div className="grid">
            {othersList.slice(0, 10).map((m) => (
              <MusicCard key={m.id} item={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ReviewSub({ sub }: { sub?: SubRating }) {
  if (!sub || (sub.production === 0 && sub.lyrics === 0 && sub.artwork === 0)) {
    return null
  }
  return (
    <div className="review__sub">
      <span>Produksi <b>{sub.production || '—'}</b></span>
      <span>Lirik <b>{sub.lyrics || '—'}</b></span>
      <span>Artwork <b>{sub.artwork || '—'}</b></span>
    </div>
  )
}