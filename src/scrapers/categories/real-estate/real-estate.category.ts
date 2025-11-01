import { BaseCategory } from '../../base/base-category.abstract';
import { ScraperCategory } from '../../enums';
import { Connection } from 'mongoose';
import * as scrapers from './scrapers';

export class RealEstateCategory extends BaseCategory {
  constructor(connection?: Connection) {
    super(ScraperCategory.REAL_ESTATE, connection);
  }

  /**
   * Register all real estate scrapers
   */
  protected registerScrapers(): void {
    this.registerScraper(new scrapers.AuctionScraper(this.connection));

    this.logger.log(`Registered ${this.scrapers.size} real estate scrapers`);
  }
}
