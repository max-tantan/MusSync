import { useState } from 'react'
import type { FormEvent } from 'react'
import { useReviews } from '../context/ReviewsContext'
import { loadUser, USER_KEY } from '../lib/user'
import type { Review, ReviewSub } from '../types'
import RatingStars from './RatingStars'
import './ReviewForm.css'

const MEDIUM_OPTIONS = ['Digital', 'Vinyl', 'CD', 'Kaset'] as const

interface ReviewFormProps {
  musicId: string
  initial?: Review
  onReviewAdded?: () => void
  onSaved?: () => void
  onCancel?: () => void
}

export default function ReviewForm({
  musicId,
  initial,
  onReviewAdded,
  onSaved,
  onCancel,
}: ReviewFormProps) {
  const { addReview, updateReview, hasUserReview } = useReviews()
  const editing = Boolean(initial)

  const [name, setName] = useState(loadUser)
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [text, setText] = useState(initial?.text ?? '')
  const [sub, setSub] = useState<ReviewSub>(
    initial?.sub ?? { production: 0, lyrics: 0, artwork: 0 },
  )
  const [medium, setMedium] = useState(initial?.medium ?? '')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(false)

  if (!editing && hasUserReview(musicId)) {
    return (
      <div className="form__closed">
        <p className="form__closed-title">Kamu sudah merating album ini.</p>
        <p className="form__closed-sub">
          Satu orang satu suara. Pilih "ubah" jika ingin mengoreksi.
        </p>
      </div>
    )
  }

  const errors = {
    name: editing ? false : !name.trim(),
    rating: rating === 0,
    text: text.trim().length < 5,
  }
  const invalid = errors.name || errors.rating || errors.text

  const subSet = sub.production > 0 || sub.lyrics > 0 || sub.artwork > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (invalid) return

    const payload = {
      author: editing && initial ? initial.author : name.trim(),
      rating,
      text: text.trim(),
      sub: subSet ? sub : undefined,
      medium: medium || undefined,
    }

    if (editing && initial) {
      updateReview(musicId, initial.id, payload)
      onSaved?.()
    } else {
      addReview(musicId, payload)
      try {
        localStorage.setItem(USER_KEY, name.trim())
      } catch {
        // penyimpanan penuh — lewati
      }
      setRating(0)
      setText('')
      setSub({ production: 0, lyrics: 0, artwork: 0 })
      setMedium('')
      setTouched(false)
      setDone(true)
      onReviewAdded?.()
    }
  }

  if (done) {
    return (
      <div className="form__closed form__closed--ok">
        <p className="form__closed-title">Review terkirim.</p>
        <p className="form__closed-sub">
          Skor jadi ikut terpengaruh sekarang. Album ikut masuk ke
          perpustakaanmu.
        </p>
      </div>
    )
  }

  function setSubRow(key: keyof ReviewSub, value: number) {
    setSub((s) => ({ ...s, [key]: value }))
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {!editing && (
        <div className="form__field">
          <label htmlFor="rev-name">Nama</label>
          <input
            id="rev-name"
            className="form__input"
            value={name}
            placeholder="Nama yang ditampilkan"
            onChange={(e) => setName(e.target.value)}
          />
          {touched && errors.name && (
            <span className="form__error">Nama jangan dibiarkan kosong.</span>
          )}
        </div>
      )}

      <div className="form__field">
        <label>Rating</label>
        <RatingStars rating={rating} onChange={setRating} size="lg" />
        {touched && errors.rating && (
          <span className="form__error">Pilih dulu 1–5 bintang.</span>
        )}
      </div>

      <fieldset className="form__field form__sub">
        <legend>Sub-rating (opsional)</legend>
        {(
          [
            ['production', 'Produksi'],
            ['lyrics', 'Lirik'],
            ['artwork', 'Artwork'],
          ] as const
        ).map(([key, label]) => (
          <div className="form__sub-row" key={key}>
            <span className="form__sub-label">{label}</span>
            <RatingStars
              rating={sub[key]}
              size="sm"
              onChange={(v) => setSubRow(key, v)}
            />
          </div>
        ))}
      </fieldset>

      <div className="form__field">
        <label htmlFor="rev-medium">Medium (opsional)</label>
        <select
          id="rev-medium"
          className="form__input"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
        >
          <option value="">— umum —</option>
          {MEDIUM_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="form__field">
        <label htmlFor="rev-text">Ulasan</label>
        <textarea
          id="rev-text"
          className="form__input form__input--area"
          rows={4}
          value={text}
          placeholder="Apa yang bikin kamu kasih skor segitu?"
          onChange={(e) => setText(e.target.value)}
        />
        {touched && errors.text && (
          <span className="form__error">
            Tulis minimal 5 karakter — biar review-nya berbunyi.
          </span>
        )}
      </div>

      <div className="form__actions">
        <button
          type="submit"
          className="form__submit"
          disabled={touched && invalid}
        >
          {editing ? 'Simpan perubahan' : 'Kirim review'}
        </button>
        {editing && (
          <button type="button" className="form__cancel" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  )
}