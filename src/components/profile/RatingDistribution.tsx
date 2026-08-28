import type { StarDistribution } from '../../utils/profile'
import './RatingDistribution.css'

export default function RatingDistribution({
  data,
}: {
  data: StarDistribution[]
}) {
  const hasData = data.some((d) => d.count > 0)
  if (!hasData) {
    return <p className="hint-p">Belum ada rating.</p>
  }
  return (
    <div className="rdist">
      {data.map((d) => (
        <div className="rdist__row" key={d.stars}>
          <span className="rdist__label">
            {'★'.repeat(d.stars)}
            <em>{d.count}</em>
          </span>
          <span className="rdist__bar">
            <i style={{ width: `${d.percent}%` }} />
          </span>
          <span className="rdist__pct">{d.percent}%</span>
        </div>
      ))}
    </div>
  )
}
