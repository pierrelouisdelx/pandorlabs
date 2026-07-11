import { ScraperCategory } from '../enums';
import { ICategory } from './category.interface';
import { IScraper } from './scraper.interface';

/**
 * Top-level orchestrator for managing all categories
 */
export interface ICategoryOrchestrator {
  /**
   * Register a category
   * @param category Category instance to register
   */
  registerCategory(category: ICategory): void;

  /**
   * Get a category for a specific category
   * @param category Scraper category
   * @returns Category instance
   */
  getCategory(category: ScraperCategory): ICategory;

  /**
   * Get a scraper instance by scraper ID
   * Routes to the appropriate category and returns the scraper
   * @param scraperId Unique identifier for the scraper
   * @returns Scraper instance
   */
  getScraper(scraperId: string): Promise<IScraper>;

  /**
   * Get all registered categories as an array
   */
  getRegisteredCategories(): ScraperCategory[];

  /**
   * Get all supported scrapers grouped by category as a map
   */
  getAllSupportedScrapers(): Map<ScraperCategory, string[]>;

  /**
   * Clear the category cache
   */
  clearCache(): void;

  /**
   * Get category cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    enabled: boolean;
    items: string[];
  };
}
