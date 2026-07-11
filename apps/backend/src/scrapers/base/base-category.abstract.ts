import { Logger } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ICategory } from '../interfaces/category.interface';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperCategory } from '../enums';
import { CategoryScraperNotFoundException } from '../exceptions';
import { ProxyService } from '../services/proxy.service';

/**
 * Abstract base class for categories
 * Manages scrapers within a specific category
 */
export abstract class BaseCategory implements ICategory {
  protected readonly logger: Logger;
  protected readonly scrapers = new Map<string, IScraper>();

  constructor(
    public readonly category: ScraperCategory,
    protected readonly connection?: Connection,
    protected readonly proxyService?: ProxyService,
  ) {
    this.logger = new Logger(`${this.constructor.name}`);
    this.registerScrapers();
  }

  /**
   * Register a scraper
   */
  registerScraper(scraper: IScraper): void {
    if (this.scrapers.has(scraper.id)) {
      this.logger.warn(
        `Scraper for ${scraper.id} already registered. Replacing...`,
      );
    }

    this.scrapers.set(scraper.id, scraper);
    this.logger.log(
      `Registered scraper: ${scraper.id} (collection: ${scraper.config.collectionName})`,
    );
  }

  /**
   * Get a scraper
   */
  getScraper(id: string): IScraper {
    const scraper = this.scrapers.get(id);
    if (!scraper) {
      throw new CategoryScraperNotFoundException(id, this.category);
    }
    return scraper;
  }

  /**
   * Check if this category supports the given scraper
   */
  supports(id: string): boolean {
    return this.scrapers.has(id);
  }

  /**
   * List all scrapers supported by this category
   */
  listSupportedScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }

  /**
   * Validate scraper
   */
  async validateScraper(id: string): Promise<boolean> {
    const scraper = this.getScraper(id);
    return scraper.validate();
  }

  /**
   * Register all scrapers
   * Called during category construction
   */
  protected abstract registerScrapers(): void;
}
