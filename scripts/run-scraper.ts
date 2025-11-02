#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScrapersService } from '../src/scrapers/scrapers.service';
import { Logger } from '@nestjs/common';
import * as process from 'process';

const logger = new Logger('RunScraperCLI');

interface RunScraperOptions {
  scraperId: string;
  configId?: string;
  overrideUrl?: string;
  overrideOptions?: Record<string, any>;
}

/**
 * Parse command line arguments
 * Usage: npm run scraper -- --scraper auction [--config configId] [--url override] [--options '{}']
 */
function parseArgs(): RunScraperOptions {
  const args = process.argv.slice(2);
  const options: Partial<RunScraperOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--scraper':
      case '-s':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('--scraper requires a scraper ID');
        }
        options.scraperId = nextArg;
        i++;
        break;

      case '--config':
      case '-c':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('--config requires a config ID');
        }
        options.configId = nextArg;
        i++;
        break;

      case '--url':
      case '-u':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('--url requires a URL');
        }
        options.overrideUrl = nextArg;
        i++;
        break;

      case '--options':
      case '-o':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('--options requires a JSON object');
        }
        try {
          options.overrideOptions = JSON.parse(nextArg);
        } catch (error) {
          throw new Error('--options must be valid JSON');
        }
        i++;
        break;

      case '--help':
      case '-h':
        printHelp();
        process.exit(0);

      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }

  if (!options.scraperId) {
    throw new Error('--scraper is required');
  }

  return options as RunScraperOptions;
}

function printHelp(): void {
  console.log(`
Run Scraper CLI

Usage: npm run scraper -- --scraper <scraperId> [options]

Options:
  --scraper, -s <id>      Required. Scraper ID to run (e.g., 'auction')
  --config, -c <id>       Optional. MongoDB config ID to use
  --url, -u <url>         Optional. Override the scraper URL
  --options, -o <json>    Optional. Override scraper options (JSON string)
  --help, -h              Show this help message

Examples:
  # Run auction scraper with default config
  npm run scraper -- --scraper auction

  # Run with specific config ID
  npm run scraper -- --scraper auction --config 507f1f77bcf86cd799439011

  # Run with URL override
  npm run scraper -- --scraper auction --url "https://example.com"

  # Run with custom options
  npm run scraper -- --scraper auction --options '{"maxPages":5,"delay":1000}'

  # List available scrapers
  npm run scraper:list
  `);
}

async function runScraper(options: RunScraperOptions): Promise<void> {
  let app;

  try {
    logger.log('Initializing NestJS application...');
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const scrapersService = app.get(ScrapersService);

    // If configId provided, use existing config
    if (options.configId) {
      logger.log(`Running scraper with config ID: ${options.configId}`);

      const executeDto = {
        configId: options.configId,
        overrideOptions: options.overrideOptions || {},
      };

      const execution = await scrapersService.executeScraper(executeDto);
      logger.log(`Execution started with ID: ${execution.id}`);
      logger.log(`Status: ${execution.status}`);

      // Wait a bit for execution to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await scrapersService.findExecutionById(execution.id);
      logger.log(`Final status: ${result.status}`);
      if (result.itemsScraped !== undefined) {
        logger.log(`Items scraped: ${result.itemsScraped}`);
      }
      if (result.error) {
        logger.error(`Error: ${result.error.message}`);
      }
    } else {
      // Find or create config for this scraper
      logger.log(`Looking for config for scraper: ${options.scraperId}`);

      const configs = await scrapersService.findAll({
        page: 1,
        limit: 1,
        search: options.scraperId,
      });

      let configId: string;

      if (configs.data.length > 0) {
        configId = configs.data[0].id;
        logger.log(`Found existing config: ${configId}`);
      } else {
        logger.warn(`No config found for scraper: ${options.scraperId}`);
        logger.log('Please create a config first or use --config option');
        process.exit(1);
      }

      const executeDto = {
        configId,
        overrideOptions: {
          ...(options.overrideUrl ? { url: options.overrideUrl } : {}),
          ...(options.overrideOptions || {}),
        },
      };

      const execution = await scrapersService.executeScraper(executeDto);
      logger.log(`Execution started with ID: ${execution.id}`);
      logger.log(`Status: ${execution.status}`);
    }

    logger.log('Scraper execution completed successfully');
  } catch (error) {
    logger.error('Failed to run scraper:', error);
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.stack) {
        logger.debug(error.stack);
      }
    }
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

async function main(): Promise<void> {
  try {
    const options = parseArgs();
    await runScraper(options);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('Unknown error occurred');
    }
    printHelp();
    process.exit(1);
  }
}

// Only run if executed directly
if (require.main === module) {
  main();
}

export { runScraper, parseArgs };
