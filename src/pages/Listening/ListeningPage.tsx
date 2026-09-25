/* oxlint-disable react/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LastFmError,
  userInfo,
  userRecentTracks,
  userTopAlbums,
  userTopArtists,
  userTopTracks,
} from '../../services/lastfm'
import type { ListenPeriod } from '../../services/lastfm'
import { useLastfmUser } from '../../hooks/useLastfmUser'
import { clearLastfmUser, saveLastfmUser } from '../../utils/lastfmUser'
import type {
  ArtistItem,
  CatalogItem,
  LastfmUser,
  ScrobbleItem,
  TrackItem,
} from '../../types'
import ConnectForm from '../../components/listening/ConnectForm'
import TopTracksList from '../../components/listening/TopTracksList'
import ScrobbleList from '../../components/listening/ScrobbleList'
import TopArtistsList from '../../components/profile/TopArtistsList'
import EditorialRow from '../../components/home/EditorialRow'
import './ListeningPage.css'

type Status = 'loading' | 'done' | 'error'

const PERIODS: { value: ListenPeriod; label: string }[] = [
  { value: '7day', label: '7 hari' },
  { value: '1month', label: '1 bulan' },
  { value: '6month', label: '6 bulan' },
  { value: '1year', label: '1 tahun' },
  { value: 'overall', label: 'Semua' },
]

const SECTION_LABELS: Record<string, string> = {
  artists: 'artis teratas',
  albums: 'album teratas',
  tracks: 'lagu teratas',
  recent: 'scrobble terakhir',
}

function readableError(e: unknown): string {
  if (e instanceof LastFmError) {
    if (e.code === 6 || e.code === 404) {
      return 'Username Last.fm tidak ditemukan. Cek ulang ejaannya.'
    }
    return e.message || 'Last.fm menolak permintaan.'
  }
  return 'Tidak bisa menghubungi Last.fm. Coba lagi.'
}

function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="listen-sec__head">
      <span className="listen-sec__bar" aria-hidden="true" />
      <div className="listen-sec__titles">
        <h2 className="listen__heading">{title}</h2>
        {desc && <p className="listen-sec__desc">{desc}</p>}
      </div>
    </div>
  )
}

function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="listen-skel">
      {Array.from({ length: rows }).map((_, i) => (
        <span
          key={i}
          className="sk listen-skel__row"
          style={{ width: `${100 - i * 6}%` }}
        />
      ))}
    </div>
  )
}

export default function ListeningPage() {
  const link = useLastfmUser()
  const username = link?.username ?? ''

  const [period, setPeriod] = useState<ListenPeriod>('overall')
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [failed, setFailed] = useState<string[]>([])
  const [user, setUser] = useState<LastfmUser | null>(null)
  const [artists, setArtists] = useState<ArtistItem[]>([])
  const [albums, setAlbums] = useState<CatalogItem[]>([])
  const [tracks, setTracks] = useState<TrackItem[]>([])
  const [recent, setRecent] = useState<ScrobbleItem[]>([])

  useEffect(() => {
    if (!username) return
    let cancelled = false
    setStatus('loading')
    setError('')
    setFailed([])
    setUser(null)
    setArtists([])
    setAlbums([])
    setTracks([])
    setRecent([])

    Promise.allSettled([
      userInfo(username),
      userTopArtists(username, 10, period),
      userTopAlbums(username, 20, period),
      userTopTracks(username, 10, period),
      userRecentTracks(username, 24),
    ]).then(([info, topArtists, topAlbums, topTracks, recentTracks]) => {
      if (cancelled) return

      const missing: string[] = []
      if (info.status === 'fulfilled') setUser(info.value)
      if (topArtists.status === 'fulfilled') setArtists(topArtists.value)
      else missing.push('artists')
      if (topAlbums.status === 'fulfilled') setAlbums(topAlbums.value)
      else missing.push('albums')
      if (topTracks.status === 'fulfilled') setTracks(topTracks.value)
      else missing.push('tracks')
      if (recentTracks.status === 'fulfilled') setRecent(recentTracks.value)
      else missing.push('recent')
      setFailed(missing)

      if (info.status === 'rejected') {
        setError(readableError(info.reason))
        setStatus('error')
        return
      }
      setStatus('done')
    })

    return () => {
      cancelled = true
    }
  }, [username, period, attempt])

  const topArtists = useMemo(
    () => artists.map((a) => ({ name: a.name, count: a.playcount ?? 0 })),
    [artists],
  )

  function handleConnect(name: string) {
    saveLastfmUser(name)
    setAttempt((a) => a + 1)
  }

  if (!username) {
    return (
      <div className="page">
        <div className="container page-block">
          <p className="eyebrow">riwayat dengar</p>
          <h1 className="page-title">Dengarkan ulang riwayatmu.</h1>
          <p className="page-sub">
            Hubungkan username Last.fm untuk melihat artis, album, lagu, dan scrobble
            terakhirmu.
          </p>
        </div>
        <section className="container section">
          <ConnectForm onConnect={handleConnect} />
        </section>
      </div>
    )
  }

  const loading = status === 'loading'
  const displayName = user?.realname ?? user?.username ?? username
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? 'Semua'

  return (
    <div className="page">
      <div className="container page-block">
        <p className="eyebrow">riwayat dengar · last.fm</p>
        <div className="listen-head">
          <span className="listen-head__avatar" aria-hidden="true">
            {user?.image ? (
              <img src={user.image} alt="" className="listen-head__img" />
            ) : (
              <span className="listen-head__initial">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="listen-head__meta">
            <h1 className="page-title">{displayName}</h1>
            <p className="page-sub">
              {user?.playcount != null
                ? `${user.playcount.toLocaleString('id-ID')} scrobble di Last.fm`
                : 'Data scrobble dari Last.fm'}
              {` · periode ${periodLabel.toLowerCase()}`}
            </p>
            {user?.url && (
              <a
                className="listen-head__link"
                href={user.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                Lihat di Last.fm
              </a>
            )}
          </div>
          <button
            type="button"
            className="listen-unlink"
            onClick={() => clearLastfmUser()}
          >
            Putuskan
          </button>
        </div>
        <div className="listen-head__connect">
          <ConnectForm
            initial={username}
            submitLabel="Ganti"
            onConnect={handleConnect}
          />
        </div>
        <div className="listen-periods" role="group" aria-label="Pilih periode">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={p.value === period}
              className={`listen-chip${p.value === period ? ' is-on' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {status === 'error' && (
        <div className="container section">
          <div className="state state--error">
            <p>{error}</p>
            <button
              type="button"
              className="state__retry"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Coba lagi
            </button>
            <Link to="/" className="back-link">
              Kembali ke beranda
            </Link>
          </div>
        </div>
      )}

      {status === 'done' && failed.length > 0 && (
        <div className="container section">
          <div className="state">
            <p>
              Sebagian data gagal dimuat:{' '}
              {failed.map((f) => SECTION_LABELS[f]).join(', ')}.
            </p>
            <button
              type="button"
              className="state__retry"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {status !== 'error' && (
        <>
          <section className="container section">
            <SectionHead
              title="Artis teratas"
              desc={`Penyanyi yang paling sering kamu putar · ${periodLabel.toLowerCase()}`}
            />
            {loading ? (
              <ListSkeleton />
            ) : topArtists.length > 0 ? (
              <TopArtistsList artists={topArtists} unit="dengar" />
            ) : (
              <p className="listen-hint">
                Belum ada data artis untuk periode ini. Kalau akunmu privat, Last.fm tidak
                pernah membagikannya.
              </p>
            )}
          </section>

          {loading || albums.length > 0 ? (
            <EditorialRow
              title="Album teratas"
              items={albums}
              loading={loading}
            />
          ) : null}

          <section className="container section">
            <SectionHead
              title="Lagu teratas"
              desc={`Lagu dengan playcount tertinggi · ${periodLabel.toLowerCase()}`}
            />
            {loading ? (
              <ListSkeleton rows={8} />
            ) : tracks.length > 0 ? (
              <TopTracksList tracks={tracks} />
            ) : (
              <p className="listen-hint">Belum ada data lagu untuk periode ini.</p>
            )}
          </section>

          <section className="container section">
            <SectionHead
              title="Scrobble terakhir"
              desc="Yang kamu_MAINSCORE terakhir di Last.fm."
            />
            {loading ? (
              <ListSkeleton rows={8} />
            ) : recent.length > 0 ? (
              <ScrobbleList items={recent} />
            ) : (
              <p className="listen-hint">
                Belum ada scrobble publik. Akun privat atau tanpa riwayat akan terlihat
                kosong di sini.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
