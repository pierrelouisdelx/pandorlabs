import { ScraperCategory } from '../enums';
import { IScraper } from './scraper.interface';

/**
 * Category-level interface for managing scrapers within a category
 */
export interface ICategory {
  /**
   * Category this category handles
   */
  readonly category: ScraperCategory;

  /**
   * Register a scraper for a specific scraper ID
   * @param scraper Scraper instance
   */
  registerScraper(scraper: IScraper): void;

  /**
   * Get a scraper for the given scraper ID
   * @param scraperId Unique identifier for the scraper
   * @returns Scraper instance
   */
  getScraper(scraperId: string): IScraper;

  /**
   * Check if this category supports the given scraper ID
   * @param scraperId Scraper identifier to check
   */
  supports(scraperId: string): boolean;

  /**
   * List all scraper IDs supported by this category
   */
  listSupportedScrapers(): string[];

  /**
   * Validate category-specific scraper
   * @param scraperId Scraper identifier to validate
   */
  validateScraper(scraperId: string): Promise<boolean>;
}
