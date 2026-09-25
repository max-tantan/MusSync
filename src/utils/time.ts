const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const RELATIVE = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })

export function formatRelative(iso: string, now = Date.now()): string {
  const time = new Date(iso).getTime()
  if (!iso || Number.isNaN(time)) return ''

  const diff = time - now
  const abs = Math.abs(diff)
  if (abs < MINUTE) return 'baru saja'
  if (abs < HOUR) return RELATIVE.format(Math.round(diff / MINUTE), 'minute')
  if (abs < DAY) return RELATIVE.format(Math.round(diff / HOUR), 'hour')
  if (abs < 7 * DAY) return RELATIVE.format(Math.round(diff / DAY), 'day')

  return new Date(time).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
