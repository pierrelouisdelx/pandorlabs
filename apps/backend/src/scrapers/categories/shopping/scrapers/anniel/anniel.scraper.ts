import * as cheerio from 'cheerio';
import { Connection } from 'mongoose';
import { ProductCategory } from '@pandorlabs/types';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
} from '../../utils/product';
import {
  formatEnum,
  extractMaterialsFromText,
} from '../../utils/product-fields';

const CATEGORIES = [
  'ballet-flats',
  'heels',
  'loafers',
  'soft',
  'boots',
  'gladiator',
  'flat-sandals',
];

/**
 * Anniel scraper. Discovers products from category listing pages (HTML →
 * cheerio) and parses the product detail page. Port of the Python
 * `AnnielScraper`.
 */
export class AnnielScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'anniel',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.annielshop.com',
        metadata: {
          name: 'Anniel',
          description: 'Scrapes Anniel shoe category listing pages (HTML)',
          tags: ['anniel', 'shopping'],
        },
        collectionName: 'anniel',
        isActive: true,
      },
      connection,
      proxyService,
    );
  }

  protected async collectProducts(): Promise<ScrapedProduct[]> {
    const links = await this.getLinks();
    this.stats.linksFound = links.length;

    const products: ScrapedProduct[] = [];
    const seenUrls = new Set<string>();

    for (const link of links) {
      const product = await this.fetchAndParse(link);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<string[]> {
    const links: string[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      const url = `https://www.annielshop.com/${category}`;
      try {
        const html = await this.http.getText(url);
        this.stats.pagesFetched++;

        const $ = cheerio.load(html);
        $('a.ProductList-item-link').each((_, el) => {
          const href = $(el).attr('href');
          if (href && !seen.has(href)) {
            seen.add(href);
            links.push(href);
          }
        });
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to get links for ${category}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return links;
  }

  private async fetchAndParse(link: string): Promise<ScrapedProduct | null> {
    const url = `https://www.annielshop.com${link}`;
    let html: string;
    try {
      html = await this.http.getText(url);
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const $ = cheerio.load(html);
      const productSection = $('section.ProductItem-summary');
      if (productSection.length === 0) {
        this.logger.warn(`No product found for: ${url}`);
        return null;
      }

      const name = $('h1.ProductItem-details-title').first().text().trim();
      const priceText = $('div.product-price').first().text().trim();

      let color: string | null = null;
      let description: string | null = null;
      $('div.ProductItem-details-excerpt')
        .first()
        .find('p')
        .each((_, el) => {
          const text = $(el).text().trim();
          if (text.startsWith('Color:')) {
            color = text.replace('Color:', '').trim();
          } else if (text.startsWith('Description:')) {
            description = text.replace('Description:', '').trim();
          }
        });

      const categories = $('a.ProductItem-nav-breadcrumb-link');
      const subCategory =
        categories.length > 0 ? categories.first().text().trim() : null;

      return buildProduct({
        url,
        name,
        marketplace: 'ANNIEL',
        category: ProductCategory.SHOES,
        subCategory,
        description,
        brand: 'ANNIEL',
        price: priceText,
        discountedPrice: null,
        currency: 'EUR',
        images: this.extractImages($),
        colors: this.extractColors(color),
        materials: description ? extractMaterialsFromText(description) : [],
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages($: cheerio.CheerioAPI): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    $('img.ProductItem-gallery-slides-item-image').each((idx, el) => {
      const src = $(el).attr('data-image');
      if (!src) {
        return;
      }
      images.push({
        url: src,
        name: $(el).attr('alt') ?? '',
        isMain: idx === 0,
        order: images.length,
      });
    });
    return images;
  }

  private extractColors(color: string | null): string[] {
    if (!color || !color.trim()) {
      return [];
    }
    const token = formatEnum(color.trim());
    return token ? [token] : [];
  }
}
