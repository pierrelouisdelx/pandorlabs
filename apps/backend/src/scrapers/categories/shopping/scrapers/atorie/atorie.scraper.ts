import * as cheerio from 'cheerio';
import { Connection } from 'mongoose';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
  MAX_PRODUCT_IMAGES,
} from '../../utils/product';
import {
  extractMaterialsFromText,
  formatEnum,
} from '../../utils/product-fields';

interface AtorieCategory {
  name: string;
  subs: string[];
}

interface AtorieSearchItem {
  product: Record<string, any>;
}

interface AtorieLink {
  category: string;
  subcategory: string;
  data: AtorieSearchItem;
}

const CATEGORIES: AtorieCategory[] = [
  {
    name: 'clothing',
    subs: [
      'activewear',
      'dresses',
      'jackets & coats',
      'jeans',
      'loungewear',
      'pants',
      'shorts',
      'skirts',
      'suits & blazers',
      'sweaters',
      'swimwear',
      'tops',
    ],
  },
  {
    name: 'shoes',
    subs: ['boots', 'flats', 'heels', 'sandals', 'slippers', 'sneakers'],
  },
  {
    name: 'accessories',
    subs: [
      'belts',
      'gloves',
      'hair accessories',
      'hats',
      'jewelry',
      'keychains',
      'scarves',
      'sunglasses',
      'wallets',
      'watches',
    ],
  },
  {
    name: 'bags',
    subs: [
      'backpacks',
      'clutches',
      'crossbody bags',
      'duffel bags',
      'mini bags',
      'shoulder bags',
      'tote bags',
    ],
  },
];

const SEARCH_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  'x-user-id': '3fc1c6a5-1c37-4b23-b5e1-76a648ee00bc',
  Origin: 'https://shopatorie.com',
  Referer: 'https://shopatorie.com/',
};

const PRODUCT_PAGE_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * Atorie scraper. Uses shopatorie's internal search POST API for link
 * discovery (the search response already carries most product fields) and
 * an extra HTML fetch per product purely to scrape gallery image URLs.
 * Port of the Python `AtorieScraper`.
 */
export class AtorieScraper extends FashionScraper {
  private readonly seenImages = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'atorie',
      ScraperCategory.SHOPPING,
      {
        url: 'https://shopatorie.com',
        metadata: {
          name: 'Atorie',
          description: 'Scrapes Atorie via the internal search POST API',
          tags: ['atorie', 'shopping'],
        },
        collectionName: 'atorie',
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

  /** POST a JSON body via the inherited proxied Impit client (no POST helper on FashionHttp). */
  private async postJson<T>(
    url: string,
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<T> {
    const client = this.createImpitClient();
    const response = await client.fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return JSON.parse(await response.text()) as T;
  }

  private async getLinks(): Promise<AtorieLink[]> {
    const links: AtorieLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      // Mirrors the source: `page`/`cursor` are reset once per *category*,
      // not per subcategory — likely a bug in the original, ported as-is.
      let page = 1;
      let cursor = '';

      for (const sub of category.subs) {
        while (true) {
          const subcategory = sub !== category.name ? sub : '';
          try {
            const data = await this.postJson<{
              results?: { product: Record<string, any> }[];
              pagination?: { cursor?: string };
            }>(
              'https://v3tf3awigg.us-west-2.awsapprunner.com/search',
              {
                query: '',
                page,
                limit: 192,
                filters: {
                  category: category.name,
                  subcategory,
                  color: [],
                  target_gender: 'womenswear',
                  minPrice: 0,
                  maxPrice: 1000,
                },
                cursor,
                skipAutoParsing: true,
              },
              SEARCH_HEADERS,
            );
            this.stats.pagesFetched++;

            const results = data.results ?? [];
            for (const item of results) {
              const handle = item.product?.handle;
              if (handle && !seen.has(handle)) {
                seen.add(handle);
                links.push({
                  category: category.name,
                  subcategory,
                  data: item,
                });
              }
            }

            // Mirrors the source's loop-termination check: stop once a page
            // comes back empty, or its first item is one we've already seen
            // (a sign the API looped back to the start).
            if (
              results.length === 0 ||
              seen.has(results[0]?.product?.handle ?? '')
            ) {
              break;
            }

            cursor = data.pagination?.cursor ?? '';
            page++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub} in ${category.name}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: AtorieLink,
  ): Promise<ScrapedProduct | null> {
    const handle = linkData.data.product?.handle;
    const url = `https://shopatorie.com/products/${handle}`;

    let images: string[] = [];
    try {
      const html = await this.http.getText(url, {
        headers: PRODUCT_PAGE_HEADERS,
      });
      this.stats.pagesFetched++;

      const $ = cheerio.load(html);
      const div = $('div[data-sentry-component="ProductHeroStickyGrid"]');
      images = div
        .find('img')
        .toArray()
        .map((el) => $(el).attr('src'))
        .filter((src): src is string => Boolean(src));
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch (persist) failed for ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const productData = linkData.data.product;
      const name: string = productData.title ?? '';
      const brand: string = productData.vendor ?? '';

      let price: number | null = null;
      const minVariantAmount = productData.priceRange?.minVariantPrice?.amount;
      if (minVariantAmount !== undefined && minVariantAmount !== null) {
        const amount = Number(minVariantAmount);
        price = Number.isNaN(amount) ? null : Math.trunc(amount * 100);
      }

      let subCategory = linkData.subcategory;
      if (productData.productType) {
        subCategory = productData.productType;
      }

      // Faithful port of a likely bug in the source: it looks up
      // `product_data["product"]["options"]`, i.e. one level too deep
      // (product_data *is* already the product), so this virtually always
      // resolves to an empty options list.
      let color: string | null = null;
      const options: Record<string, any>[] = productData.product?.options ?? [];
      for (const option of options) {
        if ((option.name ?? '').toLowerCase() === 'color') {
          const colors = option.values ?? [];
          if (colors.length > 0) {
            color = colors[0];
            break;
          }
        }
      }

      return buildProduct({
        url,
        name,
        marketplace: 'ATORIE',
        category: linkData.category,
        subCategory,
        description: '',
        brand,
        price,
        discountedPrice: null,
        images: this.extractImages(productData, images),
        colors: this.extractColors(color),
        materials: extractMaterialsFromText(name),
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

  private extractImages(
    productData: Record<string, any>,
    images: string[],
  ): ScrapedProductImage[] {
    const result: ScrapedProductImage[] = [];

    const featured = productData.featuredImage;
    if (featured?.url && !this.seenImages.has(featured.url)) {
      this.seenImages.add(featured.url);
      result.push({
        url: featured.url,
        name: featured.altText ?? 'Product Image',
        isMain: true,
        order: result.length,
      });
    }

    for (const raw of images) {
      if (result.length >= MAX_PRODUCT_IMAGES) {
        break;
      }
      const url = raw.split('?')[0];
      if (this.seenImages.has(url)) {
        continue;
      }
      this.seenImages.add(url);
      result.push({ url, name: '', isMain: false, order: result.length });
    }

    return result;
  }

  private extractColors(color: string | null): string[] {
    const token = formatEnum(color);
    return token ? [token] : [];
  }
}
