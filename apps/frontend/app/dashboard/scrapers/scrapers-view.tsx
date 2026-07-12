'use client'

import type { Scraper } from '@pandorlabs/types'
import type { ColumnDef } from '@tanstack/react-table'
import { Loader2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { launchScrape } from '@/app/actions/scrapers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'

import { formatDate } from '../_components/format'
import LaunchDialog from './launch-dialog'

type Props = {
  scrapers: Scraper[]
  /** The sidebar's "New scrape" link lands here with ?launch=1. */
  autoOpenLaunch?: boolean
}

export default function ScrapersView({ scrapers, autoOpenLaunch }: Props) {
  const router = useRouter()
  const [launchOpen, setLaunchOpen] = useState(autoOpenLaunch ?? false)
  const [runningId, setRunningId] = useState<string | null>(null)

  async function runNow(scraper: Scraper) {
    setRunningId(scraper.id)
    const result = await launchScrape(scraper.id)
    setRunningId(null)

    if (!result.success) {
      toast.error(result.message)
      return
    }
    toast.success(result.message)
    if (result.executionId) {
      router.push(`/dashboard/runs/${result.executionId}`)
    }
  }

  const columns = useMemo<ColumnDef<Scraper, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Scraper',
        accessorFn: (scraper) => scraper.metadata?.name ?? scraper.scraperId,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium">
              {row.original.metadata?.name ?? row.original.scraperId}
            </p>
            {row.original.url && (
              <p className="text-gray max-w-xs truncate text-xs">
                {row.original.url}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge>{row.original.category.replace(/_/g, ' ')}</Badge>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'State',
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">active</Badge>
          ) : (
            <Badge variant="muted">inactive</Badge>
          ),
      },
      {
        accessorKey: 'executionCount',
        header: 'Runs',
        cell: ({ row }) => row.original.executionCount.toLocaleString(),
      },
      {
        accessorKey: 'lastExecutedAt',
        header: 'Last run',
        cell: ({ row }) => (
          <span className="text-gray whitespace-nowrap">
            {formatDate(row.original.lastExecutedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const scraper = row.original
          const pending = runningId === scraper.id

          return (
            <Button
              size="sm"
              variant="secondary"
              // Any run blocks the others: the backend executes inline, so a
              // second request would just queue behind this one.
              disabled={!scraper.isActive || runningId !== null}
              onClick={() => runNow(scraper)}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Run
                </>
              )}
            </Button>
          )
        },
      },
    ],
    // `runNow` is stable enough for this table; the identity that matters is
    // which row is currently running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runningId],
  )

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Scrapers</h1>
          <p className="text-gray mt-1 text-sm">
            Every scraper available to you, and what it last did.
          </p>
        </div>
        <Button onClick={() => setLaunchOpen(true)}>
          <Play className="size-4" />
          New scrape
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={scrapers}
        searchPlaceholder="Search scrapers…"
        emptyMessage="No scrapers configured yet."
      />

      <LaunchDialog
        scrapers={scrapers}
        open={launchOpen}
        onOpenChange={setLaunchOpen}
      />
    </>
  )
}
