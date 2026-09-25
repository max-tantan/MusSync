/* oxlint-disable react/only-export-components */
import { useMemo } from 'react'
import { useLibrary } from '../../contexts/LibraryContext'
import { useReviews } from '../../contexts/ReviewsContext'
import { useProfile } from '../../contexts/ProfileContext'
import { averageRating } from '../../utils/score'
import { getFavoriteAlbums, formatJoined } from '../../utils/profile'
import ProfileHeader from '../../components/profile/ProfileHeader'
import QuickStatsCard from '../../components/profile/QuickStatsCard'
import TopAlbumsBlock from '../../components/profile/TopAlbumsBlock'
import FavoriteAlbumsGrid from '../../components/profile/FavoriteAlbumsGrid'
import ArtistFavoritesList from '../../components/profile/ArtistFavoritesList'
import './ProfilePage.css'

function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="profile-sec__head">
      <span className="profile-sec__bar" aria-hidden="true" />
      <div className="profile-sec__titles">
        <h2 className="profile__heading">{title}</h2>
        {desc && <p className="profile-sec__desc">{desc}</p>}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { favorites, ratedCount, favoriteCount } = useLibrary()
  const { extras } = useReviews()
  const { profile } = useProfile()

  const myReviews = useMemo(() => {
    const name = profile.username
    if (!name) return []
    return Object.values(extras)
      .flatMap((list) => list)
      .filter((review) => review.author === name)
  }, [extras, profile.username])

  const avgScore = averageRating(myReviews)
  const favoriteAlbums = useMemo(() => getFavoriteAlbums(favorites), [favorites])
  const joined = useMemo(() => formatJoined(profile.createdAt), [profile.createdAt])

  return (
    <div className="page profile-page">
      <div className="container page-block">
        <ProfileHeader joined={joined} />
      </div>

      <section className="container section">
        <QuickStatsCard
          rated={ratedCount}
          reviews={myReviews.length}
          favorites={favoriteCount}
          avgScore={avgScore}
        />
      </section>

      <section className="container section">
        <SectionHead
          title="Top 3 album"
          desc="Tiga album yang paling menentukan selerimu."
        />
        <TopAlbumsBlock />
      </section>

      <section className="container section">
        <SectionHead
          title="Artis favoritku"
          desc="Artis yang kamu tandai dengan hati."
        />
        <ArtistFavoritesList />
      </section>

      <section className="container section">
        <SectionHead
          title="Album favorit"
          desc="Koleksi album yang kamu tandai."
        />
        <FavoriteAlbumsGrid albums={favoriteAlbums} />
      </section>
    </div>
  )
}
