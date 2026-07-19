import { Logger } from '@nestjs/common';
import { Impit } from 'impit';

/**
 * Resilient HTTP helper shared by the shopping scrapers.
 *
 * Wraps the `Impit` client created by `BaseScraper.createImpitClient()` (which
 * already rotates proxies from `ProxyService`) and adds the resilience the
 * Python `HttpClient` provided: a rotating User-Agent per request and a bounded
 * retry with backoff on HTTP 5xx / network errors.
 *
 * The backoff is deliberately short (seconds, not the source's 180s) because
 * scrapers here run inline inside a request/execution.
 */
export interface FashionRequestOptions {
  headers?: Record<string, string>;
  /** Extra retries beyond the first attempt. Default 2. */
  retries?: number;
  /** Base backoff in ms between retries. Default 2000. */
  backoffMs?: number;
  /**
   * Per-request timeout in ms. Default 30000. Aborts a request that hangs so a
   * single unresponsive host can never stall a whole scrape run indefinitely.
   */
  timeoutMs?: number;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class FashionHttp {
  constructor(
    /** Factory returning a fresh proxied Impit client per call. */
    private readonly newClient: () => Impit,
    private readonly logger: Logger,
  ) {}

  /** GET returning the raw body text, with retry/backoff. */
  async getText(
    url: string,
    options: FashionRequestOptions = {},
  ): Promise<string> {
    const {
      retries = 2,
      backoffMs = 2000,
      headers = {},
      timeoutMs = 30000,
    } = options;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = this.newClient();
        const response = await client.fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': randomUserAgent(),
            'Accept-Language': 'en-US,en;q=0.9',
            ...headers,
          },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (response.status >= 500) {
          lastError = new Error(`HTTP ${response.status} for ${url}`);
          if (attempt < retries) {
            this.logger.warn(
              `HTTP ${response.status} for ${url}; retry ${attempt + 1}/${retries}`,
            );
            await sleep(backoffMs);
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          // 4xx: not retryable, fail fast.
          throw new Error(`HTTP ${response.status} for ${url}`);
        }

        return await response.text();
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          this.logger.warn(
            `Request failed for ${url}: ${
              error instanceof Error ? error.message : String(error)
            }; retry ${attempt + 1}/${retries}`,
          );
          await sleep(backoffMs);
          continue;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Request failed for ${url}: ${String(lastError)}`);
  }

  /** GET parsing the body as JSON. */
  async getJson<T = unknown>(
    url: string,
    options: FashionRequestOptions = {},
  ): Promise<T> {
    const text = await this.getText(url, options);
    return JSON.parse(text) as T;
  }
}
