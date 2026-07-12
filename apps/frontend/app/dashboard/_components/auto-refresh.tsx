'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Re-fetches the server components on an interval while something is in flight.
 *
 * The backend has no push channel and no job queue — a run's row only changes
 * when the scrape finishes — so polling is the only way the panel notices.
 * Mounted with `active={false}` when nothing is running, it does nothing.
 */
export default function AutoRefresh({
  active,
  intervalMs = 5000,
}: {
  active: boolean
  intervalMs?: number
}) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return

    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs, router])

  return null
}
