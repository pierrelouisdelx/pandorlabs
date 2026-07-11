import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception for CategoryOrchestrator operations
 */
export class CategoryOrchestratorException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

/**
 * Exception thrown when a category is not found
 */
export class CategoryNotFoundException extends CategoryOrchestratorException {
  constructor(category: string) {
    super(`No category found for category: ${category}`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exception thrown when a scraper is not found within a category
 */
export class CategoryScraperNotFoundException extends CategoryOrchestratorException {
  constructor(scraperId: string, category: string) {
    super(
      `Category scraper not found for scraper ID: ${scraperId} in category: ${category}`,
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Exception thrown when scraper is invalid
 */
export class CategoryInvalidScraperException extends CategoryOrchestratorException {
  constructor(reason: string) {
    super(`Category invalid scraper: ${reason}`, HttpStatus.BAD_REQUEST);
  }
}
