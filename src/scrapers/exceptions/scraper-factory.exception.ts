import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception thrown by ScraperFactory operations
 */
export class ScraperFactoryException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class AdapterNotFoundException extends ScraperFactoryException {
  constructor(category: string) {
    super(`No adapter found for category: ${category}`, HttpStatus.NOT_FOUND);
  }
}

export class ScraperNotFoundException extends ScraperFactoryException {
  constructor(scraperId: string) {
    super(`Scraper not found: ${scraperId}`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidConfigException extends ScraperFactoryException {
  constructor(reason: string) {
    super(`Invalid scraper configuration: ${reason}`, HttpStatus.BAD_REQUEST);
  }
}
