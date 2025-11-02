import { BaseCategory } from '../../base/base-category.abstract';
import { ScraperCategory } from '../../enums';
import { Connection } from 'mongoose';
import { ProxyService } from '../../services/proxy.service';
import * as scrapers from './scrapers';

export class RealEstateCategory extends BaseCategory {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(ScraperCategory.REAL_ESTATE, connection, proxyService);
  }

  /**
   * Register all real estate scrapers
   */
  protected registerScrapers(): void {
    this.registerScraper(
      new scrapers.AuctionScraper(this.connection, this.proxyService),
    );

    this.logger.log(`Registered ${this.scrapers.size} real estate scrapers`);
  }
}
