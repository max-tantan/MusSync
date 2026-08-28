import { Link } from 'react-router-dom'
import './Footer.css'

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/genre', label: 'Genre' },
  { to: '/library', label: 'Pustaka' },
  { to: '/profile', label: 'Profil' },
]

const RULE = [1, 0.5, 0.8, 1, 0.6, 0.9, 1, 0.55, 0.75, 1, 0.65, 0.85]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            Mus<span>Sync</span>
          </span>
        </div>

        <p className="footer__note">
          Skor musikmu di sini. Volume-nya kamu yang atur di tempat lain.
        </p>

        <nav className="footer__links" aria-label="Navigasi footer">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="footer__link">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="footer__rule" aria-hidden="true">
        {RULE.map((h, i) => (
          <i key={i} style={{ '--h': `${Math.round(h * 100)}%` } as React.CSSProperties} />
        ))}
      </div>

      <div className="container footer__metas">
        <span>© {new Date().getFullYear()} MusSync</span>
        <span className="footer__metas-sep">·</span>
        <span>papan skor musik · lokal</span>
      </div>
    </footer>
  )
}
