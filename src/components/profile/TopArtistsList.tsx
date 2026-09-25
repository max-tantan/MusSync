import type { TopArtist } from '../../utils/profile'
import './TopArtistsList.css'

export default function TopArtistsList({
  artists,
  unit = 'album',
}: {
  artists: TopArtist[]
  unit?: string
}) {
  const max = Math.max(1, artists[0]?.count ?? 0)
  return (
    <ol className="topartists">
      {artists.map((a, i) => (
        <li key={a.name} className="topartists__item">
          <span className="topartists__rank">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="topartists__row">
            <div className="topartists__head">
              <span className="topartists__name">{a.name}</span>
              <span className="topartists__count">
                {a.count} {unit}
              </span>
            </div>
            <span className="topartists__bar">
              <i
                style={{
                  width: `${Math.max(4, Math.round((a.count / max) * 100))}%`,
                }}
              />
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
