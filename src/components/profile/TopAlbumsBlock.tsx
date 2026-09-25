import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTopAlbums } from '../../hooks/useTopAlbums'
import type { AlbumSnapshot } from '../../types'
import AlbumSearchDialog from './AlbumSearchDialog'
import CoverArt from '../catalog/CoverArt'
import './TopAlbumsBlock.css'

export default function TopAlbumsBlock() {
  const { slots, setSlot, removeSlot } = useTopAlbums()
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const selectedIds = slots
    .map((album) => album?.id)
    .filter((id): id is string => typeof id === 'string')
  const currentAlbumId = editingSlot === null ? undefined : slots[editingSlot]?.id

  function handleSelect(album: AlbumSnapshot) {
    if (editingSlot === null) return
    setSlot(editingSlot, album)
    setEditingSlot(null)
  }

  return (
    <div className="top-albums-shell">
      <div className="top-albums-grid">
        {slots.map((album, index) => (
          <article className="top-album" key={index}>
            {album ? (
              <>
                <Link
                  className="top-album__link"
                  to={`/music/${encodeURIComponent(album.id)}`}
                  aria-label={`Buka album ${album.title} oleh ${album.artist}`}
                >
                  <span className="top-album__cover">
                    <CoverArt title={album.title} seed={album.id} image={album.image} />
                    <span className="top-album__rank" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <span className="top-album__copy">
                    <strong className="top-album__title">{album.title}</strong>
                    <span className="top-album__artist">{album.artist}</span>
                  </span>
                </Link>
                <div className="top-album__actions">
                  <button
                    type="button"
                    className="top-album__edit"
                    onClick={() => setEditingSlot(index)}
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    className="top-album__remove"
                    aria-label={`Hapus ${album.title} dari pilihan album`}
                    onClick={() => removeSlot(index)}
                  >
                    ×
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="top-album__empty"
                onClick={() => setEditingSlot(index)}
              >
                <span className="top-album__plus" aria-hidden="true">
                  +
                </span>
                <strong>Tambah album</strong>
                <small>Slot {index + 1}</small>
              </button>
            )}
          </article>
        ))}
      </div>

      {editingSlot !== null && (
        <AlbumSearchDialog
          selectedIds={selectedIds}
          currentAlbumId={currentAlbumId}
          onSelect={handleSelect}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  )
}
