import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseCategoryOrchestrator } from './base/base-category-orchestrator.abstract';
import { RealEstateCategory } from './categories';
import {
  ScraperConfigEntity,
  ScraperConfigDocument,
} from './schemas/scraper-config.schema';

@Injectable()
export class CategoryOrchestrator
  extends BaseCategoryOrchestrator
  implements OnModuleInit
{
  constructor(
    @InjectModel(ScraperConfigEntity.name)
    private readonly configModel: Model<ScraperConfigDocument>,
  ) {
    super();
    this.logger.log('CategoryOrchestrator initialized');
  }

  async onModuleInit() {
    this.logger.log('CategoryOrchestrator module initialization starting...');

    this.registerAllCategory();

    // Seed scraper configurations to database
    await this.seedScraperConfigs();

    this.logger.log('CategoryOrchestrator module initialization complete');
    this.logger.log(`Registered categories: ${this.categories.size}`);
    this.logger.log(`Cache enabled: ${this.cacheEnabled}`);
    this.logger.log(`Max cache size: ${this.maxCacheSize}`);

    const supportedScrapers = this.getAllSupportedScrapers();
    supportedScrapers.forEach((scrapers, category) => {
      this.logger.log(
        `[${category}] Supported scrapers: ${scrapers.join(', ')}`,
      );
    });
  }

  private registerAllCategory(): void {
    this.registerCategory(new RealEstateCategory());
  }

  /**
   * Seed scraper configurations to database
   * Only inserts configs if scraperId doesn't already exist
   */
  private async seedScraperConfigs(): Promise<void> {
    this.logger.log('Seeding scraper configurations...');

    const allScrapers = this.getAllSupportedScrapers();
    let seededCount = 0;
    let skippedCount = 0;

    for (const [, scraperIds] of allScrapers) {
      for (const scraperId of scraperIds) {
        try {
          const scraper = await this.getScraper(scraperId);

          // Check if config already exists
          const existingConfig = await this.configModel
            .findOne({ scraperId })
            .lean();

          if (!existingConfig) {
            // Insert new config
            await this.configModel.create({
              scraperId: scraper.id,
              category: scraper.category,
              url: scraper.config.url,
              options: {},
              metadata: scraper.config.metadata,
              isActive: scraper.config.isActive,
              collectionName: scraper.config.collectionName,
              executionCount: 0,
            });

            this.logger.log(`✓ Seeded config for scraper: ${scraperId}`);
            seededCount++;
          } else {
            this.logger.log(`⊘ Config already exists for scraper: ${scraperId}`);
            skippedCount++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to seed config for scraper: ${scraperId}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    }

    this.logger.log(
      `Seeding complete: ${seededCount} seeded, ${skippedCount} skipped`,
    );
  }
}
