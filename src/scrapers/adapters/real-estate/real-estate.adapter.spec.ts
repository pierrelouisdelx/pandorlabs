import { Test, TestingModule } from '@nestjs/testing';
import { RealEstateAdapter } from './real-estate.adapter';
import { ScraperCategory } from '../../enums';
import { ScraperConfig } from '../../interfaces';

describe('RealEstateAdapter', () => {
  let adapter: RealEstateAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealEstateAdapter],
    }).compile();

    adapter = module.get<RealEstateAdapter>(RealEstateAdapter);
  });

  describe('category', () => {
    it('should have REAL_ESTATE category', () => {
      expect(adapter.category).toBe(ScraperCategory.REAL_ESTATE);
    });
  });

  describe('supports', () => {
    it('should support registered scraper IDs', () => {
      expect(adapter.supports('zillow')).toBe(true);
      expect(adapter.supports('realtor')).toBe(true);
      expect(adapter.supports('redfin')).toBe(true);
    });

    it('should not support unregistered scraper IDs', () => {
      expect(adapter.supports('unknown')).toBe(false);
      expect(adapter.supports('')).toBe(false);
    });
  });

  describe('listSupportedScrapers', () => {
    it('should list all supported scrapers', () => {
      const scrapers = adapter.listSupportedScrapers();
      expect(scrapers).toContain('zillow');
      expect(scrapers).toContain('realtor');
      expect(scrapers).toContain('redfin');
      expect(scrapers.length).toBe(3);
    });
  });

  describe('getScraper', () => {
    it('should create scraper for supported ID', async () => {
      const scraper = await adapter.getScraper('zillow');
      expect(scraper).toBeDefined();
      expect(scraper.id).toBe('zillow');
      expect(scraper.category).toBe(ScraperCategory.REAL_ESTATE);
    });

    it('should create scraper with custom config', async () => {
      const config: Partial<ScraperConfig> = {
        url: 'https://zillow.com',
        options: { maxResults: 100 },
      };

      const scraper = await adapter.getScraper('zillow', config);
      expect(scraper.config.url).toBe('https://zillow.com');
      expect(scraper.config.options?.maxResults).toBe(100);
    });

    it('should throw error for unsupported scraper ID', async () => {
      await expect(adapter.getScraper('unknown')).rejects.toThrow(
        'Unsupported scraper ID: unknown',
      );
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
        url: 'https://zillow.com',
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(true);
    });

    it('should reject invalid category', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.LEAD_GENERATION,
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(false);
    });

    it('should reject unsupported scraper ID', async () => {
      const config: ScraperConfig = {
        scraperId: 'unknown',
        category: ScraperCategory.REAL_ESTATE,
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(false);
    });

    it('should reject invalid URL', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
        url: 'invalid-url',
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(false);
    });
  });
});
