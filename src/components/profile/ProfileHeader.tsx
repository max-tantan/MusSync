import { useProfile } from '../../contexts/ProfileContext'
import AvatarUpload from './AvatarUpload'
import './ProfileHeader.css'

export default function ProfileHeader({ joined }: { joined: string }) {
  const { profile, setUsername } = useProfile()

  return (
    <div className="profile-head">
      <AvatarUpload />

      <div className="profile-head__info">
        <p className="profile-head__eyebrow">papan skor · profil pribadi</p>
        <input
          className="profile-head__name"
          value={profile.username}
          placeholder="Nama kamu"
          maxLength={40}
          aria-label="Nama pengguna"
          onChange={(e) => setUsername(e.target.value)}
        />
        <p className="profile-head__hint">
          {profile.username ? 'klik nama untuk mengubah' : 'ketik namamu untuk mulai'}
        </p>
        <div className="profile-head__meta">
          {joined ? (
            <span className="profile-head__join">reviewer sejak {joined}</span>
          ) : (
            <span className="profile-head__join">belum menilai album apa pun</span>
          )}
          <span className="profile-head__tag">pustaka musik personal · lokal</span>
        </div>
      </div>
    </div>
  )
}
