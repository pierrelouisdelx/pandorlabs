import { Logger } from '@nestjs/common';
import { ICategory } from '../interfaces/category.interface';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperCategory } from '../enums';
import { CategoryScraperNotFoundException } from '../exceptions';

/**
 * Abstract base class for category factories
 * Manages scraper factories within a specific category
 */
export abstract class BaseCategory implements ICategory {
  protected readonly logger: Logger;
  protected readonly scrapers = new Map<string, IScraper>();

  constructor(public readonly category: ScraperCategory) {
    this.logger = new Logger(`${this.constructor.name}`);
    this.registerScrapers();
  }

  /**
   * Register a scraper factory for a specific scraper ID
   */
  registerScraper(id: string, scraper: IScraper): void {
    if (this.scrapers.has(id)) {
      this.logger.warn(`Scraper for ${id} already registered. Replacing...`);
    }

    this.scrapers.set(id, scraper);
    this.logger.log(
      `Registered scraper: ${id} (collection: ${scraper.config.collectionName})`,
    );
  }

  /**
   * Get a scraper for the given scraper ID
   */
  getScraper(id: string): IScraper {
    const scraper = this.scrapers.get(id);
    if (!scraper) {
      throw new CategoryScraperNotFoundException(id, this.category);
    }
    return scraper;
  }

  /**
   * Check if this category supports the given scraper ID
   */
  supports(id: string): boolean {
    return this.scrapers.has(id);
  }

  /**
   * List all scraper IDs supported by this category
   */
  listSupportedScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }

  /**
   * Validate category-specific configuration
   */
  async validateScraper(id: string): Promise<boolean> {
    const scraper = this.getScraper(id);
    return scraper.validate();
  }

  /**
   * Register all scrapers supported by this category
   * Called during category construction
   */
  protected abstract registerScrapers(): void;
}
