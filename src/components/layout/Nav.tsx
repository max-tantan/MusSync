import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useProfile } from '../../contexts/ProfileContext'
import { UserIcon } from '../icons'
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

function ProfileButton() {
  const { profile } = useProfile()
  return (
    <Link to="/profile" className="nav__profile" title="Profil">
      {profile.avatar ? (
        <img src={profile.avatar} alt="Foto profil" className="nav__avatar" />
      ) : (
        <span className="nav__avatar">
          <UserIcon size={18} />
        </span>
      )}
    </Link>
  )
}

const links = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/genre', label: 'Genre', end: false },
  { to: '/library', label: 'Pustaka', end: false },
]

export default function Nav() {
  const [theme, setTheme] = useTheme()
  const light = theme === 'light'

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <Mark />
          <span>
            Mus<span className="nav__accent">Sync</span>
          </span>
          <span className="nav__branddata">Powered by Last.fm</span>
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
              role="switch"
              aria-checked={light}
              aria-label="Ganti tema gelap terang"
              className={`nav__switch${light ? ' is-light' : ''}`}
              onClick={() => setTheme(light ? 'dark' : 'light')}
            >
              <span className="nav__switch-track" aria-hidden="true">
                <span className="nav__switch-thumb" />
              </span>
            </button>
            <ProfileButton />
          </div>
        </div>
      </div>
    </header>
  )
}
