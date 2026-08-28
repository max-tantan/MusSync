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
      <Stat icon={<MusicIcon size={20} />} label="album dinilai" value={rated} />
      <Stat icon={<StarIcon size={20} />} label="total ulasan" value={reviews} />
      <Stat icon={<HeartIcon filled size={20} />} label="favorit" value={favorites} />
      <Stat label="rata-rata skor" value={avgScore.toFixed(1)} />
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: number | string
}) {
  return (
    <div className="qstats__card">
      {icon && <span className="qstats__icon">{icon}</span>}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
