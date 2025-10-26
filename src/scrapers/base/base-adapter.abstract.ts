import { Logger } from '@nestjs/common';
import { IAdapter } from '../interfaces/adapter.interface';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperConfig } from '../interfaces';
import { ScraperCategory } from '../enums';

/**
 * Abstract base class for all adapters
 * Provides common functionality for adapter implementations
 */
export abstract class BaseAdapter implements IAdapter {
  protected readonly logger: Logger;
  protected readonly supportedScrapers: Map<string, any> = new Map();

  constructor(public readonly category: ScraperCategory) {
    this.logger = new Logger(`${this.constructor.name}`);
    this.registerScrapers();
  }

  abstract getScraper(
    scraperId: string,
    config?: Partial<ScraperConfig>,
  ): Promise<IScraper>;

  supports(scraperId: string): boolean {
    return this.supportedScrapers.has(scraperId);
  }

  listSupportedScrapers(): string[] {
    return Array.from(this.supportedScrapers.keys());
  }

  async validateConfig(config: ScraperConfig): Promise<boolean> {
    if (!config.scraperId) {
      this.logger.error('Scraper ID is required');
      return false;
    }

    if (config.category !== this.category) {
      this.logger.error(
        `Invalid category. Expected ${this.category}, got ${config.category}`,
      );
      return false;
    }

    if (!this.supports(config.scraperId)) {
      this.logger.error(`Unsupported scraper ID: ${config.scraperId}`);
      return false;
    }

    return this.onValidateConfig(config);
  }

  /**
   * Register all scrapers supported by this adapter
   * Called during adapter construction
   */
  protected abstract registerScrapers(): void;

  /**
   * Adapter-specific configuration validation
   * Override this method for custom validation logic
   */
  protected abstract onValidateConfig(config: ScraperConfig): Promise<boolean>;
}
