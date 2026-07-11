import { HttpException, HttpStatus } from '@nestjs/common';

export class ScraperNotFoundException extends HttpException {
  constructor(id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Scraper configuration '${id}' not found`,
        error: 'ScraperConfigNotFound',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ScraperExecutionException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Scraper execution failed: ${message}`,
        error: 'ScraperExecutionFailed',
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidScraperException extends HttpException {
  constructor(errors: string[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid scraper configuration',
        error: 'InvalidScraper',
        validationErrors: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ScraperInactiveException extends HttpException {
  constructor(id: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Scraper configuration '${id}' is inactive`,
        error: 'ScraperInactive',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class DuplicateScraperIdException extends HttpException {
  constructor(scraperId: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Scraper with ID '${scraperId}' already exists`,
        error: 'DuplicateScraperId',
      },
      HttpStatus.CONFLICT,
    );
  }
}
