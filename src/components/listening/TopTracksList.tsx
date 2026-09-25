import { Link } from 'react-router-dom'
import type { TrackItem } from '../../types'
import './TopTracksList.css'

export default function TopTracksList({ tracks }: { tracks: TrackItem[] }) {
  const max = Math.max(1, tracks[0]?.playcount ?? 0)

  return (
    <ol className="toptracks">
      {tracks.map((t, i) => (
        <li key={t.id} className="toptracks__item">
          <span className="toptracks__rank">{String(i + 1).padStart(2, '0')}</span>
          <div className="toptracks__row">
            <div className="toptracks__head">
              <span className="toptracks__name">{t.name}</span>
              <span className="toptracks__count">
                {(t.playcount ?? 0).toLocaleString('id-ID')} dengar
              </span>
            </div>
            <span className="toptracks__bar">
              <i
                style={{
                  width: `${Math.max(4, Math.round(((t.playcount ?? 0) / max) * 100))}%`,
                }}
              />
            </span>
            <Link
              to={`/artist/${encodeURIComponent(t.artist)}`}
              className="toptracks__artist"
            >
              {t.artist}
            </Link>
          </div>
        </li>
      ))}
    </ol>
  )
}
