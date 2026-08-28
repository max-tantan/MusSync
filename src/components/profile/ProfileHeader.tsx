import { useProfile } from '../../contexts/ProfileContext'
import AvatarUpload from './AvatarUpload'
import './ProfileHeader.css'

export default function ProfileHeader({
  joined,
}: {
  joined: string
}) {
  const { profile, setUsername } = useProfile()

  return (
    <div className="profile-head">
      <AvatarUpload />
      <div className="profile-head__info">
        <input
          className="profile-head__name"
          value={profile.username}
          placeholder="Nama kamu"
          maxLength={40}
          aria-label="Nama pengguna"
          onChange={(e) => setUsername(e.target.value)}
        />
        {joined ? (
          <p className="profile-head__joined">Reviewer sejak {joined}</p>
        ) : (
          <p className="profile-head__joined">Belum menilai album apa pun</p>
        )}
        <p className="profile-head__tag">pustaka musik personal · lokal</p>
      </div>
    </div>
  )
}
