import { Module } from '@nestjs/common';
import { ScraperBuilderController } from './scraper-builder.controller';
import { ScraperBuilderService } from './scraper-builder.service';

@Module({
  controllers: [ScraperBuilderController],
  providers: [ScraperBuilderService],
})
export class ScraperBuilderModule {}
