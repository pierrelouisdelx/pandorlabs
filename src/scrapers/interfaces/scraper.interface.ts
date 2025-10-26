import { ScraperStatus, ScraperCategory } from '../enums';
import { ScraperConfig } from './scraper-config.interface';
import { ScraperResult } from './scraper-result.interface';

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
  readonly config: ScraperConfig;

  /**
   * Initialize the scraper with necessary resources
   */
  initialize(): Promise<void>;

  /**
   * Execute the scraping operation
   */
  execute(): Promise<ScraperResult>;

  /**
   * Pause the scraping operation
   */
  pause(): Promise<void>;

  /**
   * Resume a paused scraping operation
   */
  resume(): Promise<void>;

  /**
   * Cancel the scraping operation
   */
  cancel(): Promise<void>;

  /**
   * Clean up resources used by the scraper
   */
  cleanup(): Promise<void>;

  /**
   * Validate the scraper configuration
   */
  validate(): Promise<boolean>;
}
