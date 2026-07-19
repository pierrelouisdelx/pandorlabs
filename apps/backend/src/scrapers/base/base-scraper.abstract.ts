import { Logger } from '@nestjs/common';
import { Connection, Model, Schema as MongooseSchema } from 'mongoose';
import { Impit } from 'impit';
import { IScraper } from '../interfaces/scraper.interface';
import { ScraperStatus, ScraperCategory } from '../enums';
import { IScraperConfig } from '../interfaces/scraper-config.interface';
import { ProxyService } from '../services/proxy.service';

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
    protected readonly connection?: Connection,
    protected readonly proxyService?: ProxyService,
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

  /**
   * Save scraped data to MongoDB collection
   * Each item in the data array is saved as a separate document with timestamps
   * @param data Array of scraped data items
   * @param schema Mongoose schema for the collection
   */
  protected async saveScrapedData<T>(
    data: T[],
    schema: MongooseSchema,
  ): Promise<void> {
    if (!this.connection) {
      this.logger.warn(
        'MongoDB connection not available, skipping data persistence',
      );
      return;
    }

    if (!this.config.collectionName) {
      this.logger.error(
        'Collection name not specified in config, cannot save data',
      );
      return;
    }

    if (!data || data.length === 0) {
      this.logger.warn('No data to save, skipping persistence');
      return;
    }

    try {
      this.logger.log(
        `Saving ${data.length} items to collection: ${this.config.collectionName}`,
      );

      // Create or get the model for this collection
      const model: Model<any> =
        this.connection.models[this.config.collectionName] ||
        this.connection.model(
          this.config.collectionName,
          schema,
          this.config.collectionName,
        );

      // Prepare documents - each item becomes a separate document with timestamps
      const timestamp = new Date();
      const documents = data.map((item) => ({
        ...item,
        created_at: timestamp,
        updated_at: timestamp,
      }));

      // Insert all documents in bulk for efficiency
      await model.insertMany(documents);

      this.logger.log(
        `Successfully saved ${documents.length} documents to ${this.config.collectionName}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to save data to MongoDB: ${errorMessage}`);
      // Don't throw - allow scraper to complete even if persistence fails
    }
  }

  /**
   * Get a random proxy from the ProxyService
   * @returns Random proxy URL or undefined if no proxies available
   */
  protected getRandomProxy(): string | undefined {
    return this.proxyService?.getRandomProxy();
  }

  /**
   * Create an Impit client instance with random proxy rotation
   * Each call returns a new instance with a different random proxy from ProxyService
   * @returns Configured Impit instance
   */
  protected createImpitClient(): Impit {
    const proxy = this.getRandomProxy();

    if (proxy) {
      this.logger.debug(
        `Creating Impit client with proxy: ${proxy.split('@')[1] || 'masked'}`,
      );
      return new Impit({
        proxyUrl: proxy,
      });
    }

    this.logger.debug('Creating Impit client without proxy');
    return new Impit();
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

      // Save scraped data to MongoDB if connection is available
      if (Array.isArray(data) && data.length > 0 && this.connection) {
        try {
          const schema = this.getSchema();
          await this.saveScrapedData(data, schema);
        } catch {
          // If getSchema is not implemented, log and continue
          this.logger.warn(
            'getSchema not implemented, skipping data persistence',
          );
        }
      }

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
          ...this.getRunMetadata(),
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
          ...this.getRunMetadata(),
        },
      };
    }
  }

  /**
   * Extra per-run metrics to fold into the execution `metadata` (both on
   * success and failure). Scrapers that track partial-failure stats override
   * this; the default adds nothing, keeping existing scrapers unchanged.
   */
  protected getRunMetadata(): Record<string, unknown> {
    return {};
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

  /**
   * Get the Mongoose schema for data persistence
   * Override this method in scrapers that need to persist data
   */
  getSchema(): MongooseSchema {
    throw new Error(
      'getSchema() not implemented. Override this method to enable data persistence.',
    );
  }
}
