/* oxlint-disable react/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ArtistItem, CatalogItem, SimilarAlbumRef } from '../../types'
import { similarAlbums, similarArtists } from '../../services/lastfm'
import MusicCard from '../catalog/MusicCard'
import './SimilarAlbums.css'

interface SimilarAlbumsProps {
  ref: SimilarAlbumRef
  artist: string
  excludeId?: string
}

export default function SimilarAlbums({
  ref,
  artist,
  excludeId,
}: SimilarAlbumsProps) {
  const [albums, setAlbums] = useState<CatalogItem[] | null>(null)
  const [artists, setArtists] = useState<ArtistItem[]>([])

  useEffect(() => {
    let alive = true
    setAlbums(null)
    setArtists([])

    similarAlbums(ref, 12)
      .then((list) => {
        if (!alive) return
        const filtered = excludeId ? list.filter((a) => a.id !== excludeId) : list
        if (filtered.length > 0) {
          setAlbums(filtered)
        } else {
          setArtists([])
          setAlbums([])
        }
      })
      .catch(() => alive && setAlbums([]))

    similarArtists(artist, 6)
      .then((list) => {
        if (alive) setArtists(list)
      })
      .catch(() => alive && setArtists([]))

    return () => {
      alive = false
    }
  }, [ref, artist, excludeId])

  if (albums?.length === 0 && artists.length === 0) return null

  return (
    <section className="container section more">
      {albums?.length ? (
        <>
          <h2 className="more__heading">Album serupa</h2>
          <div className="grid">
            {albums.slice(0, 8).map((m) => (
              <MusicCard key={m.id} item={m} />
            ))}
          </div>
        </>
      ) : (
        artists.length > 0 && (
          <>
            <h2 className="more__heading">Pendengar ini juga menikmati</h2>
            <div className="similar__artists">
              {artists.map((a) => (
                <Link
                  key={a.name}
                  to={`/artist/${encodeURIComponent(a.name)}`}
                  className="similar__artist"
                >
                  <span className="similar__avatar">
                    {a.image ? (
                      <img src={a.image} alt="" loading="lazy" />
                    ) : (
                      <span className="similar__initial">
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="similar__aname">{a.name}</span>
                </Link>
              ))}
            </div>
          </>
        )
      )}
    </section>
  )
}
