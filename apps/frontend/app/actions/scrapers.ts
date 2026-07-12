'use server'

import { revalidatePath } from 'next/cache'

import { ApiError, executeScraper } from '@/lib/api'
import { requireUser } from '@/lib/session'

export type LaunchResponse = {
  success: boolean
  message: string
  /** Present on success, so the caller can link straight to the run. */
  executionId?: string
}

/**
 * Launches a run of an existing scraper config.
 *
 * The Nest API is unauthenticated and reachable only from the server, so this
 * action is the trust boundary: it refuses anyone without a session before it
 * forwards anything to the backend.
 *
 * Note the backend executes the scrape inline and answers only when it has
 * finished, so this action is as slow as the scrape itself.
 */
export async function launchScrape(
  configId: string,
  overrideOptions?: Record<string, unknown>,
): Promise<LaunchResponse> {
  await requireUser()

  if (!configId) {
    return { success: false, message: 'Pick a scraper to run.' }
  }

  try {
    const execution = await executeScraper(configId, overrideOptions)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/runs')
    revalidatePath('/dashboard/scrapers')

    return {
      success: true,
      message: `Scrape finished — ${execution.itemsScraped} item${
        execution.itemsScraped === 1 ? '' : 's'
      } collected.`,
      executionId: execution.id,
    }
  } catch (error) {
    console.error('Failed to launch scrape:', error)

    if (error instanceof ApiError) {
      return { success: false, message: error.message }
    }
    return {
      success: false,
      message:
        'Could not reach the scraper service. Is the backend running on port 3001?',
    }
  }
}
