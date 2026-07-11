import { ScraperStatus, ScraperCategory } from '../enums';

/**
 * Base interface for all scrapers
 */
export interface IScraper {
  /**
   * Unique identifier for this scraper instance
   */
  readonly id: string;

  /**
   * Category of the scraper
   */
  readonly category: ScraperCategory;

  /**
   * Current status of the scraper
   */
  readonly status: ScraperStatus;

  /**
   * Configuration used to create this scraper
   */
  readonly config: any;

  /**
   * Initialize the scraper with necessary resources
   */
  initialize(): Promise<void>;

  /**
   * Execute the scraping operation
   */
  execute(): Promise<any>;

  /**
   * Cancel the scraping operation
   */
  cancel(): Promise<void>;

  /**
   * Validate the scraper configuration
   */
  validate(): Promise<boolean>;

  /**
   * Get the Mongoose schema for this scraper's data
   */
  getSchema(): any;
}
