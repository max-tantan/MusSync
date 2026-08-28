import { Link } from 'react-router-dom'
import { useArtistFavorites } from '../../contexts/ArtistFavoritesContext'
import HeartButton from '../ui/HeartButton'
import { MicIcon } from '../icons'
import './ArtistFavoritesList.css'

export default function ArtistFavoritesList() {
  const { favorites, isArtistFavorite, toggleArtistByName, removeArtist } =
    useArtistFavorites()

  if (Object.keys(favorites).length === 0) {
    return (
      <p className="hint-p">
        Belum ada artis favorit. Tandai dengan ikon hati di halaman artis.
      </p>
    )
  }

  return (
    <div className="artfav-grid">
      {Object.values(favorites).map((a) => (
        <div className="artfav" key={a.name.toLowerCase()}>
          <Link
            to={`/artist/${encodeURIComponent(a.name)}`}
            className="artfav__link"
          >
            {a.image ? (
              <img
                className="artfav__thumb"
                src={a.image}
                alt={`Foto ${a.name}`}
                loading="lazy"
              />
            ) : (
              <span className="artfav__thumb artfav__thumb--empty">
                <MicIcon size={20} />
              </span>
            )}
            <span className="artfav__name">{a.name}</span>
          </Link>
          <span className="artfav__heart">
            <HeartButton
              isFavorite={isArtistFavorite(a.name)}
              onToggle={() =>
                isArtistFavorite(a.name)
                  ? removeArtist(a.name)
                  : toggleArtistByName(a.name, a.image)
              }
              size="sm"
            />
          </span>
        </div>
      ))}
    </div>
  )
}
