import { PlugZap } from 'lucide-react'

import { Card } from '@/components/ui/card'

/**
 * The scraper API is a separate service. If it is down the panel should say so
 * plainly rather than render a 500 — the session and the account tab still work.
 */
export default function ApiUnreachable({ error }: { error?: string }) {
  return (
    <Card className="px-6 py-16 text-center">
      <PlugZap className="text-gray mx-auto mb-4 size-8" />
      <p className="mb-1 font-medium">Can&apos;t reach the scraper service</p>
      <p className="text-gray mx-auto max-w-md text-sm">
        {error ?? 'The API did not respond.'} Start the backend with{' '}
        <code className="text-white/80">pnpm dev</code> and reload.
      </p>
    </Card>
  )
}
