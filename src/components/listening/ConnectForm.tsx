import { useState } from 'react'
import type { FormEvent } from 'react'
import './ConnectForm.css'

interface ConnectFormProps {
  initial?: string
  submitLabel?: string
  onConnect: (username: string) => void
}

export default function ConnectForm({
  initial = '',
  submitLabel = 'Hubungkan',
  onConnect,
}: ConnectFormProps) {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const username = value.trim()
    if (!username) {
      setError('Isi username Last.fm dulu.')
      return
    }
    if (/\s/.test(username)) {
      setError('Username Last.fm tidak boleh mengandung spasi.')
      return
    }
    setError('')
    onConnect(username)
  }

  return (
    <form className="connect" onSubmit={handleSubmit} noValidate>
      <label className="connect__field">
        <span className="connect__label">Username Last.fm</span>
        <input
          className="connect__input"
          value={value}
          placeholder="misal: musikpedia"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button type="submit" className="connect__btn">
        {submitLabel}
      </button>
      {error && <p className="connect__error">{error}</p>}
      <p className="connect__hint">
        Cukup username, tanpa password. Data hanya dibaca dari Last.fm dan disimpan di
        browser ini.
      </p>
    </form>
  )
}
