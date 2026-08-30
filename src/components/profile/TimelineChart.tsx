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
      <div className="timeline__chart" role="img" aria-label="Album dinilai per tahun">
        {data.map((y) => (
          <div className="timeline__col" key={y.year}>
            <span className="timeline__count">{y.count}</span>
            <span className="timeline__bar">
              <i
                style={{
                  height: `${Math.max(6, Math.round((y.count / y.max) * 100))}%`,
                }}
              />
            </span>
            <span className="timeline__year">{y.year}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
