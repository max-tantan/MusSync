import { Link } from 'react-router-dom'
import type { CatalogItem } from '../types'
import { useReviews } from '../context/ReviewsContext'
import { averageRating } from '../lib/score'
import RatingStars from './RatingStars'
import CoverArt from './CoverArt'
import './MusicCard.css'

export default function MusicCard({ item }: { item: CatalogItem }) {
  const { reviewsFor } = useReviews()
  const reviews = reviewsFor(item.id)
  const avg = averageRating(reviews)

  return (
    <Link to={`/music/${encodeURIComponent(item.id)}`} className="card">
      <CoverArt title={item.title} seed={item.id} image={item.image} />
      <span className="card__score">{avg ? avg.toFixed(1) : '—'}</span>

      <div className="card__body">
        <h3 className="card__title">{item.title}</h3>
        <p className="card__meta">{item.artist}</p>
        <div className="card__foot">
          <RatingStars rating={Math.round(avg)} size="sm" />
          <span className="card__year">
            {avg ? reviews.length : 'belum dinilai'}
          </span>
        </div>
      </div>
    </Link>
  )
}