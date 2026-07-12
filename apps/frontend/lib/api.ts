/**
 * Client for the Nest API in apps/backend.
 *
 * Request and response shapes come from @pandorlabs/types, which the backend
 * also compiles against — a change to the contract fails the build on both
 * sides rather than at runtime.
 *
 * Server-side only. The Nest API has no authentication of its own, so it is
 * never called from the browser: the dashboard reaches it through Server
 * Components and Server Actions that have already run `requireUser()`.
 */
import 'server-only'

import type {
  PaginatedResponse,
  PaginationParams,
  Scraper,
  ScraperExecution,
  ScraperStatus,
} from '@pandorlabs/types'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * `object` rather than `Record<string, …>`: the query types are built from
 * interfaces in @pandorlabs/types, which TypeScript will not widen to an index
 * signature.
 */
async function get<T>(path: string, params?: object): Promise<T> {
  const url = new URL(path, apiUrl)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    // A run's status and its rows change under us — a cached read would show a
    // finished scrape as still running.
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `GET ${url.pathname} failed: ${response.status}`,
    )
  }
  return response.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, apiUrl)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!response.ok) {
    // Nest puts the useful part (validation errors, "config is inactive") in
    // the body — surface that rather than a bare status code.
    throw new ApiError(
      response.status,
      await readErrorMessage(response, `POST ${url.pathname}`),
    )
  }
  return response.json() as Promise<T>
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await response.json()
    const message = (body as { message?: string | string[] })?.message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    if (typeof message === 'string') {
      return message
    }
  } catch {
    // Body was not JSON — fall through to the generic message.
  }
  return `${fallback} failed: ${response.status}`
}

export type ScraperQuery = PaginationParams & {
  category?: string
  isActive?: boolean
  search?: string
}

export type ExecutionQuery = PaginationParams & {
  configId?: string
  status?: ScraperStatus
  scraperId?: string
}

/** GET /scrapers/all — ScrapersController.findAll */
export function listScrapers(params?: ScraperQuery) {
  return get<PaginatedResponse<Scraper>>('/scrapers/all', params)
}

/** GET /scrapers/executions — ScrapersController.findAllExecutions */
export function listExecutions(params?: ExecutionQuery) {
  return get<PaginatedResponse<ScraperExecution>>(
    '/scrapers/executions',
    params,
  )
}

/** GET /scrapers/executions/:id — ScrapersController.findExecutionById */
export function getExecution(id: string) {
  return get<ScraperExecution>(`/scrapers/executions/${id}`)
}

/**
 * GET /scrapers/executions/:id/data — the rows a single run produced.
 *
 * The shape is per-scraper, so the caller gets untyped records and the table
 * derives its columns from the keys actually present.
 */
export function getExecutionData(id: string, params?: PaginationParams) {
  return get<PaginatedResponse<Record<string, unknown>>>(
    `/scrapers/executions/${id}/data`,
    params,
  )
}

/**
 * POST /scrapers/execute — launches a run of an existing config.
 *
 * The backend runs the scrape inline and only answers once it has finished, so
 * this can take a while. It is only ever awaited inside a Server Action.
 */
export function executeScraper(configId: string, overrideOptions?: unknown) {
  return post<ScraperExecution>('/scrapers/execute', {
    configId,
    ...(overrideOptions ? { overrideOptions } : {}),
  })
}

export { ApiError }
