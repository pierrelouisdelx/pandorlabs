import { cn } from '@/lib/utils'
import { CheckCircle2, Database, Loader2, Waypoints } from 'lucide-react'

interface DashboardPreviewProps {
  className?: string
}

/**
 * Marketing preview of the real dashboard at /dashboard. The stat labels, run
 * columns, and statuses mirror what that page actually renders — if the real
 * dashboard changes shape, this should follow it.
 */
const stats = [
  { label: 'Scrapers', value: '12', icon: Waypoints },
  { label: 'Running now', value: '2', icon: Loader2, live: true },
  { label: 'Completed runs', value: '318', icon: CheckCircle2 },
  { label: 'Items collected', value: '1,284,940', icon: Database },
]

const runs = [
  {
    status: 'running' as const,
    scraper: 'idealista-listings',
    items: '4,182',
    duration: '1m 12s',
  },
  {
    status: 'completed' as const,
    scraper: 'amazon-price-watch',
    items: '38,410',
    duration: '2m 04s',
  },
  {
    status: 'completed' as const,
    scraper: 'linkedin-firmographics',
    items: '12,067',
    duration: '48.2s',
  },
  {
    status: 'failed' as const,
    scraper: 'binance-orderbook',
    items: '0',
    duration: '3.1s',
  },
]

const STATUS_STYLES = {
  running: 'border-green-light/30 bg-green-light/10 text-green-light',
  completed: 'border-white/10 bg-white/5 text-white',
  failed: 'border-red-500/30 bg-red-500/10 text-red-400',
}

const DashboardPreview = ({ className }: DashboardPreviewProps) => {
  return (
    <div
      className={cn(
        'bg-surface/80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <h3 className="ml-3 text-sm font-medium text-white">Dashboard</h3>
        </div>
        <span className="text-green-light bg-green-light/10 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <span className="bg-green-light h-1.5 w-1.5 animate-pulse rounded-full" />
          live
        </span>
      </div>

      {/* Stats — the same four the real dashboard shows */}
      <div className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/10 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, live }) => (
          <div key={label} className="bg-surface px-5 py-4">
            <div className="text-gray mb-2 flex items-center gap-2 text-[11px] font-medium whitespace-nowrap">
              <Icon
                className={cn('size-3.5 shrink-0', live && 'animate-spin')}
              />
              {label}
            </div>
            <div className="text-xl font-semibold text-white tabular-nums">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div className="px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Recent runs</h4>
          <span className="text-gray text-xs">View all →</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray border-b border-white/10 bg-white/5">
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Scraper</th>
                <th className="px-4 py-2.5 text-right font-medium">Items</th>
                <th className="px-4 py-2.5 text-right font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.scraper}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                        STATUS_STYLES[run.status],
                      )}
                    >
                      {run.status === 'running' && (
                        <span className="bg-green-light size-1.5 animate-pulse rounded-full" />
                      )}
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {run.scraper}
                  </td>
                  <td className="text-gray px-4 py-3 text-right tabular-nums">
                    {run.items}
                  </td>
                  <td className="text-gray px-4 py-3 text-right tabular-nums">
                    {run.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview
