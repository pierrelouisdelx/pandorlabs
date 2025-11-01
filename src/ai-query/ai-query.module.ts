import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiQueryController } from './ai-query.controller';
import { AiQueryService } from './ai-query.service';
import { LLMProviderService } from './providers/llm-provider.service';
import { ScrapersModule } from '@scrapers/scrapers.module';

@Module({
  imports: [
    ConfigModule,
    ScrapersModule,
  ],
  controllers: [AiQueryController],
  providers: [
    AiQueryService,
    LLMProviderService,
  ],
  exports: [AiQueryService, LLMProviderService],
})
export class AiQueryModule {}
