import { Link } from 'react-router-dom'
import './Footer.css'

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/genre', label: 'Genre' },
  { to: '/listening', label: 'Dengar' },
  { to: '/library', label: 'Pustaka' },
  { to: '/profile', label: 'Profil' },
]

const explore = [
  { to: '/genre/electronic', label: 'Electronic' },
  { to: '/genre/rock', label: 'Rock' },
  { to: '/genre/jazz', label: 'Jazz' },
  { to: '/genre/hip hop', label: 'Hip-Hop' },
  { to: '/genre/indonesian', label: 'Musik Indonesia' },
]

const RULE = [1, 0.5, 0.8, 1, 0.6, 0.9, 1, 0.55, 0.75, 1, 0.65, 0.85, 1, 0.7, 0.9]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__brand">
            <span className="footer__mark" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="footer__word">
              Mus<span>Sync</span>
            </span>
          </Link>
          <p className="footer__note">
            Papan skor untuk musik. Nilai, baca ulasan, dan temukan yang layak
            didengar — tanpa tombol play.
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__title">Navigasi</h3>
          <nav className="footer__linklist" aria-label="Navigasi footer">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="footer__link">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer__col">
          <h3 className="footer__title">Jelajahi</h3>
          <nav className="footer__linklist" aria-label="Eksplorasi footer">
            {explore.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="footer__link"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer__col footer__col--meta">
          <h3 className="footer__title">Tentang</h3>
          <p className="footer__powered">
            Data album & artis
            <br />
            diambil langsung dari <strong>Last.fm</strong>.
          </p>
          <p className="footer__local">
            Semua data rating & pustaka
            <br />
            disimpan lokal di browser kamu.
          </p>
        </div>
      </div>

      <div className="footer__rule" aria-hidden="true">
        {RULE.map((h, i) => (
          <i
            key={i}
            style={{ '--h': `${Math.round(h * 100)}%` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="container footer__metas">
        <span>© {new Date().getFullYear()} MusSync</span>
        <span className="footer__metas-sep">·</span>
        <span>papan skor musik · lokal</span>
        <span className="footer__metas-sep">·</span>
        <span className="footer__credits">Powered by Last.fm</span>
      </div>
    </footer>
  )
}
