import { ScraperCategory } from '@scrapers/enums/scraper-category.enum';
import { CategoryData } from './category-data.dto';

/**
 * Metadata about scraper execution
 */
export interface ScraperExecutionMetadata {
  scraperId: string;
  executionTime: number;
  itemsScraped: number;
  timestamp: Date;
}

/**
 * Generic scraper result with category-specific typed data
 * @template T - Category-specific data type extending CategoryData
 */
export interface ScraperResultDto<T extends CategoryData = CategoryData> {
  category: ScraperCategory;
  data: T[];
  metadata: ScraperExecutionMetadata;
}
