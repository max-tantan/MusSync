/* oxlint-disable react/set-state-in-effect */
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'
import { useReviews } from '../context/ReviewsContext'
import { loadUser } from '../lib/user'
import { averageRating, formatScore } from '../lib/score'
import type { LibraryEntry } from '../types'
import MusicCard from '../components/MusicCard'
import CoverArt from '../components/CoverArt'
import RatingBreakdown from '../components/RatingBreakdown'
import './LibraryPage.css'

type Tab = 'rated' | 'want' | 'stats'

export default function LibraryPage() {
  const {
    library,
    ratedCount,
    wantCount,
    remove,
    exportJSON,
    importJSON,
  } = useLibrary()
  const { extras, reviewCount } = useReviews()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('rated')
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null)

  const rated: LibraryEntry[] = useMemo(
    () => Object.values(library).filter((e) => e.status === 'rated'),
    [library],
  )
  const want: LibraryEntry[] = useMemo(
    () => Object.values(library).filter((e) => e.status === 'want'),
    [library],
  )

  const user = loadUser()
  const myReviews = useMemo(
    () =>
      Object.values(extras)
        .flatMap((list) => list)
        .filter((r) => r.author === user),
    [extras, user],
  )
  const thisYear = new Date().getFullYear()
  const thisYearCount = myReviews.filter((r) =>
    r.date?.startsWith(String(thisYear)),
  ).length

  const genreDist = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of rated) {
      for (const t of e.item.tags ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [rated])

  function handleExport() {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mussync-pustaka-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file
      .text()
      .then((text) => {
        const res = importJSON(text)
        setNotice({ ok: res.ok, msg: res.message })
      })
      .catch(() => setNotice({ ok: false, msg: 'File tidak bisa dibaca.' }))
      .finally(() => {
        if (fileRef.current) fileRef.current.value = ''
      })
  }

  return (
    <div className="page">
      <div className="container page-block">
        <p className="eyebrow">pribadi · lokal</p>
        <h1 className="page-title">Pustaka</h1>
        <p className="page-sub">
          Album yang kamu nilai dan tandai "mau dengar". Tersimpan di browser
          ini saja — makanya ada tombol cadangan.
        </p>
      </div>

      <section className="container section">
        <div className="lib-tabs" role="tablist" aria-label="Jenis entri">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'rated'}
            className={`lib-tab${tab === 'rated' ? ' is-on' : ''}`}
            onClick={() => setTab('rated')}
          >
            Perpustakaan ({ratedCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'want'}
            className={`lib-tab${tab === 'want' ? ' is-on' : ''}`}
            onClick={() => setTab('want')}
          >
            Mau dengar ({wantCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'stats'}
            className={`lib-tab${tab === 'stats' ? ' is-on' : ''}`}
            onClick={() => setTab('stats')}
          >
            Statistik
          </button>
        </div>

        {tab === 'rated' &&
          (rated.length > 0 ? (
            <div className="grid">
              {rated.map((e) => (
                <MusicCard key={e.item.id} item={e.item} />
              ))}
            </div>
          ) : (
            <div className="lib-empty">
              <p>
                Belum ada album dinilai. Kasih skor di halaman album, nanti
                ke perpustakaan.
              </p>
              <Link to="/" className="state__retry">
                Cari album
              </Link>
            </div>
          ))}

        {tab === 'want' &&
          (want.length > 0 ? (
            <div className="lib-want">
              {want.map((e) => (
                <div className="lib-want__row" key={e.item.id}>
                  <CoverArt
                    title={e.item.title}
                    seed={e.item.id}
                    image={e.item.image}
                    size="card"
                  />
                  <div className="lib-want__body">
                    <span className="lib-want__title">{e.item.title}</span>
                    <span className="lib-want__artist">{e.item.artist}</span>
                  </div>
                  <div className="lib-want__tools">
                    <Link
                      to={`/music/${encodeURIComponent(e.item.id)}`}
                      className="state__retry"
                    >
                      Buka
                    </Link>
                    <button
                      type="button"
                      className="lib-want__remove"
                      onClick={() => remove(e.item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lib-empty">
              <p>
                Kosong. Klik "Mau dengar" di halaman album untuk menandainya.
              </p>
            </div>
          ))}

        {tab === 'stats' && (
          <div className="stats">
            <div className="stats__cards">
              <div className="stats__card">
                <strong>{ratedCount}</strong>
                <span>album dinilai</span>
              </div>
              <div className="stats__card">
                <strong>{reviewCount}</strong>
                <span>total ulasan</span>
              </div>
              <div className="stats__card">
                <strong>{thisYearCount}</strong>
                <span>tahun ini</span>
              </div>
              <div className="stats__card">
                <strong>{formatScore(averageRating(myReviews))}</strong>
                <span>rata-rata skormu</span>
              </div>
            </div>

            <div className="stats__cols">
              <div className="stats__col">
                <h2 className="stats__heading">Sebaran bintangmu</h2>
                {myReviews.length > 0 ? (
                  <RatingBreakdown reviews={myReviews} />
                ) : (
                  <p className="stats__hint">Belum ada review milikmu.</p>
                )}
              </div>
              <div className="stats__col">
                <h2 className="stats__heading">Genre favorit</h2>
                {genreDist.length > 0 ? (
                  <ul className="stats__genres">
                    {genreDist.map(([tag, n]) => (
                      <li key={tag}>
                        <span>{tag}</span>
                        <strong>{n}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="stats__hint">Belum ada data genre.</p>
                )}
              </div>
            </div>

            <div className="stats__backup">
              <h2 className="stats__heading">Cadangkan & pulihkan</h2>
              <p className="stats__hint">
                Data kamu tinggal di browser ini. Unduh salinannya agar aman,
                lalu impor kembali di perangkat lain.
              </p>
              <div className="stats__actions">
                <button type="button" className="state__retry" onClick={handleExport}>
                  Unduh JSON
                </button>
                <button
                  type="button"
                  className="state__retry"
                  onClick={() => fileRef.current?.click()}
                >
                  Impor dari file
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={handleImport}
                />
              </div>
              {notice && (
                <p className={notice.ok ? 'stats__notice is-ok' : 'stats__notice'}>
                  {notice.msg}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}