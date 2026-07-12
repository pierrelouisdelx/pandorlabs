import { ScraperStatus } from '@pandorlabs/types'
import { CheckCircle2, Database, Loader2, Waypoints } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listExecutions, listScrapers } from '@/lib/api'
import { requireUser } from '@/lib/session'

import ApiUnreachable from './_components/api-unreachable'
import AutoRefresh from './_components/auto-refresh'
import RunsTable from './_components/runs-table'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await requireUser()

  let scrapers
  let executions
  try {
    // 100 rows is enough to drive the counters and the recent-runs table while
    // staying a single round trip; the Runs tab is where the full history lives.
    ;[scrapers, executions] = await Promise.all([
      listScrapers({ limit: 100 }),
      listExecutions({ limit: 100, sortBy: 'createdAt', sortOrder: 'DESC' }),
    ])
  } catch (error) {
    return (
      <>
        <Header name={session.user.name} />
        <ApiUnreachable
          error={error instanceof Error ? error.message : undefined}
        />
      </>
    )
  }

  const runs = executions.data
  const running = runs.filter((run) => run.status === ScraperStatus.RUNNING)
  const completed = runs.filter((run) => run.status === ScraperStatus.COMPLETED)
  const itemsCollected = runs.reduce((sum, run) => sum + run.itemsScraped, 0)

  return (
    <>
      <AutoRefresh active={running.length > 0} />
      <Header name={session.user.name} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Scrapers"
          value={scrapers.pagination.total}
          icon={<Waypoints className="size-4" />}
        />
        <Stat
          label="Running now"
          value={running.length}
          icon={
            <Loader2
              className={running.length ? 'size-4 animate-spin' : 'size-4'}
            />
          }
          highlight={running.length > 0}
        />
        <Stat
          label="Completed runs"
          value={completed.length}
          icon={<CheckCircle2 className="size-4" />}
        />
        <Stat
          label="Items collected"
          value={itemsCollected}
          icon={<Database className="size-4" />}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent runs</CardTitle>
          <Button asChild variant="link" size="sm">
            <Link href="/dashboard/runs">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RunsTable
            executions={runs.slice(0, 5)}
            searchable={false}
            pageSize={5}
          />
        </CardContent>
      </Card>
    </>
  )
}

function Header({ name }: { name: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold">
        Welcome back, {name.split(' ')[0]}
      </h1>
      <p className="text-gray mt-1 text-sm">
        Your scrapers, their runs, and everything they collected.
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <Card className="p-5">
      <div className="text-gray mb-3 flex items-center gap-2 text-sm">
        <span className={highlight ? 'text-green-light' : undefined}>
          {icon}
        </span>
        {label}
      </div>
      <p className="text-3xl font-semibold">{value.toLocaleString()}</p>
    </Card>
  )
}
