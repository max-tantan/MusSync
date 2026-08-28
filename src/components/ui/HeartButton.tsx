import { HeartIcon } from '../icons'
import './HeartButton.css'

interface HeartButtonProps {
  isFavorite: boolean
  onToggle: (e: React.MouseEvent) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function HeartButton({
  isFavorite,
  onToggle,
  size = 'md',
  label,
}: HeartButtonProps) {
  return (
    <button
      type="button"
      className={`heart${isFavorite ? ' is-on' : ''} heart--${size}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(e)
      }}
      aria-pressed={isFavorite}
      aria-label={label ?? (isFavorite ? 'Batalkan favorit' : 'Tandai favorit')}
      title={label ?? (isFavorite ? 'Batalkan favorit' : 'Tandai favorit')}
    >
      <HeartIcon filled={isFavorite} size={size === 'sm' ? 18 : size === 'lg' ? 26 : 20} />
    </button>
  )
}
