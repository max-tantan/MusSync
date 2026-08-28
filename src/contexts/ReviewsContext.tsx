/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Review } from '../types'
import { loadUser } from '../utils/user'

const STORAGE_KEY = 'mussync.reviews.v2'

type Extras = Record<string, Review[]>

interface ReviewsContextValue {
  extras: Extras
  reviewsFor: (musicId: string) => Review[]
  myReview: (musicId: string) => Review | null
  hasUserReview: (musicId: string) => boolean
  reviewCount: number
  addReview: (
    musicId: string,
    review: Omit<Review, 'id' | 'date'>,
  ) => void
  updateReview: (
    musicId: string,
    reviewId: string,
    patch: Partial<Omit<Review, 'id' | 'date'>>,
  ) => void
  removeReview: (musicId: string, reviewId: string) => void
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null)

function loadExtras(): Extras {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Extras) : {}
  } catch {
    return {}
  }
}

function persistExtras(next: Extras) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // penyimpanan penuh / tidak tersedia — lewati
  }
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [extras, setExtras] = useState<Extras>(loadExtras)

  const addReview = useCallback(
    (musicId: string, review: Omit<Review, 'id' | 'date'>) => {
      const full: Review = {
        ...review,
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
      }
      setExtras((prev) => {
        const next = { ...prev, [musicId]: [full, ...(prev[musicId] ?? [])] }
        persistExtras(next)
        return next
      })
    },
    [],
  )

  const updateReview = useCallback(
    (musicId: string, reviewId: string, patch: Partial<Omit<Review, 'id' | 'date'>>) => {
      setExtras((prev) => {
        const list = prev[musicId] ?? []
        const next = {
          ...prev,
          [musicId]: list.map((r) => (r.id === reviewId ? { ...r, ...patch } : r)),
        }
        persistExtras(next)
        return next
      })
    },
    [],
  )

  const removeReview = useCallback(
    (musicId: string, reviewId: string) => {
      setExtras((prev) => {
        const next = { ...prev }
        const list = (prev[musicId] ?? []).filter((r) => r.id !== reviewId)
        if (list.length > 0) next[musicId] = list
        else delete next[musicId]
        persistExtras(next)
        return next
      })
    },
    [],
  )

  const reviewsFor = useCallback(
    (musicId: string) => extras[musicId] ?? [],
    [extras],
  )

  const hasUserReview = useCallback(
    (musicId: string) => {
      const user = loadUser()
      return (extras[musicId] ?? []).some((r) => r.author === user)
    },
    [extras],
  )

  const myReview = useCallback(
    (musicId: string) => {
      const user = loadUser()
      return (extras[musicId] ?? []).find((r) => r.author === user) ?? null
    },
    [extras],
  )

  const reviewCount = Object.values(extras).reduce(
    (acc, list) => acc + list.length,
    0,
  )

  return (
    <ReviewsContext.Provider
      value={{
        extras,
        reviewsFor,
        myReview,
        hasUserReview,
        reviewCount,
        addReview,
        updateReview,
        removeReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('useReviews harus dipakai di dalam ReviewsProvider')
  return ctx
}