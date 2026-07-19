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

interface SezaneLink {
  link: string;
  category: string;
  subCategory: string;
}

interface SezaneCategory {
  main: ProductCategory;
  subs: string[];
}

const CATEGORIES: SezaneCategory[] = [
  {
    main: ProductCategory.CLOTHING,
    subs: [
      'the-knitwear-gallery',
      'Tops',
      'dresses',
      'jackets',
      'coats',
      'bottoms/trousers',
      'denim',
      'skirts-shorts',
      't-shirts-sweatshirts-marinieres',
    ],
  },
  { main: ProductCategory.SHOES, subs: ['shoes'] },
  { main: ProductCategory.BAGS, subs: ['bags-wallets'] },
  { main: ProductCategory.JEWELRY, subs: ['jewelry'] },
  {
    main: ProductCategory.ACCESSORIES,
    subs: ['belts', 'scarves-square-scarves', 'our-socks', 'gift-ideas'],
  },
];

const LISTING_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  Referer: 'https://www.sezane.com/us-en/collection/bags-wallets',
};

const API_HEADERS = {
  Accept: '*/*,application/json',
  'User-Agent': 'android/1.5.11',
  appversion: '1.5.11',
  platform: 'ANDROID',
  'x-api-key':
    'h4ZmStd8N66SQlw1rQdVBG4OlpLKrXeNUhOlX7DhdPOabeIw3x5XDlZf2RkSUIhg',
};

/**
 * Sezane scraper. Discovers products from collection pages (HTML → cheerio) and
 * fetches details from the public `api.sezane.com` store-product endpoint.
 * Port of the Python `SezaneScraper`. Demonstrates the HTML link-extraction
 * path shared by the ~26 BeautifulSoup-based scrapers.
 */
export class SezaneScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'sezane',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.sezane.com/us-en',
        metadata: {
          name: 'Sézane',
          description: 'Scrapes Sézane collections (HTML) + store-product API',
          tags: ['sezane', 'shopping'],
        },
        collectionName: 'sezane',
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

  private async getLinks(): Promise<SezaneLink[]> {
    const links: SezaneLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        const url = `https://www.sezane.com/us-en/collection/${sub}`;
        try {
          const html = await this.http.getText(url, {
            headers: LISTING_HEADERS,
          });
          this.stats.pagesFetched++;

          const $ = cheerio.load(html);
          $('div.o-container.u-mt-md')
            .find('a.u-link-unstyled')
            .each((_, el) => {
              const href = $(el).attr('href');
              if (!href) {
                return;
              }
              const link = href.split('#')[0];
              if (!seen.has(link)) {
                seen.add(link);
                links.push({
                  link,
                  category: category.main,
                  subCategory: sub,
                });
              }
            });
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${sub} in ${category.main}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: SezaneLink,
  ): Promise<ScrapedProduct | null> {
    const params = new URLSearchParams({
      brand: 'sezane',
      currency: 'usd',
      locale: 'en',
      path: linkData.link,
      site: 'us',
    });
    const apiUrl = `https://api.sezane.com/ecommerce-public/v1/store-product?${params.toString()}`;

    let body: string;
    try {
      body = await this.http.getText(apiUrl, { headers: API_HEADERS });
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
      const data = JSON.parse(body).selectedVariant;
      if (!data) {
        return null;
      }

      const name: string = data.productLabel ?? '';
      const price = data.price ?? null;
      const description: string = Array.isArray(data.technicalDescription)
        ? data.technicalDescription.join(' ')
        : '';
      const color: string = data.label ?? '';

      return buildProduct({
        url: `https://www.sezane.com${linkData.link}`,
        name,
        marketplace: 'SEZANE',
        category: linkData.category,
        subCategory: linkData.subCategory,
        description,
        brand: 'SEZANE',
        price,
        discountedPrice: null,
        currency: 'USD',
        images: this.extractImages(data),
        colors: this.extractColors(color),
        materials: extractMaterialsFromText(description),
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

  private extractImages(data: Record<string, any>): ScrapedProductImage[] {
    const photos: Record<string, any>[] = data.photos ?? [];
    return photos.map((photo, idx) => ({
      url: photo.mainUrl,
      name: photo.alt ?? '',
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(color: string): string[] {
    if (!color || !color.trim()) {
      return [];
    }
    const parts = color.replace(/\//g, ' ').split(/\s+/);
    const found = new Set<string>();
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed && !/^\d+$/.test(trimmed)) {
        const token = formatEnum(trimmed);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
