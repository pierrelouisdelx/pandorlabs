import { Module } from '@nestjs/common';
import { ScrapersController } from './scrapers.controller';
import { ScrapersService } from './scrapers.service';
import { ScraperFactory } from './scraper.factory';
import { RealEstateAdapter } from './adapters/real-estate/real-estate.adapter';
import { LeadGenerationAdapter } from './adapters/lead-generation/lead-generation.adapter';

@Module({
  controllers: [ScrapersController],
  providers: [
    ScrapersService,
    ScraperFactory,
    RealEstateAdapter,
    LeadGenerationAdapter,
  ],
  exports: [ScraperFactory],
})
export class ScrapersModule {}
