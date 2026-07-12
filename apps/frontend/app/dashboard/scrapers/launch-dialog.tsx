'use client'

import type { Scraper } from '@pandorlabs/types'
import { Loader2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { launchScrape } from '@/app/actions/scrapers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Props = {
  scrapers: Scraper[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Preselected when the dialog is opened from a row's Run button. */
  initialScraperId?: string
}

export default function LaunchDialog({
  scrapers,
  open,
  onOpenChange,
  initialScraperId,
}: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(initialScraperId ?? '')
  const [overrides, setOverrides] = useState('')
  const [pending, setPending] = useState(false)

  const runnable = scrapers.filter((scraper) => scraper.isActive)
  const selected = runnable.find((scraper) => scraper.id === selectedId)

  async function onLaunch() {
    if (!selected) {
      toast.error('Pick a scraper to run.')
      return
    }

    // Options are free-form JSON on the backend, so the only thing we can check
    // here is that it parses — a bad payload should not reach the API.
    let parsed: Record<string, unknown> | undefined
    if (overrides.trim()) {
      try {
        parsed = JSON.parse(overrides) as Record<string, unknown>
      } catch {
        toast.error('Override options must be valid JSON.')
        return
      }
    }

    setPending(true)
    // The backend runs the scrape inline, so this resolves only once the scrape
    // is done — which is why the dialog stays open with a spinner.
    const result = await launchScrape(selected.id, parsed)
    setPending(false)

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    onOpenChange(false)
    setOverrides('')

    if (result.executionId) {
      router.push(`/dashboard/runs/${result.executionId}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Launch a scrape</DialogTitle>
          <DialogDescription>
            Runs one of your scrapers now. The run and everything it collects
            show up under Runs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Scraper</p>

            {runnable.length === 0 ? (
              <p className="text-gray text-sm">
                No active scrapers available to run.
              </p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {runnable.map((scraper) => (
                  <button
                    key={scraper.id}
                    type="button"
                    disabled={pending}
                    onClick={() => setSelectedId(scraper.id)}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-3 text-left transition-colors disabled:opacity-50',
                      scraper.id === selectedId
                        ? 'border-green-light/50 bg-green-light/10'
                        : 'border-gray/20 bg-white/5 hover:bg-white/10',
                    )}
                  >
                    <p className="text-sm font-medium">
                      {scraper.metadata?.name ?? scraper.scraperId}
                    </p>
                    <p className="text-gray mt-0.5 truncate text-xs">
                      {scraper.url ?? scraper.category}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="overrides" className="text-sm font-medium">
              Override options{' '}
              <span className="text-gray font-normal">(optional JSON)</span>
            </label>
            <Textarea
              id="overrides"
              rows={3}
              value={overrides}
              disabled={pending}
              onChange={(event) => setOverrides(event.target.value)}
              placeholder={'{ "maxPages": 2 }'}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onLaunch} disabled={pending || !selected}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Scraping…
              </>
            ) : (
              <>
                <Play className="size-4" />
                Launch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
