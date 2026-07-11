import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapersController } from './scrapers.controller';
import { ScrapersService } from './scrapers.service';
import { CategoryOrchestrator } from './category-orchestrator';
import { SchemaGeneratorService } from './schema-generator';
import { SchemaGeneratorController } from './schema-generator/schema-generator.controller';
import { ProxyService } from './services/proxy.service';
import {
  ScraperConfigEntity,
  ScraperConfigSchema,
  ScraperExecutionEntity,
  ScraperExecutionSchema,
} from './schemas';
import {
  ScraperRequest,
  ScraperRequestSchema,
} from './schemas/scraper-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScraperConfigEntity.name, schema: ScraperConfigSchema },
      { name: ScraperExecutionEntity.name, schema: ScraperExecutionSchema },
      { name: ScraperRequest.name, schema: ScraperRequestSchema },
    ]),
  ],
  controllers: [ScrapersController, SchemaGeneratorController],
  providers: [
    ScrapersService,
    CategoryOrchestrator,
    SchemaGeneratorService,
    ProxyService,
  ],
  exports: [ScrapersService, CategoryOrchestrator, SchemaGeneratorService],
})
export class ScrapersModule {}
