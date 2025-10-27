import { BaseScraper } from '@scrapers/base';
import { ScraperCategory } from '@scrapers/enums';

export class AuctionScraper extends BaseScraper {
  constructor() {
    super('auction', ScraperCategory.REAL_ESTATE, {});
  }

  protected async onInitialize(): Promise<void> {
    this.logger.log('Initializing Auction scraper');
  }

  protected async onExecute(): Promise<any> {
    this.logger.log('Executing Auction scraper');
  }

  protected async onCancel(): Promise<void> {
    this.logger.log('Cancelling Auction scraper');
  }

  protected async onValidate(): Promise<boolean> {
    this.logger.log('Validating Auction scraper');
    return true;
  }
}
