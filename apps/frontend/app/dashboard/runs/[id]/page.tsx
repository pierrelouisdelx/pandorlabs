import { ScraperStatus } from '@pandorlabs/types'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError, getExecution, getExecutionData } from '@/lib/api'
import { requireUser } from '@/lib/session'

import ApiUnreachable from '../../_components/api-unreachable'
import AutoRefresh from '../../_components/auto-refresh'
import {
  formatDate,
  formatDuration,
  StatusBadge,
} from '../../_components/format'
import DataView from './data-view'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

export default async function RunPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  await requireUser()

  const { id } = await params
  const { page } = await searchParams
  const pageNumber = Math.max(1, Number(page) || 1)

  let execution
  let data
  try {
    execution = await getExecution(id)
    // A failed run has no rows and the data endpoint 404s on a missing
    // collection — that is not a reason to fail the whole page.
    data = await getExecutionData(id, {
      page: pageNumber,
      limit: PAGE_SIZE,
    }).catch(() => null)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    return (
      <>
        <BackLink />
        <ApiUnreachable
          error={error instanceof Error ? error.message : undefined}
        />
      </>
    )
  }

  const running = execution.status === ScraperStatus.RUNNING

  return (
    <>
      <AutoRefresh active={running} />
      <BackLink />

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-semibold">{execution.scraperId}</h1>
        <StatusBadge status={execution.status} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Fact
          label="Items collected"
          value={execution.itemsScraped.toLocaleString()}
        />
        <Fact label="Duration" value={formatDuration(execution.durationMs)} />
        <Fact
          label="Started"
          value={formatDate(execution.startedAt ?? execution.createdAt)}
        />
        <Fact label="Finished" value={formatDate(execution.completedAt)} />
      </div>

      {execution.error && (
        <Card className="mb-8 border-red-500/30 bg-red-500/5">
          <CardHeader className="flex-row items-center gap-2 pb-3">
            <AlertTriangle className="size-4 text-red-400" />
            <CardTitle className="text-base text-red-400">
              This run failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm break-words text-white/80">
              {execution.error.message}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Collected data</CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <DataView rows={data.data} pagination={data.pagination} />
          ) : (
            <p className="text-gray py-8 text-center text-sm">
              {running
                ? 'The scrape is still running — rows appear as they land.'
                : 'No data was stored for this run.'}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function BackLink() {
  return (
    <Button asChild variant="link" size="sm" className="mb-4 -ml-2 px-2">
      <Link href="/dashboard/runs">
        <ArrowLeft className="size-4" />
        All runs
      </Link>
    </Button>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-gray mb-2 text-sm">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </Card>
  )
}
