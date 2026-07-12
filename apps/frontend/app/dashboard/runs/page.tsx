import { ScraperStatus } from '@pandorlabs/types'

import { listExecutions } from '@/lib/api'
import { requireUser } from '@/lib/session'

import ApiUnreachable from '../_components/api-unreachable'
import AutoRefresh from '../_components/auto-refresh'
import RunsTable from '../_components/runs-table'

export const dynamic = 'force-dynamic'

export default async function RunsPage() {
  await requireUser()

  let executions
  try {
    executions = await listExecutions({
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
  } catch (error) {
    return (
      <>
        <Header />
        <ApiUnreachable
          error={error instanceof Error ? error.message : undefined}
        />
      </>
    )
  }

  const hasRunning = executions.data.some(
    (run) => run.status === ScraperStatus.RUNNING,
  )

  return (
    <>
      <AutoRefresh active={hasRunning} />
      <Header />
      <RunsTable executions={executions.data} pageSize={15} />
    </>
  )
}

function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold">Runs</h1>
      <p className="text-gray mt-1 text-sm">
        Every scrape, running or finished. Open one to see what it collected.
      </p>
    </div>
  )
}
