import type { Review } from '../types'

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.length
}

export function distribution(reviews: Review[]): Record<number, number> {
  const out: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) {
    const key = Math.min(5, Math.max(1, Math.round(r.rating)))
    out[key] += 1
  }
  return out
}

export function formatScore(value: number): string {
  return value ? value.toFixed(1).replace('.', ',') : '—'
}