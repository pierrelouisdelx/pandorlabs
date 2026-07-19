import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import { Connection } from 'mongoose';
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
  colorKeywords,
  materialKeywords,
  extractPrice,
} from '../../utils/product-fields';
import { MADEWELL_CATEGORIES } from './madewell.categories';

interface MadewellLink {
  link: string;
  category: string;
  subcategory: string;
}

const HEADERS = {
  Accept: '*/*',
  Referer: 'https://www.madewell.com/womens/shoes/',
};

/**
 * Madewell scraper. Discovers products from paginated PLP pages (HTML →
 * cheerio) and parses the PDP for name/price/images/colors/materials.
 * Port of the Python `MadewellScraper`.
 *
 * Cookie/anti-bot note: the source required real-browser cookies
 * (`self.cookies`). That cookie manager isn't ported — requests go out
 * without them, per the porting guide, and are expected to be blocked
 * (degrading gracefully via `fetchErrors`).
 */
export class MadewellScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'madewell',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.madewell.com',
        metadata: {
          name: 'Madewell',
          description: 'Scrapes Madewell PLP/PDP HTML pages',
          tags: ['madewell', 'shopping'],
        },
        collectionName: 'madewell',
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

    for (const linkData of links) {
      const product = await this.fetchAndParse(linkData);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<MadewellLink[]> {
    const links: MadewellLink[] = [];
    const seen = new Set<string>();

    for (const category of MADEWELL_CATEGORIES) {
      for (const sub of category.subs) {
        let offset = 0;
        while (true) {
          let url = `https://www.madewell.com${sub.link}`;
          // Mirrors the source's offset-appending logic (`if not url.find("?")`),
          // which is effectively always false, so it always appends via "?".
          url += (url.indexOf('?') === 0 ? '&' : '?') + 'offset=' + offset;

          let html: string;
          try {
            html = await this.http.getText(url, { headers: HEADERS });
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch Madewell ${sub.name} offset ${offset}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const $ = cheerio.load(html);
          const productLinks = $('a.ProductTile_productTileImgLink__6VjK2');
          if (productLinks.length === 0) {
            break;
          }

          productLinks.each((_, el) => {
            const href = $(el).attr('href');
            if (!href) {
              return;
            }
            const link = `https://www.madewell.com${href}`;
            if (!seen.has(link)) {
              seen.add(link);
              links.push({
                link,
                category: category.main,
                subcategory: sub.name,
              });
            }
          });

          offset += productLinks.length;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: MadewellLink,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(linkData.link, { headers: HEADERS });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const $ = cheerio.load(html);
      const nameEl = $('h1[itemprop="name"]');
      if (nameEl.length === 0) {
        throw new Error('Name is missing');
      }
      const name = nameEl.text().trim();

      const descriptionEl = $('p[data-testid="description"]');
      const description =
        descriptionEl.length > 0 ? descriptionEl.text().trim() : null;

      const [price, discountedPrice] = this.parsePrices($);

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'MADEWELL',
        category: linkData.category,
        subCategory: linkData.subcategory,
        description,
        brand: 'MADEWELL',
        price,
        discountedPrice,
        currency: 'USD',
        images: this.extractImages($),
        colors: this.extractColors($),
        materials: this.extractMaterials($),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private parsePrices($: CheerioAPI): [number | null, number | null] {
    const originalEl = $('span[aria-label="Original Price"]').first();
    const finalSaleEl = $('span[aria-label="Final Sale Price"]').first();

    let price: number | null = null;
    let discountedPrice: number | null = null;

    const hasOriginal = originalEl.length > 0;
    const hasFinalSale = finalSaleEl.length > 0;

    if (hasFinalSale && !hasOriginal) {
      price = extractPrice(finalSaleEl.text().trim());
    }
    if (!hasFinalSale && hasOriginal) {
      price = extractPrice(originalEl.text().trim());
    }
    if (hasFinalSale && hasOriginal) {
      price = extractPrice(originalEl.text().trim());
      discountedPrice = extractPrice(finalSaleEl.text().trim());
    }

    if (
      price !== null &&
      discountedPrice !== null &&
      discountedPrice >= price
    ) {
      discountedPrice = null;
    }

    return [price, discountedPrice];
  }

  private extractImages($: CheerioAPI): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    $('button[role="pdpGridImage"]').each((idx, el) => {
      const img = $(el).find('img').first();
      const url = img.attr('src');
      if (url) {
        images.push({
          url,
          name: img.attr('alt') ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors($: CheerioAPI): string[] {
    const found = new Set<string>();
    $('span[data-role="swatch"]').each((_, swatch) => {
      const img = $(swatch).find('img').first();
      const colorName = img.attr('alt');
      if (!colorName) {
        return;
      }
      let matched = false;
      for (const keyword of colorKeywords) {
        if (colorName.toLowerCase().includes(keyword.toLowerCase())) {
          const token = formatEnum(keyword);
          if (token) {
            found.add(token);
            matched = true;
          }
        }
      }
      if (!matched) {
        const token = formatEnum(colorName);
        if (token) {
          found.add(token);
        }
      }
    });
    return [...found];
  }

  private extractMaterials($: CheerioAPI): string[] {
    const found = new Set<string>();
    const descriptionList = $('ul[data-testid="shotDescription"]');
    if (descriptionList.length === 0) {
      return [];
    }

    const patterns = [
      /Upper:\s*(\d+%\s*\w+)/gi,
      /Lining:\s*(\d+%\s*\w+)/gi,
      /Sole:\s*([^.]+)/gi,
      /(\d+%\s*\w+)/gi,
    ];

    descriptionList.find('li').each((_, item) => {
      const text = $(item).text();
      for (const pattern of patterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const matchedText = match[1] ?? '';
          for (const keyword of materialKeywords) {
            if (matchedText.toLowerCase().includes(keyword.toLowerCase())) {
              const token = formatEnum(keyword);
              if (token) {
                found.add(token);
              }
            }
          }
        }
      }
    });

    return [...found];
  }
}
