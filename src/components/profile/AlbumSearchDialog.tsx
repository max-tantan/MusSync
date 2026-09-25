import { useEffect, useRef, useState } from 'react'
import CoverArt from '../catalog/CoverArt'
import { albumSearch, LastFmError } from '../../services/lastfm'
import type { AlbumSnapshot, CatalogItem } from '../../types'
import './AlbumSearchDialog.css'

interface AlbumSearchDialogProps {
  selectedIds: string[]
  currentAlbumId?: string
  onSelect: (album: AlbumSnapshot) => void
  onClose: () => void
}

interface SearchState {
  query: string
  items: CatalogItem[]
  error: string | null
}

function errorMessage(error: unknown) {
  if (error instanceof LastFmError) {
    if (error.code === 8) return 'API Last.fm belum dikonfigurasi.'
    return error.message || 'Last.fm tidak dapat memuat pencarian.'
  }
  return 'Pencarian tidak dapat dimuat. Coba lagi.'
}

export default function AlbumSearchDialog({
  selectedIds,
  currentAlbumId,
  onSelect,
  onClose,
}: AlbumSearchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<SearchState>({
    query: '',
    items: [],
    error: null,
  })
  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= 2
  const isCurrentSearch = search.query === normalizedQuery
  const loading = canSearch && !isCurrentSearch
  const results = isCurrentSearch ? search.items : []

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    if (!canSearch) return

    let active = true
    const timer = window.setTimeout(() => {
      albumSearch(normalizedQuery, 12)
        .then((items) => {
          if (active) setSearch({ query: normalizedQuery, items, error: null })
        })
        .catch((error: unknown) => {
          if (active) {
            setSearch({ query: normalizedQuery, items: [], error: errorMessage(error) })
          }
        })
    }, 400)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [canSearch, normalizedQuery])

  return (
    <dialog
      ref={dialogRef}
      className="album-picker"
      aria-labelledby="album-picker-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="album-picker__shell">
        <header className="album-picker__header">
          <div>
            <p className="album-picker__eyebrow">Last.fm</p>
            <h2 id="album-picker-title" className="album-picker__title">
              Pilih album
            </h2>
          </div>
          <button
            type="button"
            className="album-picker__close"
            aria-label="Tutup pencarian album"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="album-picker__search-wrap">
          <label className="album-picker__label" htmlFor="top-album-search">
            Cari judul atau artis
          </label>
          <input
            id="top-album-search"
            className="album-picker__search"
            type="search"
            value={query}
            autoFocus
            autoComplete="off"
            placeholder="Contoh: Blue Train — John Coltrane"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="album-picker__results" aria-live="polite" aria-busy={loading}>
          {!canSearch && (
            <div className="album-picker__state">
              <span className="album-picker__state-mark" aria-hidden="true">
                ♪
              </span>
              <p>Ketik minimal dua karakter untuk mulai mencari.</p>
            </div>
          )}

          {loading && <p className="album-picker__state-text">Mencari album…</p>}

          {!loading && isCurrentSearch && search.error && (
            <div className="album-picker__state album-picker__state--error">
              <p>{search.error}</p>
            </div>
          )}

          {!loading && isCurrentSearch && !search.error && results.length === 0 && (
            <div className="album-picker__state">
              <p>Tidak ada album yang cocok. Coba judul atau artis lain.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="album-picker__grid">
              {results.map((album) => {
                const alreadySelected =
                  album.id !== currentAlbumId && selectedIds.includes(album.id)

                return (
                  <button
                    type="button"
                    className="album-picker__result"
                    key={album.id}
                    disabled={alreadySelected}
                    onClick={() => onSelect(album)}
                  >
                    <span className="album-picker__thumb">
                      <CoverArt title={album.title} seed={album.id} image={album.image} />
                    </span>
                    <span className="album-picker__result-copy">
                      <strong>{album.title}</strong>
                      <span>{album.artist}</span>
                      <small>{alreadySelected ? 'Sudah dipilih' : 'Pilih album'}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
