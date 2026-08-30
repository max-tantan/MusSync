import type { ReactNode } from 'react'
import { MusicIcon, StarIcon, HeartIcon } from '../icons'
import './QuickStatsCard.css'

export default function QuickStatsCard({
  rated,
  reviews,
  favorites,
  avgScore,
}: {
  rated: number
  reviews: number
  favorites: number
  avgScore: number
}) {
  return (
    <div className="qstats">
      <Stat icon={<MusicIcon size={18} />} label="album dinilai" value={rated} />
      <Stat icon={<StarIcon size={18} />} label="total ulasan" value={reviews} />
      <Stat icon={<HeartIcon filled size={18} />} label="favorit" value={favorites} />
      <Stat label="rata-rata skor" value={avgScore.toFixed(1)} unit="dari 5" />
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  unit,
}: {
  icon?: ReactNode
  label: string
  value: number | string
  unit?: string
}) {
  return (
    <div className="qstats__card">
      {icon && <span className="qstats__icon">{icon}</span>}
      <span className="qstats__value">
        <strong>{value}</strong>
        {unit && <em>{unit}</em>}
      </span>
      <span className="qstats__label">{label}</span>
    </div>
  )
}
