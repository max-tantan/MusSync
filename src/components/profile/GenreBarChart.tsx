import type { GenreStat } from '../../utils/profile'
import './GenreBarChart.css'

export default function GenreBarChart({
  genres,
}: {
  genres: GenreStat[]
}) {
  const max = genres.length > 0 ? genres[0].count : 1
  if (genres.length === 0) {
    return <p className="hint-p">Belum ada data genre.</p>
  }
  return (
    <div className="genrechart">
      {genres.map((g) => (
        <div className="genrechart__row" key={g.name}>
          <span className="genrechart__name">{g.name}</span>
          <span className="genrechart__bar">
            <i style={{ width: `${Math.round((g.count / max) * 100)}%` }} />
          </span>
          <span className="genrechart__count">{g.count}</span>
        </div>
      ))}
    </div>
  )
}
