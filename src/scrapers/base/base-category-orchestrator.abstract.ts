import { Logger } from '@nestjs/common';
import { ICategoryOrchestrator } from '../interfaces/category-orchestrator.interface';
import { ICategory } from '../interfaces/category.interface';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperCategory } from '../enums';
import {
  CategoryNotFoundException,
  CategoryInvalidScraperException,
} from '../exceptions/category-orchestrator.exception';
import { IScraperConfig } from '../interfaces/scraper-config.interface';

/**
 * Abstract base class for category orchestrators
 * Manages all category factories and provides caching
 */
export abstract class BaseCategoryOrchestrator
  implements ICategoryOrchestrator
{
  protected readonly logger: Logger;
  protected readonly categoryFactories = new Map<ScraperCategory, ICategory>();
  protected readonly scraperCache = new Map<string, IScraper>();
  protected readonly cacheEnabled: boolean = true;
  protected readonly maxCacheSize: number = 100;

  constructor() {
    this.logger = new Logger(`${this.constructor.name}`);
  }

  registerCategory(categoryFactory: ICategory): void {
    if (this.categoryFactories.has(categoryFactory.category)) {
      this.logger.warn(
        `Category factory for ${categoryFactory.category} already registered. Replacing...`,
      );
    }

    this.categoryFactories.set(categoryFactory.category, categoryFactory);
    this.logger.log(
      `Registered category factory: ${categoryFactory.category}, supports: [${categoryFactory.listSupportedScrapers().join(', ')}]`,
    );
  }

  /**
   * Get a category factory for a specific category
   */
  getCategory(category: ScraperCategory): ICategory {
    const factory = this.categoryFactories.get(category);
    if (!factory) {
      throw new CategoryNotFoundException(category);
    }
    return factory;
  }

  /**
   * Check if a category factory is registered
   */
  hasCategory(category: ScraperCategory): boolean {
    return this.categoryFactories.has(category);
  }

  /**
   * Get all registered categories
   */
  getRegisteredCategories(): ScraperCategory[] {
    return Array.from(this.categoryFactories.keys());
  }

  /**
   * Get a scraper instance by scraper ID
   * Routes to the appropriate category factory
   */
  async getScraper(scraperId: string): Promise<IScraper> {
    // Check cache first if enabled
    if (this.cacheEnabled) {
      const cached = this.getFromCache(scraperId);
      if (cached) {
        this.logger.log(`Cache hit: ${scraperId}`);
        return cached;
      }
    }

    // Find which category supports this scraper
    let foundCategory: ICategory | undefined;
    for (const [, category] of this.categoryFactories) {
      if (category.supports(scraperId)) {
        foundCategory = category;
        break;
      }
    }

    if (!foundCategory) {
      throw new CategoryInvalidScraperException(
        `No category found that supports scraper: ${scraperId}`,
      );
    }

    // Get scraper from category
    const scraper = foundCategory.getScraper(scraperId);

    // Cache if enabled
    if (this.cacheEnabled) {
      this.addToCache(scraperId, scraper);
    }

    return scraper;
  }

  /**
   * Get all supported scrapers grouped by category
   */
  getAllSupportedScrapers(): Map<ScraperCategory, string[]> {
    const result = new Map<ScraperCategory, string[]>();
    this.categoryFactories.forEach((factory, category) => {
      result.set(category, factory.listSupportedScrapers());
    });
    return result;
  }

  /**
   * Clear all cached scrapers
   */
  clearCache(): void {
    const cacheSize = this.scraperCache.size;
    this.scraperCache.clear();
    this.logger.log(`Cleared cache: ${cacheSize} items removed`);
  }

  /**
   * Remove a specific scraper from cache
   */
  removeFromCache(scraperId: string): boolean {
    const result = this.scraperCache.delete(scraperId);
    if (result) {
      this.logger.log(`Removed from cache: ${scraperId}`);
    }
    return result;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    enabled: boolean;
    items: string[];
  } {
    return {
      size: this.scraperCache.size,
      maxSize: this.maxCacheSize,
      enabled: this.cacheEnabled,
      items: Array.from(this.scraperCache.keys()),
    };
  }

  /**
   * Validate scraper configuration
   */
  protected async validateConfig(config: IScraperConfig): Promise<boolean> {
    if (!config.url) {
      throw new CategoryInvalidScraperException('URL is required');
    }

    return true;
  }

  /**
   * Get scraper from cache
   */
  protected getFromCache(scraperId: string): IScraper | undefined {
    return this.scraperCache.get(scraperId);
  }

  /**
   * Add scraper to cache with size limit enforcement
   */
  protected addToCache(scraperId: string, scraper: IScraper): void {
    // Enforce cache size limit (FIFO)
    if (this.scraperCache.size >= this.maxCacheSize) {
      const firstKey = this.scraperCache.keys().next().value;
      if (firstKey) {
        this.scraperCache.delete(firstKey);
        this.logger.log(`Cache limit reached. Evicted: ${firstKey}`);
      }
    }

    this.scraperCache.set(scraperId, scraper);
    this.logger.log(
      `Added to cache: ${scraperId} (${this.scraperCache.size}/${this.maxCacheSize})`,
    );
  }
}
