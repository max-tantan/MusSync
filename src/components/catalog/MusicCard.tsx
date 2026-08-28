import { Link } from 'react-router-dom'
import type { CatalogItem } from '../../types'
import { useReviews } from '../../contexts/ReviewsContext'
import { useLibrary } from '../../contexts/LibraryContext'
import { averageRating } from '../../utils/score'
import RatingStars from '../rating/RatingStars'
import CoverArt from './CoverArt'
import HeartButton from '../ui/HeartButton'
import './MusicCard.css'

export default function MusicCard({ item }: { item: CatalogItem }) {
  const { reviewsFor } = useReviews()
  const { isFavorite, toggleFavorite } = useLibrary()
  const reviews = reviewsFor(item.id)
  const avg = averageRating(reviews)
  const snapshot = {
    id: item.id,
    title: item.title,
    artist: item.artist,
    image: item.image,
    mbid: item.mbid,
    url: item.url,
    listeners: item.listeners,
    playcount: item.playcount,
  }

  return (
    <Link to={`/music/${encodeURIComponent(item.id)}`} className="card">
      <CoverArt title={item.title} seed={item.id} image={item.image} />
      <div className="card__topright">
        <HeartButton
          isFavorite={isFavorite(item.id)}
          onToggle={() => toggleFavorite(snapshot)}
          size="sm"
        />
        <span className="card__score">{avg ? avg.toFixed(1) : '—'}</span>
      </div>

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