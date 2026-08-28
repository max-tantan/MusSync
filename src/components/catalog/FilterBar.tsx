import { Link } from 'react-router-dom'
import { GENRE_META } from '../data/genres'
import './FilterBar.css'

export type SortKey = 'default' | 'az' | 'listeners'

interface FilterBarProps {
  query: string
  onQuery: (q: string) => void
  sort: SortKey
  onSort: (s: SortKey) => void
}

export default function FilterBar({ query, onQuery, sort, onSort }: FilterBarProps) {
  return (
    <div className="filter">
      <div className="filter__row">
        <label className="filter__search">
          <span className="filter__search-ico" aria-hidden="true">
            ⌕
          </span>
          <input
            value={query}
            placeholder="Cari album di Last.fm…"
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <label className="filter__sort">
          <span className="filter__sort-label">Urut</span>
          <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            <option value="default">Urutan Last.fm</option>
            <option value="listeners">Paling banyak didengar</option>
            <option value="az">A–Z</option>
          </select>
        </label>
      </div>

      <div className="filter__chips" role="list" aria-label="Filter genre">
        <Link to="/genre" className="chip">
          Semua genre
        </Link>
        {GENRE_META.map((g) => (
          <Link key={g.label} to={`/genre/${encodeURIComponent(g.tag)}`} className="chip">
            {g.label}
          </Link>
        ))}
      </div>
    </div>
  )
}