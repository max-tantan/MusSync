import { formatScore } from '../lib/score'
import './NeonScore.css'

export default function NeonScore({ score }: { score: number }) {
  const outline = score === 0
  return (
    <div
      className={`neon-score${outline ? ' is-empty' : ''}`}
      aria-label={`Skor ${formatScore(score)} dari 5`}
    >
      <span className="neon-score__label">skor</span>
      <span className="neon-score__row">
        <span className="neon-score__num">{formatScore(score)}</span>
        <span className="neon-score__den">/5</span>
      </span>
    </div>
  )
}