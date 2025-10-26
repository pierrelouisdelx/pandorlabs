import { Injectable } from '@nestjs/common';
import { BaseAdapter } from '../../base';
import { ScraperCategory } from '../../enums';
import { IScraper, ScraperConfig } from '../../interfaces';
import { RealEstateScraper } from './real-estate-scraper';

/**
 * Adapter for Real Estate category scrapers
 */
@Injectable()
export class RealEstateAdapter extends BaseAdapter {
  constructor() {
    super(ScraperCategory.REAL_ESTATE);
  }

  protected registerScrapers(): void {
    // Register all supported real estate scraper IDs
    this.supportedScrapers.set('zillow', {
      name: 'Zillow',
      description: 'Scraper for Zillow real estate listings',
    });
    this.supportedScrapers.set('realtor', {
      name: 'Realtor.com',
      description: 'Scraper for Realtor.com listings',
    });
    this.supportedScrapers.set('redfin', {
      name: 'Redfin',
      description: 'Scraper for Redfin listings',
    });
  }

  async getScraper(
    scraperId: string,
    config?: Partial<ScraperConfig>,
  ): Promise<IScraper> {
    if (!this.supports(scraperId)) {
      throw new Error(`Unsupported scraper ID: ${scraperId}`);
    }

    const scraperConfig: ScraperConfig = {
      scraperId,
      category: this.category,
      ...config,
    };

    return new RealEstateScraper(scraperId, scraperConfig);
  }

  protected async onValidateConfig(config: ScraperConfig): Promise<boolean> {
    // Real estate specific validation
    if (config.url && !this.isValidUrl(config.url)) {
      this.logger.error(`Invalid URL: ${config.url}`);
      return false;
    }

    return true;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
