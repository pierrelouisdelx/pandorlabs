/**
 * Categories of scrapers supported by the factory.
 *
 * Shared: the backend keys its orchestrators off these, the frontend routes
 * `/products/<category>` off them.
 */
export enum ScraperCategory {
  REAL_ESTATE = 'real_estate',
  LEAD_GENERATION = 'lead_generation',
  SHOPPING = 'shopping',
  CRYPTO = 'crypto',
  AI_DATASETS = 'ai_datasets',
  SOCIAL_MEDIA = 'social_media',
}

/** Status states for scraper executions. */
export enum ScraperStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * A scraper configuration as it arrives over the wire.
 *
 * Dates are ISO-8601 strings, not `Date` — this is the shape after JSON
 * serialization, which is what a client actually receives.
 */
export interface Scraper {
  id: string
  scraperId: string
  category: ScraperCategory
  url?: string
  options: Record<string, unknown>
  metadata: {
    name?: string
    description?: string
    createdBy?: string
    tags?: string[]
  }
  isActive: boolean
  lastExecutedAt?: string
  executionCount: number
  createdAt: string
  updatedAt: string
}

/** A single run of a scraper, as it arrives over the wire. */
export interface ScraperExecution {
  id: string
  configId: string
  scraperId: string
  status: ScraperStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  itemsScraped: number
  error?: {
    message: string
    code?: string
  }
  createdAt: string
}
