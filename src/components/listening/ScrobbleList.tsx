import { Link } from 'react-router-dom'
import type { ScrobbleItem } from '../../types'
import { formatRelative } from '../../utils/time'
import './ScrobbleList.css'

export default function ScrobbleList({ items }: { items: ScrobbleItem[] }) {
  return (
    <ol className="scrob">
      {items.map((s) => (
        <li key={s.id} className="scrob__item">
          <span className="scrob__time">{formatRelative(s.playedAt)}</span>
          <div className="scrob__main">
            <span className="scrob__track">{s.name}</span>
            <span className="scrob__meta">
              <Link
                to={`/artist/${encodeURIComponent(s.artist)}`}
                className="scrob__artist"
              >
                {s.artist}
              </Link>
              {s.album && <span className="scrob__album">{s.album}</span>}
            </span>
          </div>
          {s.nowPlaying && <span className="scrob__live">sedang dengar</span>}
        </li>
      ))}
    </ol>
  )
}
