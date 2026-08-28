/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import {
  loadProfile,
  saveProfile,
  type ProfileData,
} from '../utils/user'

interface ProfileContextValue {
  profile: ProfileData
  setUsername: (name: string) => void
  setAvatar: (dataUrl: string | null) => void
  clearAvatar: () => void
  resetProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(loadProfile)

  const update = useCallback((patch: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      saveProfile(next)
      return next
    })
  }, [])

  const setUsername = useCallback(
    (name: string) => update({ username: name }),
    [update],
  )

  const setAvatar = useCallback(
    (dataUrl: string | null) => update({ avatar: dataUrl }),
    [update],
  )

  const clearAvatar = useCallback(() => update({ avatar: null }), [update])

  const resetProfile = useCallback(
    () =>
      setProfile((prev) => {
        const next: ProfileData = {
          username: '',
          avatar: null,
          createdAt: prev.createdAt,
        }
        saveProfile(next)
        return next
      }),
    [],
  )

  return (
    <ProfileContext.Provider
      value={{ profile, setUsername, setAvatar, clearAvatar, resetProfile }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile harus dipakai di dalam ProfileProvider')
  return ctx
}
