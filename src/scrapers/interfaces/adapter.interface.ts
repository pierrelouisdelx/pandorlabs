import { ScraperCategory } from '../enums';
import { IScraper } from './scraper.interface';
import { ScraperConfig } from './scraper-config.interface';

/**
 * Adapter interface for creating category-specific scrapers
 */
export interface IAdapter {
  /**
   * Category this adapter handles
   */
  readonly category: ScraperCategory;

  /**
   * Get a scraper instance for the given scraper ID
   * @param scraperId Unique identifier for the scraper
   * @param config Optional configuration overrides
   */
  getScraper(scraperId: string, config?: Partial<ScraperConfig>): Promise<IScraper>;

  /**
   * Check if this adapter supports the given scraper ID
   * @param scraperId Scraper identifier to check
   */
  supports(scraperId: string): boolean;

  /**
   * List all scraper IDs supported by this adapter
   */
  listSupportedScrapers(): string[];

  /**
   * Validate adapter-specific configuration
   * @param config Configuration to validate
   */
  validateConfig(config: ScraperConfig): Promise<boolean>;
}
