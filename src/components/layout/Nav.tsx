import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { randomAlbum } from '../lib/lastfm'
import { useTheme } from '../lib/theme'
import './Nav.css'

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
  { to: '/tentang', label: 'Tentang', end: false },
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
                {l.label}
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
              {busy ? '…' : 'Acak'}
            </button>
            <button
              type="button"
              className="nav__tool"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Ganti tema"
            >
              {theme === 'dark' ? 'Terang' : 'Gelap'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}