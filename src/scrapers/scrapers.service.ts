import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ScraperFactory } from './scraper.factory';
import { RealEstateAdapter } from './adapters/real-estate/real-estate.adapter';
import { LeadGenerationAdapter } from './adapters/lead-generation/lead-generation.adapter';
import { ScraperConfig } from './interfaces';
import { IScraper } from './interfaces/scraper.interface';

@Injectable()
export class ScrapersService implements OnModuleInit {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(
    private readonly scraperFactory: ScraperFactory,
    private readonly realEstateAdapter: RealEstateAdapter,
    private readonly leadGenAdapter: LeadGenerationAdapter,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing ScrapersService');
    // Register all adapters with the factory
    this.scraperFactory.registerAdapter(this.realEstateAdapter);
    this.scraperFactory.registerAdapter(this.leadGenAdapter);
    this.logger.log('All adapters registered successfully');
  }

  /**
   * Create and execute a scraper
   * @param config Scraper configuration
   * @returns Scraper execution result
   */
  async executeScraper(config: ScraperConfig) {
    this.logger.log(`Executing scraper: ${config.scraperId}`);
    const scraper = await this.scraperFactory.createScraper(config);
    return await scraper.execute();
  }

  /**
   * Get a scraper instance without executing
   * @param config Scraper configuration
   * @returns Scraper instance
   */
  async getScraper(config: ScraperConfig): Promise<IScraper> {
    return this.scraperFactory.createScraper(config);
  }

  /**
   * Get all supported scrapers grouped by category
   */
  getAllSupportedScrapers(): Record<string, string[]> {
    const scrapers = this.scraperFactory.getAllSupportedScrapers();
    const result: Record<string, string[]> = {};
    scrapers.forEach((scraperIds, category) => {
      result[category] = scraperIds;
    });
    return result;
  }

  /**
   * Get factory cache statistics
   */
  getCacheStats() {
    return this.scraperFactory.getCacheStats();
  }

  /**
   * Clear the scraper cache
   */
  clearCache() {
    this.scraperFactory.clearCache();
  }
}
