import { Test, TestingModule } from '@nestjs/testing';
import { ScraperFactory } from './scraper.factory';
import { RealEstateAdapter } from './adapters/real-estate/real-estate.adapter';
import { LeadGenerationAdapter } from './adapters/lead-generation/lead-generation.adapter';
import { ScraperCategory } from './enums';
import { ScraperConfig } from './interfaces';
import {
  AdapterNotFoundException,
  InvalidConfigException,
} from './exceptions/scraper-factory.exception';

describe('ScraperFactory', () => {
  let factory: ScraperFactory;
  let realEstateAdapter: RealEstateAdapter;
  let leadGenAdapter: LeadGenerationAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperFactory, RealEstateAdapter, LeadGenerationAdapter],
    }).compile();

    factory = module.get<ScraperFactory>(ScraperFactory);
    realEstateAdapter = module.get<RealEstateAdapter>(RealEstateAdapter);
    leadGenAdapter = module.get<LeadGenerationAdapter>(LeadGenerationAdapter);

    // Register adapters
    factory.registerAdapter(realEstateAdapter);
    factory.registerAdapter(leadGenAdapter);
  });

  afterEach(() => {
    factory.clearCache();
  });

  describe('registerAdapter', () => {
    it('should register an adapter successfully', () => {
      const categories = factory.getRegisteredCategories();
      expect(categories).toContain(ScraperCategory.REAL_ESTATE);
      expect(categories).toContain(ScraperCategory.LEAD_GENERATION);
    });

    it('should replace existing adapter with warning', () => {
      const newAdapter = new RealEstateAdapter();
      factory.registerAdapter(newAdapter);
      expect(factory.hasAdapter(ScraperCategory.REAL_ESTATE)).toBe(true);
    });
  });

  describe('createScraper', () => {
    it('should create a scraper successfully', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
      };

      const scraper = await factory.createScraper(config);

      expect(scraper).toBeDefined();
      expect(scraper.id).toBe('zillow');
      expect(scraper.category).toBe(ScraperCategory.REAL_ESTATE);
    });

    it('should throw AdapterNotFoundException for invalid category', async () => {
      const config: ScraperConfig = {
        scraperId: 'test',
        category: 'INVALID_CATEGORY' as ScraperCategory,
      };

      await expect(factory.createScraper(config)).rejects.toThrow(
        AdapterNotFoundException,
      );
    });

    it('should throw InvalidConfigException for missing scraperId', async () => {
      const config: ScraperConfig = {
        scraperId: '',
        category: ScraperCategory.REAL_ESTATE,
      };

      await expect(factory.createScraper(config)).rejects.toThrow(
        InvalidConfigException,
      );
    });

    it('should throw InvalidConfigException for missing category', async () => {
      const config = {
        scraperId: 'zillow',
      } as ScraperConfig;

      await expect(factory.createScraper(config)).rejects.toThrow(
        InvalidConfigException,
      );
    });

    it('should initialize scraper after creation', async () => {
      const config: ScraperConfig = {
        scraperId: 'linkedin',
        category: ScraperCategory.LEAD_GENERATION,
      };

      const scraper = await factory.createScraper(config);
      expect(scraper.status).toBeDefined();
    });
  });

  describe('caching', () => {
    it('should cache scrapers after creation', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
      };

      await factory.createScraper(config);
      const stats = factory.getCacheStats();

      expect(stats.size).toBe(1);
      expect(stats.items).toContain('zillow');
    });

    it('should return cached scraper on subsequent calls', async () => {
      const config: ScraperConfig = {
        scraperId: 'realtor',
        category: ScraperCategory.REAL_ESTATE,
      };

      const scraper1 = await factory.createScraper(config);
      const scraper2 = await factory.createScraper(config);

      expect(scraper1).toBe(scraper2);
    });

    it('should clear cache successfully', async () => {
      const config1: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
      };
      const config2: ScraperConfig = {
        scraperId: 'linkedin',
        category: ScraperCategory.LEAD_GENERATION,
      };

      await factory.createScraper(config1);
      await factory.createScraper(config2);

      expect(factory.getCacheStats().size).toBe(2);

      factory.clearCache();

      expect(factory.getCacheStats().size).toBe(0);
    });

    it('should remove specific item from cache', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
      };

      await factory.createScraper(config);
      expect(factory.getCacheStats().size).toBe(1);

      const removed = factory.removeFromCache('zillow');
      expect(removed).toBe(true);
      expect(factory.getCacheStats().size).toBe(0);
    });

    it('should enforce cache size limit', async () => {
      // Create more scrapers than cache limit
      // Assuming maxCacheSize is 100, create 101 scrapers
      const promises = [];
      for (let i = 0; i < 101; i++) {
        const config: ScraperConfig = {
          scraperId: `zillow-${i}`,
          category: ScraperCategory.REAL_ESTATE,
        };
        promises.push(factory.createScraper(config));
      }

      await Promise.all(promises);
      const stats = factory.getCacheStats();

      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe('getAdapter', () => {
    it('should return adapter for valid category', () => {
      const adapter = factory.getAdapter(ScraperCategory.REAL_ESTATE);
      expect(adapter).toBe(realEstateAdapter);
    });

    it('should throw AdapterNotFoundException for invalid category', () => {
      expect(() =>
        factory.getAdapter('INVALID' as ScraperCategory),
      ).toThrow(AdapterNotFoundException);
    });
  });

  describe('hasAdapter', () => {
    it('should return true for registered category', () => {
      expect(factory.hasAdapter(ScraperCategory.REAL_ESTATE)).toBe(true);
    });

    it('should return false for unregistered category', () => {
      expect(factory.hasAdapter(ScraperCategory.E_COMMERCE)).toBe(false);
    });
  });

  describe('getAllSupportedScrapers', () => {
    it('should return all supported scrapers across all adapters', () => {
      const scrapers = factory.getAllSupportedScrapers();

      expect(scrapers.has(ScraperCategory.REAL_ESTATE)).toBe(true);
      expect(scrapers.has(ScraperCategory.LEAD_GENERATION)).toBe(true);

      const realEstateScrapers = scrapers.get(ScraperCategory.REAL_ESTATE);
      expect(realEstateScrapers).toContain('zillow');
      expect(realEstateScrapers).toContain('realtor');
      expect(realEstateScrapers).toContain('redfin');

      const leadGenScrapers = scrapers.get(ScraperCategory.LEAD_GENERATION);
      expect(leadGenScrapers).toContain('linkedin');
      expect(leadGenScrapers).toContain('twitter');
      expect(leadGenScrapers).toContain('hunter');
    });
  });

  describe('getCacheStats', () => {
    it('should return correct cache statistics', async () => {
      const config: ScraperConfig = {
        scraperId: 'zillow',
        category: ScraperCategory.REAL_ESTATE,
      };

      await factory.createScraper(config);
      const stats = factory.getCacheStats();

      expect(stats.size).toBe(1);
      expect(stats.enabled).toBe(true);
      expect(stats.maxSize).toBeGreaterThan(0);
      expect(stats.items).toEqual(['zillow']);
    });
  });
});
