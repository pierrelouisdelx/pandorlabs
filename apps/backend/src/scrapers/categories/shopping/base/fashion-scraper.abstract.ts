import { Schema as MongooseSchema } from 'mongoose';
import { BaseScraper } from '@scrapers/base';
import { FashionHttp } from '../utils/fashion-http';
import { RunStats } from '../utils/run-stats';
import { createProductSchema } from '../schemas/product.schema';
import { ScrapedProduct } from '../utils/product';

/**
 * Base class for shopping/fashion scrapers.
 *
 * Sits between the generic `BaseScraper` and each concrete site scraper,
 * providing the pieces every fashion scraper shares:
 *  - a resilient `FashionHttp` client (proxy rotation via BaseScraper + retries)
 *  - a `RunStats` accumulator surfaced through `getRunMetadata()`
 *  - the shared product Mongoose schema
 *  - sane default lifecycle hooks
 *
 * Concrete scrapers implement `collectProducts()` (links → fetch → parse) and
 * let this class handle stats, the empty/total-failure decision, and persistence.
 */
export abstract class FashionScraper extends BaseScraper {
  protected readonly stats = new RunStats();
  protected readonly http = new FashionHttp(
    () => this.createImpitClient(),
    this.logger,
  );

  /** Fill `this.stats` and return the normalized products. */
  protected abstract collectProducts(): Promise<ScrapedProduct[]>;

  protected async onExecute(): Promise<ScrapedProduct[]> {
    const products = await this.collectProducts();

    // A run that scraped nothing *and* hit fetch errors is a real failure, not
    // an empty catalog — surface it so the execution is marked FAILED.
    if (products.length === 0 && this.stats.fetchErrors > 0) {
      throw new Error(
        `No products scraped; ${this.stats.fetchErrors} fetch error(s). ` +
          `Site may be unreachable or blocking requests.`,
      );
    }

    this.logger.log(
      `Scraped ${products.length} products ` +
        `(failed items: ${this.stats.itemsFailed}, fetch errors: ${this.stats.fetchErrors})`,
    );
    return products;
  }

  protected getRunMetadata(): Record<string, unknown> {
    return this.stats.toJSON();
  }

  getSchema(): MongooseSchema {
    return createProductSchema();
  }

  protected async onInitialize(): Promise<void> {
    this.logger.log(`Initializing ${this.id} scraper`);
  }

  protected async onCancel(): Promise<void> {
    this.logger.log(`Cancelling ${this.id} scraper`);
  }

  protected async onValidate(): Promise<boolean> {
    return Boolean(this.config.url);
  }
}
