'use client'

import type { PaginatedResponse } from '@pandorlabs/types'
import type { ColumnDef } from '@tanstack/react-table'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useTransition } from 'react'

import { DataTable } from '@/components/ui/data-table'

import { formatCell } from '../../_components/format'

type Row = Record<string, unknown>

/** Mongo bookkeeping — not something the user asked to scrape. */
const HIDDEN_KEYS = new Set(['_id', '__v', 'updated_at'])

type Props = {
  rows: Row[]
  pagination: PaginatedResponse<Row>['pagination']
}

/**
 * Scraped rows have no fixed shape — each scraper emits its own fields — so the
 * columns are derived from the keys actually present in the page of rows.
 */
export default function DataView({ rows, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const columns = useMemo<ColumnDef<Row, unknown>[]>(() => {
    const keys: string[] = []
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!HIDDEN_KEYS.has(key) && !keys.includes(key)) {
          keys.push(key)
        }
      }
    }

    return keys.map((key) => ({
      id: key,
      accessorFn: (row) => row[key],
      header: key.replace(/_/g, ' '),
      cell: ({ getValue }) => {
        const text = formatCell(getValue())
        return (
          <span className="block max-w-xs truncate" title={text}>
            {text}
          </span>
        )
      },
    }))
  }, [rows])

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="This run didn't collect any rows."
      serverPagination={{
        ...pagination,
        pending,
        // The page lives in the URL so a run's page 3 stays linkable, and the
        // server component re-fetches instead of shipping every row up front.
        onPageChange: (page) =>
          startTransition(() => {
            router.push(`${pathname}?page=${page}`, { scroll: false })
          }),
      }}
    />
  )
}
