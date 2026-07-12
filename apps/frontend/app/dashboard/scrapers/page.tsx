import { listScrapers } from '@/lib/api'
import { requireUser } from '@/lib/session'

import ApiUnreachable from '../_components/api-unreachable'
import ScrapersView from './scrapers-view'

export const dynamic = 'force-dynamic'

export default async function ScrapersPage({
  searchParams,
}: {
  searchParams: Promise<{ launch?: string }>
}) {
  await requireUser()
  const { launch } = await searchParams

  let scrapers
  try {
    scrapers = await listScrapers({ limit: 100 })
  } catch (error) {
    return (
      <>
        <h1 className="mb-8 text-2xl font-semibold">Scrapers</h1>
        <ApiUnreachable
          error={error instanceof Error ? error.message : undefined}
        />
      </>
    )
  }

  return (
    <ScrapersView scrapers={scrapers.data} autoOpenLaunch={launch === '1'} />
  )
}
