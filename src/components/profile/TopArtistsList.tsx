import type { TopArtist } from '../../utils/profile'
import './TopArtistsList.css'

export default function TopArtistsList({
  artists,
}: {
  artists: TopArtist[]
}) {
  const max = artists.length > 0 ? artists[0].count : 1
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
                {a.count} album
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
