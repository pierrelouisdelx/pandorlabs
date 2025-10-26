import { Logger } from '@nestjs/common';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperConfig, ScraperResult } from '../interfaces';
import { ScraperStatus, ScraperCategory } from '../enums';

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
    public readonly config: ScraperConfig,
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

  async execute(): Promise<ScraperResult> {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
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

  async pause(): Promise<void> {
    if (this._status !== ScraperStatus.RUNNING) {
      throw new Error(`Cannot pause scraper in ${this._status} state`);
    }
    this.logger.log('Pausing scraper');
    this.setStatus(ScraperStatus.PAUSED);
    await this.onPause();
  }

  async resume(): Promise<void> {
    if (this._status !== ScraperStatus.PAUSED) {
      throw new Error(`Cannot resume scraper in ${this._status} state`);
    }
    this.logger.log('Resuming scraper');
    this.setStatus(ScraperStatus.RUNNING);
    await this.onResume();
  }

  async cancel(): Promise<void> {
    this.logger.log('Cancelling scraper');
    this.setStatus(ScraperStatus.CANCELLED);
    await this.onCancel();
  }

  async cleanup(): Promise<void> {
    this.logger.log('Cleaning up resources');
    await this.onCleanup();
  }

  async validate(): Promise<boolean> {
    this.logger.log('Validating scraper configuration');
    return this.onValidate();
  }

  // Abstract methods to be implemented by concrete scrapers
  protected abstract onInitialize(): Promise<void>;
  protected abstract onExecute(): Promise<any>;
  protected abstract onPause(): Promise<void>;
  protected abstract onResume(): Promise<void>;
  protected abstract onCancel(): Promise<void>;
  protected abstract onCleanup(): Promise<void>;
  protected abstract onValidate(): Promise<boolean>;
}
