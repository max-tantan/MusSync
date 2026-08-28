/* oxlint-disable react/set-state-in-effect */
import { useMemo } from 'react'
import { useLibrary } from '../../contexts/LibraryContext'
import { useReviews } from '../../contexts/ReviewsContext'
import { useProfile } from '../../contexts/ProfileContext'
import { averageRating } from '../../utils/score'
import {
  getTopArtists,
  getTopGenres,
  getRatingDistribution,
  getListeningTimeline,
  getFavoriteAlbums,
  getMilestones,
  getYearsActive,
  formatJoined,
} from '../../utils/profile'
import ProfileHeader from '../../components/profile/ProfileHeader'
import QuickStatsCard from '../../components/profile/QuickStatsCard'
import TopArtistsList from '../../components/profile/TopArtistsList'
import FavoriteAlbumsGrid from '../../components/profile/FavoriteAlbumsGrid'
import GenreBarChart from '../../components/profile/GenreBarChart'
import RatingDistribution from '../../components/profile/RatingDistribution'
import TimelineChart from '../../components/profile/TimelineChart'
import MilestonesList from '../../components/profile/MilestonesList'
import ArtistFavoritesList from '../../components/profile/ArtistFavoritesList'
import './ProfilePage.css'

export default function ProfilePage() {
  const { library, favorites, ratedCount, favoriteCount } = useLibrary()
  const { extras, reviewCount } = useReviews()
  const { profile } = useProfile()

  const myReviews = useMemo(() => {
    const name = profile.username
    if (!name) return []
    return Object.values(extras)
      .flatMap((list) => list)
      .filter((r) => r.author === name)
  }, [extras, profile.username])

  const avgScore = averageRating(myReviews)
  const topArtists = useMemo(() => getTopArtists(library), [library])
  const topGenres = useMemo(() => getTopGenres(library), [library])
  const ratingDist = useMemo(() => getRatingDistribution(myReviews), [myReviews])
  const timeline = useMemo(() => getListeningTimeline(library), [library])
  const favoritesAlbums = useMemo(() => getFavoriteAlbums(favorites), [favorites])
  const yearsActive = useMemo(() => getYearsActive(library), [library])
  const milestones = useMemo(
    () => getMilestones(ratedCount, reviewCount, yearsActive),
    [ratedCount, reviewCount, yearsActive],
  )
  const joined = useMemo(() => formatJoined(profile.createdAt), [profile.createdAt])

  return (
    <div className="page">
      <div className="container page-block">
        <p className="eyebrow">profil · lokal</p>
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
        <h2 className="profile__heading">Penyanyi favorit</h2>
        {topArtists.length > 0 ? (
          <TopArtistsList artists={topArtists} />
        ) : (
          <p className="hint-p">Belum ada data penyanyi.</p>
        )}
      </section>

      <section className="container section">
        <h2 className="profile__heading">Artis favoritku</h2>
        <ArtistFavoritesList />
      </section>

      <section className="container section">
        <h2 className="profile__heading">Album favorit</h2>
        <FavoriteAlbumsGrid albums={favoritesAlbums} />
      </section>

      <section className="container section">
        <div className="profile__cols">
          <div className="profile__col">
            <h2 className="profile__heading">Genre favorit</h2>
            <GenreBarChart genres={topGenres} />
          </div>
          <div className="profile__col">
            <h2 className="profile__heading">Sebaran bintang</h2>
            <RatingDistribution data={ratingDist} />
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="profile__heading">Aktivitas tiap tahun</h2>
        <TimelineChart data={timeline} />
      </section>

      <section className="container section">
        <h2 className="profile__heading">Pencapaian</h2>
        <MilestonesList milestones={milestones} />
      </section>
    </div>
  )
}
