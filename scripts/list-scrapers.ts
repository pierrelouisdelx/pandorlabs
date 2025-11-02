#!/usr/bin/env ts-node
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScrapersService } from '../src/scrapers/scrapers.service';

const logger = new Logger('ListScrapersCLI');

async function listScrapers(): Promise<void> {
  let app;

  try {
    logger.log('Initializing NestJS application...');
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    const scrapersService = app.get(ScrapersService);

    // Get all supported scrapers
    const supported = scrapersService.getAllSupportedScrapers();

    console.log('\n=== Available Scrapers ===\n');

    for (const [category, scraperIds] of Object.entries(supported)) {
      console.log(`📁 Category: ${category}`);
      scraperIds.forEach((scraperId) => {
        console.log(`  ├─ ${scraperId}`);
      });
      console.log('');
    }

    // Get scraper configs from database
    const configs = await scrapersService.findAll({ page: 1, limit: 100 });

    if (configs.data.length > 0) {
      console.log('=== Scraper Configurations ===\n');

      for (const config of configs.data) {
        console.log(`🔧 ${config.scraperId}`);
        console.log(`   ID: ${config.id}`);
        console.log(`   Category: ${config.category}`);
        console.log(`   URL: ${config.url}`);
        console.log(
          `   Status: ${config.isActive ? '✅ Active' : '❌ Inactive'}`,
        );
        console.log(`   Executions: ${config.executionCount || 0}`);
        if (config.lastExecutedAt) {
          console.log(
            `   Last run: ${new Date(config.lastExecutedAt).toLocaleString()}`,
          );
        }
        console.log('');
      }
    } else {
      console.log('ℹ️  No scraper configurations found in database');
      console.log(
        '   Create configs to use scrapers with the --config option\n',
      );
    }

    // Get cache stats
    const cacheStats = scrapersService.getCacheStats();
    console.log('=== Cache Statistics ===\n');
    console.log(`Total cached scrapers: ${cacheStats.size}`);
    console.log('');
  } catch (error) {
    logger.error('Failed to list scrapers:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

// Only run if executed directly
if (require.main === module) {
  listScrapers();
}

export { listScrapers };
