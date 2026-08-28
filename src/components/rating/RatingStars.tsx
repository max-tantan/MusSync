import { useState } from 'react'
import './RatingStars.css'

interface RatingStarsProps {
  rating: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function RatingStars({
  rating,
  onChange,
  size = 'md',
}: RatingStarsProps) {
  const [hover, setHover] = useState(0)
  const interactive = Boolean(onChange)
  const shown = hover || rating

  if (!interactive) {
    return (
      <span
        className={`stars stars--${size}`}
        role="img"
        aria-label={`${rating} dari 5 bintang`}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <span key={v} className={v <= rating ? 'is-on' : ''}>
            ★
          </span>
        ))}
      </span>
    )
  }

  return (
    <div
      className={`stars stars--${size} stars--input`}
      role="radiogroup"
      aria-label="Pilih rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={v === rating}
          aria-label={`${v} bintang`}
          className={v <= shown ? 'is-on' : ''}
          onMouseEnter={() => setHover(v)}
          onFocus={() => setHover(v)}
          onBlur={() => setHover(0)}
          onClick={() => onChange?.(v)}
        >
          ★
        </button>
      ))}
    </div>
  )
}