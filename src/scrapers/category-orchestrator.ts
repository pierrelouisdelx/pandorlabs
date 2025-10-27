import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseCategoryOrchestrator } from './base/base-category-orchestrator.abstract';
import { RealEstateCategory } from './categories';

@Injectable()
export class CategoryOrchestrator
  extends BaseCategoryOrchestrator
  implements OnModuleInit
{
  constructor() {
    super();
    this.logger.log('CategoryOrchestrator initialized');
  }

  async onModuleInit() {
    this.logger.log('CategoryOrchestrator module initialization starting...');

    this.registerAllCategory();

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
}
