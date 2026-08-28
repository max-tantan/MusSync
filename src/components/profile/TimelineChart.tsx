import type { YearStat } from '../../utils/profile'
import './TimelineChart.css'

export default function TimelineChart({
  data,
}: {
  data: YearStat[]
}) {
  if (data.length === 0) {
    return <p className="hint-p">Belum ada aktivitas rating.</p>
  }
  return (
    <div className="timeline">
      {data.map((y) => (
        <div className="timeline__row" key={y.year}>
          <span className="timeline__year">{y.year}</span>
          <span className="timeline__bar">
            <i style={{ width: `${Math.round((y.count / y.max) * 100)}%` }} />
          </span>
          <span className="timeline__count">{y.count}</span>
        </div>
      ))}
    </div>
  )
}
