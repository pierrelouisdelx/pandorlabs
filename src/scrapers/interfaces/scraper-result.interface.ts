/**
 * Result returned by a scraper execution
 */
export interface ScraperResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    scraperId: string;
    executionTime: number;
    itemsScraped: number;
    timestamp: Date;
  };
}
