import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AlbumSnapshot } from '../../types'
import CoverArt from '../catalog/CoverArt'
import './FavoriteAlbumsGrid.css'

const PER_PAGE = 8

export default function FavoriteAlbumsGrid({
  albums,
}: {
  albums: AlbumSnapshot[]
}) {
  const [page, setPage] = useState(1)

  if (albums.length === 0) {
    return (
      <p className="hint-p">
        Belum ada album favorit. Tandai dengan ikon hati di halaman album.
      </p>
    )
  }

  const totalPages = Math.ceil(albums.length / PER_PAGE)
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PER_PAGE
  const visible = albums.slice(start, start + PER_PAGE)

  return (
    <>
      <div className="grid favgrid">
        {visible.map((a: AlbumSnapshot) => (
          <Link
            key={a.id}
            to={`/music/${encodeURIComponent(a.id)}`}
            className="favcard"
          >
            <CoverArt title={a.title} seed={a.id} image={a.image} />
            <span className="favcard__overlay" aria-hidden="true">
              <span className="favcard__title">{a.title}</span>
              <span className="favcard__artist">{a.artist}</span>
            </span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="favpager" aria-label="Album favorit halaman">
          <button
            type="button"
            className="favpager__btn"
            disabled={current <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </button>
          <span className="favpager__info">
            {current} / {totalPages}
          </span>
          <button
            type="button"
            className="favpager__btn"
            disabled={current >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Berikutnya
          </button>
        </nav>
      )}
    </>
  )
}
