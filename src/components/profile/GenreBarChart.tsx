import type { GenreStat } from '../../utils/profile'
import './GenreBarChart.css'

export default function GenreBarChart({
  genres,
}: {
  genres: GenreStat[]
}) {
  if (genres.length === 0) {
    return <p className="hint-p">Belum ada data genre.</p>
  }
  const max = genres[0].count
  return (
    <div className="genrecloud">
      {genres.map((g) => {
        const level = Math.round((g.count / max) * 3)
        return (
          <span
            key={g.name}
            className={`genrecloud__pill genrecloud__pill--${level}`}
            title={`${g.count} album`}
          >
            {g.name}
            <em>{g.count}</em>
          </span>
        )
      })}
    </div>
  )
}
