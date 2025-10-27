import { Logger } from '@nestjs/common';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperStatus, ScraperCategory } from '../enums';
import { IScraperConfig } from '../interfaces/scraper-config.interface';

/**
 * Abstract base class for all scrapers
 * Provides common functionality and enforces interface implementation
 */
export abstract class BaseScraper implements IScraper {
  protected readonly logger: Logger;
  private _status: ScraperStatus = ScraperStatus.IDLE;

  constructor(
    public readonly id: string,
    public readonly category: ScraperCategory,
    public readonly config: IScraperConfig,
  ) {
    this.logger = new Logger(`${this.constructor.name}:${id}`);
  }

  get status(): ScraperStatus {
    return this._status;
  }

  protected setStatus(status: ScraperStatus): void {
    this.logger.log(`Status transition: ${this._status} -> ${status}`);
    this._status = status;
  }

  async initialize(): Promise<void> {
    this.logger.log('Initializing scraper');
    this.setStatus(ScraperStatus.IDLE);
    await this.onInitialize();
  }

  async execute(): Promise<any> {
    this.logger.log('Starting execution');
    const startTime = Date.now();
    this.setStatus(ScraperStatus.RUNNING);

    try {
      const data = await this.onExecute();
      const executionTime = Date.now() - startTime;

      this.setStatus(ScraperStatus.COMPLETED);
      this.logger.log(`Execution completed in ${executionTime}ms`);

      return {
        success: true,
        data,
        metadata: {
          scraperId: this.id,
          executionTime,
          itemsScraped: Array.isArray(data) ? data.length : 1,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.setStatus(ScraperStatus.FAILED);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Execution failed: ${errorMessage}`, errorStack);

      return {
        success: false,
        error: errorMessage,
        metadata: {
          scraperId: this.id,
          executionTime,
          itemsScraped: 0,
          timestamp: new Date(),
        },
      };
    }
  }

  async cancel(): Promise<void> {
    this.logger.log('Cancelling scraper');
    this.setStatus(ScraperStatus.CANCELLED);
    await this.onCancel();
  }

  async validate(): Promise<boolean> {
    this.logger.log('Validating scraper configuration');
    return this.onValidate();
  }

  // Abstract methods to be implemented by concrete scrapers
  protected abstract onInitialize(): Promise<void>;
  protected abstract onExecute(): Promise<any>;
  protected abstract onCancel(): Promise<void>;
  protected abstract onValidate(): Promise<boolean>;
}
