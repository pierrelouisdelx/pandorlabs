'use client'

import type { ScraperExecution } from '@pandorlabs/types'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { DataTable } from '@/components/ui/data-table'

import { formatDate, formatDuration, StatusBadge } from './format'

type Props = {
  executions: ScraperExecution[]
  searchable?: boolean
  pageSize?: number
}

export default function RunsTable({
  executions,
  searchable = true,
  pageSize = 10,
}: Props) {
  const router = useRouter()

  const columns = useMemo<ColumnDef<ScraperExecution, unknown>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'scraperId',
        header: 'Scraper',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.scraperId}</span>
        ),
      },
      {
        accessorKey: 'itemsScraped',
        header: 'Items',
        cell: ({ row }) => row.original.itemsScraped.toLocaleString(),
      },
      {
        accessorKey: 'durationMs',
        header: 'Duration',
        cell: ({ row }) => (
          <span className="text-gray">
            {formatDuration(row.original.durationMs)}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Started',
        cell: ({ row }) => (
          <span className="text-gray whitespace-nowrap">
            {formatDate(row.original.startedAt ?? row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'error',
        header: 'Detail',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.error ? (
            <span
              className="block max-w-xs truncate text-red-400"
              title={row.original.error.message}
            >
              {row.original.error.message}
            </span>
          ) : (
            <ArrowRight className="text-gray size-4" />
          ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={executions}
      pageSize={pageSize}
      searchPlaceholder={searchable ? 'Search runs…' : undefined}
      emptyMessage="No runs yet. Launch a scrape to see it here."
      onRowClick={(run) => router.push(`/dashboard/runs/${run.id}`)}
    />
  )
}
