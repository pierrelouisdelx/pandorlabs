'use client'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

/**
 * Pagination handled by the backend. Supply this when the row set is too large
 * to ship to the browser in one go (scraped data); leave it off and the table
 * paginates the rows it already has (scrapers, runs).
 */
export type ServerPagination = {
  page: number
  totalPages: number
  total: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
  /** True while the next page is being fetched, to disable the pager. */
  pending?: boolean
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  /** Omit to hide the search box. */
  searchPlaceholder?: string
  emptyMessage?: string
  /** Rows per page when paginating client-side. */
  pageSize?: number
  serverPagination?: ServerPagination
  onRowClick?: (row: TData) => void
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder,
  emptyMessage = 'Nothing here yet.',
  pageSize = 10,
  serverPagination,
  onRowClick,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // With server pagination the backend already sliced the rows — paginating
    // them again client-side would hide most of the page.
    ...(serverPagination
      ? { manualPagination: true }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }),
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-4">
      {searchPlaceholder && (
        <div className="max-w-sm">
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            iconLeft={<Search className="size-5" />}
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      <div className="border-gray/20 overflow-hidden rounded-2xl border bg-white/5 backdrop-blur-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="hover:text-green-light inline-flex items-center gap-1.5 uppercase transition-colors"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === 'asc' ? (
                            <ChevronUp className="size-3.5" />
                          ) : sorted === 'desc' ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="text-gray h-32 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {serverPagination ? (
        <ServerPager {...serverPagination} />
      ) : (
        <ClientPager table={table} />
      )}
    </div>
  )
}

function ServerPager({
  page,
  totalPages,
  total,
  hasNext,
  hasPrev,
  onPageChange,
  pending,
}: ServerPagination) {
  if (total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-gray text-sm">
        Page {page} of {Math.max(totalPages, 1)} · {total.toLocaleString()} row
        {total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrev || pending}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNext || pending}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function ClientPager<TData>({
  table,
}: {
  table: ReturnType<typeof useReactTable<TData>>
}) {
  const { pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()
  const rowCount = table.getFilteredRowModel().rows.length

  if (rowCount === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-gray text-sm">
        Page {pageIndex + 1} of {Math.max(pageCount, 1)} ·{' '}
        {rowCount.toLocaleString()} row{rowCount === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
