import { Injectable } from '@nestjs/common';
import { BaseAdapter } from '../../base';
import { ScraperCategory } from '../../enums';
import { IScraper, ScraperConfig } from '../../interfaces';
import { LeadGenerationScraper } from './lead-generation-scraper';

/**
 * Adapter for Lead Generation category scrapers
 */
@Injectable()
export class LeadGenerationAdapter extends BaseAdapter {
  constructor() {
    super(ScraperCategory.LEAD_GENERATION);
  }

  protected registerScrapers(): void {
    // Register all supported lead generation scraper IDs
    this.supportedScrapers.set('linkedin', {
      name: 'LinkedIn',
      description: 'Lead generation from LinkedIn profiles',
    });
    this.supportedScrapers.set('twitter', {
      name: 'Twitter/X',
      description: 'Lead generation from Twitter/X profiles',
    });
    this.supportedScrapers.set('hunter', {
      name: 'Hunter.io',
      description: 'Email finder and verification',
    });
  }

  async getScraper(
    scraperId: string,
    config?: Partial<ScraperConfig>,
  ): Promise<IScraper> {
    if (!this.supports(scraperId)) {
      throw new Error(`Unsupported scraper ID: ${scraperId}`);
    }

    const scraperConfig: ScraperConfig = {
      scraperId,
      category: this.category,
      ...config,
    };

    return new LeadGenerationScraper(scraperId, scraperConfig);
  }

  protected async onValidateConfig(config: ScraperConfig): Promise<boolean> {
    // Lead generation specific validation
    if (config.options?.maxLeads && config.options.maxLeads <= 0) {
      this.logger.error('maxLeads must be greater than 0');
      return false;
    }

    return true;
  }
}
