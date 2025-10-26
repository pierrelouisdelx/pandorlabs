import { Test, TestingModule } from '@nestjs/testing';
import { LeadGenerationAdapter } from './lead-generation.adapter';
import { ScraperCategory } from '../../enums';
import { ScraperConfig } from '../../interfaces';

describe('LeadGenerationAdapter', () => {
  let adapter: LeadGenerationAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadGenerationAdapter],
    }).compile();

    adapter = module.get<LeadGenerationAdapter>(LeadGenerationAdapter);
  });

  describe('category', () => {
    it('should have LEAD_GENERATION category', () => {
      expect(adapter.category).toBe(ScraperCategory.LEAD_GENERATION);
    });
  });

  describe('supports', () => {
    it('should support registered scraper IDs', () => {
      expect(adapter.supports('linkedin')).toBe(true);
      expect(adapter.supports('twitter')).toBe(true);
      expect(adapter.supports('hunter')).toBe(true);
    });

    it('should not support unregistered scraper IDs', () => {
      expect(adapter.supports('unknown')).toBe(false);
    });
  });

  describe('listSupportedScrapers', () => {
    it('should list all supported scrapers', () => {
      const scrapers = adapter.listSupportedScrapers();
      expect(scrapers).toContain('linkedin');
      expect(scrapers).toContain('twitter');
      expect(scrapers).toContain('hunter');
      expect(scrapers.length).toBe(3);
    });
  });

  describe('getScraper', () => {
    it('should create scraper for supported ID', async () => {
      const scraper = await adapter.getScraper('linkedin');
      expect(scraper).toBeDefined();
      expect(scraper.id).toBe('linkedin');
      expect(scraper.category).toBe(ScraperCategory.LEAD_GENERATION);
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
        scraperId: 'linkedin',
        category: ScraperCategory.LEAD_GENERATION,
        options: { maxLeads: 100 },
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(true);
    });

    it('should reject invalid maxLeads', async () => {
      const config: ScraperConfig = {
        scraperId: 'linkedin',
        category: ScraperCategory.LEAD_GENERATION,
        options: { maxLeads: 0 },
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(false);
    });

    it('should reject negative maxLeads', async () => {
      const config: ScraperConfig = {
        scraperId: 'linkedin',
        category: ScraperCategory.LEAD_GENERATION,
        options: { maxLeads: -10 },
      };

      const isValid = await adapter.validateConfig(config);
      expect(isValid).toBe(false);
    });
  });
});
