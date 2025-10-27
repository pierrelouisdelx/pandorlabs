import { BaseCategory } from '../../base/base-category.abstract';
import { ScraperCategory } from '../../enums';
import * as scrapers from './scrapers';

export class RealEstateCategory extends BaseCategory {
  constructor() {
    super(ScraperCategory.REAL_ESTATE);
  }

  /**
   * Register all real estate scrapers
   */
  protected registerScrapers(): void {
    this.registerScraper('zillow', new scrapers.AuctionScraper());

    this.logger.log(`Registered ${this.scrapers.size} real estate scrapers`);
  }
}
