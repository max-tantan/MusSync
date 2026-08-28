import { Link } from 'react-router-dom'
import { GENRE_META } from '../data/genres'
import './GenrePage.css'

export default function GenreIndexPage() {
  return (
    <div className="container page-block">
      <p className="eyebrow">katalog</p>
      <h1 className="page-title">Genre</h1>
      <p className="page-sub">
        Album per genre diambil langsung dari tag Last.fm.
      </p>

      <div className="genre-grid">
        {GENRE_META.map((g) => (
          <Link key={g.label} to={`/genre/${encodeURIComponent(g.tag)}`} className="genre-tile">
            <span className="genre-tile__name">{g.label}</span>
            <span className="genre-tile__count">tag · {g.tag}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}