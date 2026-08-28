import type { CSSProperties } from 'react'
import { waveBars } from '../../utils/wave'
import './CoverArt.css'

interface CoverArtProps {
  title: string
  seed: string
  image?: string | null
  size?: 'card' | 'detail'
  year?: number
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

function gradientFor(seed: string): string {
  const h1 = hashString(seed + ':a') % 360
  const h2 = (hashString(seed + ':b') % 360 + 40) % 360
  return `linear-gradient(150deg, hsl(${h1} 38% 26%) 0%, hsl(${h2} 52% 14%) 100%)`
}

export default function CoverArt({
  title,
  seed,
  image,
  size = 'card',
  year,
}: CoverArtProps) {
  const bars = waveBars(hashString(seed))

  return (
    <div
      className={`cover cover--${size}`}
      style={{ background: gradientFor(seed) }}
    >
      {image ? (
        <img
          className="cover__img"
          src={image}
          alt={`Sampul ${title}`}
          loading="lazy"
        />
      ) : (
        <div className="cover__wave" aria-hidden="true">
          {bars.map((h, i) => (
            <i
              key={i}
              style={{ '--h': `${Math.round(h * 100)}%` } as CSSProperties}
            />
          ))}
        </div>
      )}
      {year != null && size === 'detail' && (
        <span className="cover__year">{year}</span>
      )}
    </div>
  )
}