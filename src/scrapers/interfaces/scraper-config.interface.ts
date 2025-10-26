import { ScraperCategory } from '../enums';

/**
 * Configuration for creating a scraper instance
 */
export interface ScraperConfig {
  scraperId: string;
  category: ScraperCategory;
  url?: string;
  options?: Record<string, any>;
  metadata?: {
    name?: string;
    description?: string;
    createdBy?: string;
    tags?: string[];
  };
}
