import type { AlbumSnapshot } from '../../types'
import MusicCard from '../catalog/MusicCard'
import './FavoriteAlbumsGrid.css'

export default function FavoriteAlbumsGrid({
  albums,
}: {
  albums: AlbumSnapshot[]
}) {
  if (albums.length === 0) {
    return (
      <p className="hint-p">
        Belum ada album favorit. Tandai dengan ikon hati di halaman album.
      </p>
    )
  }
  return (
    <div className="grid favgrid">
      {albums.map((a) => (
        <MusicCard key={a.id} item={a} />
      ))}
    </div>
  )
}
