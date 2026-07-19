import { Connection } from 'mongoose';
import { BaseCategory } from '../../base/base-category.abstract';
import { ScraperCategory } from '../../enums';
import { ProxyService } from '../../services/proxy.service';
import {
  SHOPIFY_STORES,
  ShopifyScraper,
  SsenseScraper,
  ZaraScraper,
  SezaneScraper,
} from './scrapers';

/**
 * Shopping category — fashion/e-commerce scrapers migrated from fynd-scraper.
 *
 * Registers one `ShopifyScraper` instance per storefront in `SHOPIFY_STORES`
 * (each gets its own scraper id + Mongo collection) plus the dedicated
 * bespoke-site scrapers.
 */
export class ShoppingCategory extends BaseCategory {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(ScraperCategory.SHOPPING, connection, proxyService);
  }

  protected registerScrapers(): void {
    for (const store of SHOPIFY_STORES) {
      this.registerScraper(
        new ShopifyScraper(store, this.connection, this.proxyService),
      );
    }

    this.registerScraper(new SsenseScraper(this.connection, this.proxyService));
    this.registerScraper(new ZaraScraper(this.connection, this.proxyService));
    this.registerScraper(new SezaneScraper(this.connection, this.proxyService));

    this.logger.log(`Registered ${this.scrapers.size} shopping scrapers`);
  }
}
