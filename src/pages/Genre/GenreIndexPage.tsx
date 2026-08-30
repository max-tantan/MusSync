import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GENRE_META } from '../../data/genres'
import { tagTopAlbums } from '../../services/lastfm'
import './GenrePage.css'

function GenreTile({ label, tag }: { label: string; tag: string }) {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    tagTopAlbums(tag, 3)
      .then((albums) => {
        if (!alive) return
        const hit = albums.find((a) => a.image)
        setImage(hit?.image ?? null)
      })
      .catch(() => {
        if (alive) setImage(null)
      })
    return () => {
      alive = false
    }
  }, [tag])

  return (
    <Link
      to={`/genre/${encodeURIComponent(tag)}`}
      className="genre-tile"
    >
      <span className="genre-tile__art">
        {image ? (
          <img src={image} alt="" loading="lazy" className="genre-tile__img" />
        ) : (
          <span className="genre-tile__img genre-tile__img--placeholder" />
        )}
      </span>
      <span className="genre-tile__name">{label}</span>
      <span className="genre-tile__count">tag · {tag}</span>
    </Link>
  )
}

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
          <GenreTile key={g.label} label={g.label} tag={g.tag} />
        ))}
      </div>
    </div>
  )
}
