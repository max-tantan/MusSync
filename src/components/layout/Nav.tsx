import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { randomAlbum } from '../../services/lastfm'
import { useTheme } from '../../hooks/useTheme'
import './Nav.css'

const BARS = [0.5, 1, 0.7, 0.9]

function Eq({ active }: { active: boolean }) {
  return (
    <span
      className={`nav__eq${active ? ' is-on' : ''}`}
      aria-hidden="true"
    >
      {BARS.map((h, i) => (
        <i
          key={i}
          style={{ '--h': `${Math.round(h * 100)}%` } as React.CSSProperties}
        />
      ))}
    </span>
  )
}

function Mark() {
  return (
    <span className="nav__mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

const links = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/genre', label: 'Genre', end: false },
  { to: '/library', label: 'Pustaka', end: false },
  { to: '/profile', label: 'Profil', end: false },
]

export default function Nav() {
  const navigate = useNavigate()
  const [theme, setTheme] = useTheme()
  const [busy, setBusy] = useState(false)

  async function goRandom() {
    if (busy) return
    setBusy(true)
    try {
      const item = await randomAlbum()
      navigate(`/music/${encodeURIComponent(item.id)}`)
    } catch {
      setBusy(false)
    }
  }

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <Mark />
          <span>
            Mus<span className="nav__accent">Sync</span>
          </span>
          <span className="nav__branddata">/ papan skor</span>
        </Link>

        <div className="nav__right">
          <nav className="nav__links" aria-label="Navigasi utama">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `nav__link${isActive ? ' is-active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="nav__label">{l.label}</span>
                    <Eq active={isActive} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="nav__tools">
            <button
              type="button"
              className="nav__tool"
              onClick={goRandom}
              disabled={busy}
              title="Lompat ke album acak"
            >
              {busy ? '…' : 'acak'}
            </button>
            <button
              type="button"
              className="nav__tool nav__tool--theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Ganti tema"
            >
              {theme === 'dark' ? 'terang' : 'gelap'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
