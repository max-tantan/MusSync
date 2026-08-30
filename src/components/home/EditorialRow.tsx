import { Link } from 'react-router-dom'
import type { CatalogItem } from '../../types'
import CoverArt from '../catalog/CoverArt'
import './EditorialRow.css'

interface EditorialRowProps {
  title: string
  items: CatalogItem[]
  loading?: boolean
}

export default function EditorialRow({
  title,
  items,
  loading = false,
}: EditorialRowProps) {
  if (!loading && items.length === 0) return null

  return (
    <section className="container section ed-row">
      <h2 className="ed-row__heading">{title}</h2>
      <div className="ed-row__list">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="ed-row__item ed-row__item--skeleton">
                <span className="ed-row__art" />
                <span className="ed-row__line" />
                <span className="ed-row__line ed-row__line--short" />
              </span>
            ))
          : items.map((m) => (
              <Link
                key={m.id}
                to={`/music/${encodeURIComponent(m.id)}`}
                className="ed-row__item"
              >
                <CoverArt title={m.title} seed={m.id} image={m.image} size="card" />
                <span className="ed-row__title">{m.title}</span>
                <span className="ed-row__artist">{m.artist}</span>
              </Link>
            ))}
      </div>
    </section>
  )
}
