import type { Library, LibraryEntry, Review } from '../types'

export interface TopArtist {
  name: string
  count: number
}

export interface GenreStat {
  name: string
  count: number
}

export interface StarDistribution {
  stars: number
  count: number
  percent: number
}

export interface YearStat {
  year: string
  count: number
  max: number
}

export interface Milestone {
  id: string
  label: string
  description: string
  achieved: boolean
  value: number
}

export function getTopArtists(library: Library, limit = 8): TopArtist[] {
  const counts = new Map<string, number>()
  for (const e of Object.values(library)) {
    if (e.status !== 'rated') continue
    const name = e.item.artist
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getTopGenres(library: Library, limit = 8): GenreStat[] {
  const counts = new Map<string, number>()
  for (const e of Object.values(library)) {
    if (e.status !== 'rated') continue
    for (const tag of e.item.tags ?? []) {
      const key = tag.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getRatingDistribution(reviews: Review[]): StarDistribution[] {
  const totals = new Array(5).fill(0)
  for (const r of reviews) {
    const idx = Math.max(1, Math.min(5, Math.round(r.rating))) - 1
    totals[idx] += 1
  }
  const total = reviews.length || 1
  return totals
    .map((count, i) => ({
      stars: i + 1,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .reverse()
}

export function getListeningTimeline(library: Library): YearStat[] {
  const byYear = new Map<string, number>()
  for (const e of Object.values(library)) {
    if (e.status !== 'rated') continue
    const year = (e.createdAt || '').slice(0, 4)
    if (!year) continue
    byYear.set(year, (byYear.get(year) ?? 0) + 1)
  }
  const stats = [...byYear.entries()]
    .map(([year, count]) => ({ year, count, max: 0 }))
    .sort((a, b) => a.year.localeCompare(b.year))
  const max = stats.reduce((m, s) => Math.max(m, s.count), 1)
  return stats.map((s) => ({ ...s, max }))
}

export function getFavoriteAlbums(favorites: Record<string, LibraryEntry>) {
  return Object.values(favorites).map((e) => e.item)
}

export function getMilestones(
  ratedCount: number,
  reviewCount: number,
  yearsActive: number,
): Milestone[] {
  return [
    {
      id: 'rate-10',
      label: '10 album dinilai',
      description: 'Mulai membangun koleksi ratingmu.',
      achieved: ratedCount >= 10,
      value: ratedCount,
    },
    {
      id: 'rate-50',
      label: '50 album dinilai',
      description: 'Penikmat musik yang konsisten.',
      achieved: ratedCount >= 50,
      value: ratedCount,
    },
    {
      id: 'rate-100',
      label: '100+ album dinilai',
      description: 'Koleksi rating yang mengesankan.',
      achieved: ratedCount >= 100,
      value: ratedCount,
    },
    {
      id: 'review-5',
      label: '5 ulasan pertama',
      description: 'Berani menulis opini.',
      achieved: reviewCount >= 5,
      value: reviewCount,
    },
    {
      id: 'year-active',
      label: 'Aktif bertahun-tahun',
      description: 'Setia merawat pustakamu.',
      achieved: yearsActive >= 2,
      value: yearsActive,
    },
  ]
}

export function getYearsActive(library: Library): number {
  const years = new Set<string>()
  for (const e of Object.values(library)) {
    const year = (e.createdAt || '').slice(0, 4)
    if (year) years.add(year)
  }
  return years.size
}

export function formatJoined(createdAt: string): string {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}
