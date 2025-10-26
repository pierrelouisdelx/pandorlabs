import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiQueryModule } from './ai-query/ai-query.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { ScraperBuilderModule } from './scraper-builder/scraper-builder.module';
import { UsersModule } from './users/users.module';
import { configurations } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configurations,
      envFilePath: '.env',
    }),
    AiQueryModule,
    ScrapersModule,
    ScraperBuilderModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
