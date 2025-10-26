import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IAdapter } from './interfaces/adapter.interface';
import { IScraper } from './interfaces/scraper.interface';
import { ScraperConfig } from './interfaces';
import { ScraperCategory } from './enums';
import {
  AdapterNotFoundException,
  InvalidConfigException,
} from './exceptions/scraper-factory.exception';

/**
 * Factory for creating scraper instances with caching and validation
 */
@Injectable()
export class ScraperFactory implements OnModuleInit {
  private readonly logger = new Logger(ScraperFactory.name);
  private readonly adapters = new Map<ScraperCategory, IAdapter>();
  private readonly scraperCache = new Map<string, IScraper>();
  private readonly cacheEnabled: boolean = true;
  private readonly maxCacheSize: number = 100;

  constructor() {
    this.logger.log('ScraperFactory initialized');
  }

  async onModuleInit() {
    this.logger.log('ScraperFactory module initialization complete');
    this.logger.log(`Registered adapters: ${this.adapters.size}`);
    this.logger.log(`Cache enabled: ${this.cacheEnabled}`);
    this.logger.log(`Max cache size: ${this.maxCacheSize}`);
  }

  /**
   * Register an adapter for a specific category
   * @param adapter Adapter instance to register
   */
  registerAdapter(adapter: IAdapter): void {
    if (this.adapters.has(adapter.category)) {
      this.logger.warn(
        `Adapter for category ${adapter.category} already registered. Replacing...`,
      );
    }

    this.adapters.set(adapter.category, adapter);
    this.logger.log(
      `Registered adapter for category: ${adapter.category}, supports: [${adapter.listSupportedScrapers().join(', ')}]`,
    );
  }

  /**
   * Create a scraper instance from configuration
   * @param config Scraper configuration
   * @returns Configured scraper instance
   * @throws AdapterNotFoundException if no adapter found for category
   * @throws InvalidConfigException if configuration is invalid
   */
  async createScraper(config: ScraperConfig): Promise<IScraper> {
    this.logger.log(`Creating scraper: ${config.scraperId} [${config.category}]`);

    // Validate configuration
    await this.validateConfig(config);

    // Check cache first
    if (this.cacheEnabled) {
      const cachedScraper = this.getFromCache(config.scraperId);
      if (cachedScraper) {
        this.logger.log(`Returning cached scraper: ${config.scraperId}`);
        return cachedScraper;
      }
    }

    // Get adapter for category
    const adapter = this.adapters.get(config.category);
    if (!adapter) {
      throw new AdapterNotFoundException(config.category);
    }

    // Create scraper through adapter
    const scraper = await adapter.getScraper(config.scraperId, config);

    // Initialize scraper
    await scraper.initialize();

    // Cache scraper if enabled
    if (this.cacheEnabled) {
      this.addToCache(config.scraperId, scraper);
    }

    this.logger.log(`Successfully created scraper: ${config.scraperId}`);
    return scraper;
  }

  /**
   * Get an adapter for a specific category
   * @param category Scraper category
   * @returns Adapter instance
   * @throws AdapterNotFoundException if no adapter found
   */
  getAdapter(category: ScraperCategory): IAdapter {
    const adapter = this.adapters.get(category);
    if (!adapter) {
      throw new AdapterNotFoundException(category);
    }
    return adapter;
  }

  /**
   * Check if an adapter is registered for a category
   * @param category Scraper category
   */
  hasAdapter(category: ScraperCategory): boolean {
    return this.adapters.has(category);
  }

  /**
   * Get all registered categories
   */
  getRegisteredCategories(): ScraperCategory[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get all supported scraper IDs across all adapters
   */
  getAllSupportedScrapers(): Map<ScraperCategory, string[]> {
    const result = new Map<ScraperCategory, string[]>();
    this.adapters.forEach((adapter, category) => {
      result.set(category, adapter.listSupportedScrapers());
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
   * @param scraperId Scraper ID to remove
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
   * @param config Configuration to validate
   * @throws InvalidConfigException if validation fails
   */
  private async validateConfig(config: ScraperConfig): Promise<void> {
    if (!config.scraperId) {
      throw new InvalidConfigException('scraperId is required');
    }

    if (!config.category) {
      throw new InvalidConfigException('category is required');
    }

    // Get adapter and validate config
    const adapter = this.adapters.get(config.category);
    if (!adapter) {
      throw new AdapterNotFoundException(config.category);
    }

    const isValid = await adapter.validateConfig(config);
    if (!isValid) {
      throw new InvalidConfigException(
        `Configuration validation failed for ${config.scraperId}`,
      );
    }
  }

  /**
   * Get scraper from cache
   */
  private getFromCache(scraperId: string): IScraper | undefined {
    return this.scraperCache.get(scraperId);
  }

  /**
   * Add scraper to cache with size limit enforcement
   */
  private addToCache(scraperId: string, scraper: IScraper): void {
    // Enforce cache size limit (FIFO)
    if (this.scraperCache.size >= this.maxCacheSize) {
      const firstKey = this.scraperCache.keys().next().value as string | undefined;
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
