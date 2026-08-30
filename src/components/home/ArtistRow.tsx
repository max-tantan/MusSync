import { Link } from 'react-router-dom'
import type { ArtistItem } from '../../types'
import './ArtistRow.css'

interface ArtistRowProps {
  title: string
  artists: ArtistItem[]
  loading?: boolean
}

export default function ArtistRow({
  title,
  artists,
  loading = false,
}: ArtistRowProps) {
  if (!loading && artists.length === 0) return null

  return (
    <section className="container section ar-row">
      <h2 className="ar-row__heading">{title}</h2>
      <div className="ar-row__list">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="ar-row__item ar-row__item--skeleton">
                <span className="ar-row__avatar" />
                <span className="ar-row__line" />
              </span>
            ))
          : artists.map((a) => (
              <Link
                key={a.name}
                to={`/artist/${encodeURIComponent(a.name)}`}
                className="ar-row__item"
              >
                <span className="ar-row__avatar">
                  {a.image ? (
                    <img src={a.image} alt="" loading="lazy" className="ar-row__img" />
                  ) : (
                    <span className="ar-row__initial">
                      {a.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="ar-row__name">{a.name}</span>
                {a.listeners != null && (
                  <span className="ar-row__meta">
                    {a.listeners.toLocaleString('id-ID')} pendengar
                  </span>
                )}
              </Link>
            ))}
      </div>
    </section>
  )
}
