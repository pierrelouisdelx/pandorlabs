import { ScraperStatus } from '@pandorlabs/types'

import { Badge } from '@/components/ui/badge'

const STATUS_VARIANT = {
  [ScraperStatus.COMPLETED]: 'success',
  [ScraperStatus.RUNNING]: 'running',
  [ScraperStatus.FAILED]: 'danger',
  [ScraperStatus.CANCELLED]: 'muted',
  [ScraperStatus.IDLE]: 'default',
} as const

export function StatusBadge({ status }: { status: ScraperStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'default'}>
      {status === ScraperStatus.RUNNING && (
        <span className="size-1.5 animate-pulse rounded-full bg-green-100" />
      )}
      {status}
    </Badge>
  )
}

const dateTime = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTime.format(date)
}

export function formatDuration(ms?: number): string {
  if (ms === undefined || ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`

  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return `${minutes}m ${seconds}s`
}

/**
 * Renders one cell of scraped data. The shape is whatever the scraper emitted,
 * so anything non-primitive is shown as JSON rather than "[object Object]".
 */
export function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}
