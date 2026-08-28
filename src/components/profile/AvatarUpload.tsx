import { useRef, useState } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { CameraIcon, UserIcon } from '../icons'
import './AvatarUpload.css'

const MAX_BYTES = 5 * 1024 * 1024
const TARGET_SIZE = 512

export default function AvatarUpload() {
  const { profile, setAvatar, clearAvatar } = useProfile()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(profile.avatar)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Berkas harus berupa gambar (JPG, PNG, WebP).')
      return
    }
    if (file.size > MAX_BYTES) {
      setError(
        `Ukuran gambar melebihi 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      )
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resizeImage(dataUrl, (resized) => {
        setPreview(resized)
        setAvatar(resized)
        setError('')
      })
    }
    reader.onerror = () => setError('Gambar tidak bisa dibaca.')
    reader.readAsDataURL(file)
  }

  function resizeImage(dataUrl: string, done: (dataUrl: string) => void) {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, TARGET_SIZE / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        done(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      done(canvas.toDataURL('image/webp', 0.85))
    }
    img.onerror = () => done(dataUrl)
    img.src = dataUrl
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="avatar">
      <div
        className={`avatar__frame${dragging ? ' is-drag' : ''}${preview ? ' has-img' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Unggah foto profil"
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <img src={preview} alt="Foto profil" className="avatar__img" />
        ) : (
          <span className="avatar__placeholder">
            <UserIcon size={40} />
          </span>
        )}
        <span className="avatar__badge">
          <CameraIcon size={14} />
        </span>
      </div>

      {error && <p className="avatar__error">{error}</p>}

      <div className="avatar__actions">
        <button
          type="button"
          className="avatar__btn"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? 'Ganti foto' : 'Unggah foto'}
        </button>
        {preview && (
          <button
            type="button"
            className="avatar__btn avatar__btn--danger"
            onClick={() => {
              setPreview(null)
              clearAvatar()
            }}
          >
            Hapus
          </button>
        )}
      </div>
      <p className="avatar__hint">Maks. 5 MB. Disimpan di browser ini.</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
    </div>
  )
}
