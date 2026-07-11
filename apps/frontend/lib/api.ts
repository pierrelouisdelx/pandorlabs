/**
 * Client for the Nest API in apps/backend.
 *
 * Request and response shapes come from @pandorlabs/types, which the backend
 * also compiles against — a change to the contract fails the build on both
 * sides rather than at runtime.
 */
import type {
  PaginatedResponse,
  PaginationParams,
  Scraper,
  ScraperExecution,
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

async function get<T>(path: string, params?: PaginationParams): Promise<T> {
  const url = new URL(path, apiUrl)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `GET ${url.pathname} failed: ${response.status}`,
    )
  }
  return response.json() as Promise<T>
}

/** GET /scrapers/all — ScrapersController.findAll */
export function listScrapers(params?: PaginationParams) {
  return get<PaginatedResponse<Scraper>>('/scrapers/all', params)
}

/** GET /scrapers/executions — ScrapersController.findAllExecutions */
export function listExecutions(params?: PaginationParams) {
  return get<PaginatedResponse<ScraperExecution>>(
    '/scrapers/executions',
    params,
  )
}

export { ApiError }
