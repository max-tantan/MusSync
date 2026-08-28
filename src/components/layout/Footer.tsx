import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__brand">
          Mus<span>Sync</span>
        </p>
        <p className="footer__note">
          Hanya penilaian & ulasan — volume-nya kamu yang atur di tempat lain.
        </p>
        <Link to="/" className="footer__home">
          Beranda
        </Link>
      </div>
    </footer>
  )
}