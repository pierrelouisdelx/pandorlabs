import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapersController } from './scrapers.controller';
import { ScrapersService } from './scrapers.service';
import { CategoryOrchestrator } from './category-orchestrator';
import {
  ScraperConfigEntity,
  ScraperConfigSchema,
  ScraperExecutionEntity,
  ScraperExecutionSchema,
} from './schemas';
import { RealEstateAdapter } from './adapters';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScraperConfigEntity.name, schema: ScraperConfigSchema },
      { name: ScraperExecutionEntity.name, schema: ScraperExecutionSchema },
    ]),
  ],
  controllers: [ScrapersController],
  providers: [ScrapersService, CategoryOrchestrator, RealEstateAdapter],
  exports: [ScrapersService, CategoryOrchestrator],
})
export class ScrapersModule {}
