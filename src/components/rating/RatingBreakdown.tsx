import { distribution } from '../../utils/score'
import type { Review } from '../../types'
import './RatingBreakdown.css'

export default function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const dist = distribution(reviews)
  const total = reviews.length || 1

  return (
    <div className="breakdown">
      {[5, 4, 3, 2, 1].map((v) => {
        const count = dist[v]
        const pct = (count / total) * 100
        return (
          <div className="breakdown__row" key={v}>
            <span className="breakdown__label">{v}★</span>
            <div className="breakdown__track" role="img" aria-label={`${count} ulasan memberi ${v} bintang`}>
              <span
                className="breakdown__fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="breakdown__count">{count}</span>
          </div>
        )
      })}
    </div>
  )
}