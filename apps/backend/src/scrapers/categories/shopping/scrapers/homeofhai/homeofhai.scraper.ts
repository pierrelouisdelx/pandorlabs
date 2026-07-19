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
  colorKeywords,
  formatEnum,
  materialKeywords,
} from '../../utils/product-fields';

interface HaiCategory {
  main: string;
  handle: string;
}

const CATEGORIES: HaiCategory[] = [
  { main: 'bags', handle: 'bags' },
  { main: 'clothing', handle: 'clothes' },
  { main: 'shoes', handle: 'shoes' },
  { main: 'jewelry', handle: 'jewellery' },
  { main: 'accessories', handle: 'accessories' },
];

const STORE_URL = 'https://so-hai-store.myshopify.com';
const MAX_PAGES_PER_HANDLE = 20;

interface ShopifyRawProduct {
  title?: string;
  handle?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  options?: { name?: string; values?: string[] }[];
  variants?: {
    available?: boolean;
    price?: string;
    compare_at_price?: string | null;
  }[];
  images?: { src?: string; alt?: string }[];
}

/**
 * HomeOfHai scraper.
 *
 * The Python source used Shopify's authenticated Storefront GraphQL API (a
 * POST request with a bearer-style access token) to fetch full collections in
 * one call. `FashionHttp` only exposes GET, so this is ported to the
 * equivalent public REST endpoint (`/collections/{handle}/products.json`,
 * paginated) that every Shopify storefront exposes without auth — same data
 * source (so-hai-store.myshopify.com), same category handles, same field
 * extraction logic as the Python `_get_product_*` helpers.
 */
export class HomeOfHaiScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'homeofhai',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.homeofhai.com',
        metadata: {
          name: 'Home of Hai',
          description: 'Scrapes Home of Hai via the Shopify products.json API',
          tags: ['homeofhai', 'shopping'],
        },
        collectionName: 'homeofhai',
        isActive: true,
      },
      connection,
      proxyService,
    );
  }

  protected async collectProducts(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    const seenUrls = new Set<string>();
    const seenImages = new Set<string>();
    let linksFound = 0;

    for (const category of CATEGORIES) {
      linksFound += await this.scrapeHandle(
        category,
        products,
        seenUrls,
        seenImages,
      );
    }

    this.stats.linksFound = linksFound;
    return products;
  }

  private async scrapeHandle(
    category: HaiCategory,
    products: ScrapedProduct[],
    seenUrls: Set<string>,
    seenImages: Set<string>,
  ): Promise<number> {
    let found = 0;

    for (let page = 1; page <= MAX_PAGES_PER_HANDLE; page++) {
      const url = `${STORE_URL}/collections/${category.handle}/products.json?page=${page}`;

      let raw: { products?: ShopifyRawProduct[] };
      try {
        raw = await this.http.getJson<{ products?: ShopifyRawProduct[] }>(url, {
          headers: { Accept: 'application/json' },
        });
        this.stats.pagesFetched++;
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to fetch homeofhai ${category.handle} page ${page}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return found;
      }

      const pageProducts = raw.products ?? [];
      if (pageProducts.length === 0) {
        return found;
      }
      found += pageProducts.length;

      for (const rawProduct of pageProducts) {
        try {
          const product = this.parseProduct(
            rawProduct,
            category.main,
            seenImages,
          );
          if (!product || seenUrls.has(product.url)) {
            continue;
          }
          seenUrls.add(product.url);
          products.push(product);
          this.stats.itemsScraped++;
        } catch (error) {
          this.stats.itemsFailed++;
          this.logger.error(
            `Parsing failed for homeofhai product: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return found;
  }

  private parseProduct(
    product: ShopifyRawProduct,
    category: string,
    seenImages: Set<string>,
  ): ScrapedProduct | null {
    const { title, handle } = product;
    if (!title || !handle) {
      return null;
    }

    const firstVariant = (product.variants ?? [])[0];
    const description = htmlToText(product.body_html);

    return buildProduct({
      url: `https://www.homeofhai.com/product/${handle}`,
      name: title,
      marketplace: 'HAI',
      category,
      subCategory: product.product_type ?? null,
      description,
      brand: 'HOME_OF_HAI',
      price: firstVariant?.price ?? null,
      discountedPrice: firstVariant?.compare_at_price ?? null,
      images: this.extractImages(product, seenImages),
      colors: this.extractColors(product),
      materials: this.extractMaterials(description, product.body_html ?? ''),
    });
  }

  private extractImages(
    product: ShopifyRawProduct,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    (product.images ?? []).forEach((image, idx) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      const url = image.src ?? '';
      if (url && !seenImages.has(url)) {
        seenImages.add(url);
        images.push({
          url,
          name: image.alt ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors(product: ShopifyRawProduct): string[] {
    const found = new Set<string>();

    for (const option of product.options ?? []) {
      const name = (option.name ?? '').toLowerCase();
      if (name.includes('color') || name.includes('colour')) {
        for (const value of option.values ?? []) {
          const matched: string[] = [];
          for (const keyword of colorKeywords) {
            if (value.toLowerCase().includes(keyword.toLowerCase())) {
              const token = formatEnum(keyword);
              if (token) {
                matched.push(token);
              }
            }
          }
          if (matched.length === 0) {
            const token = formatEnum(value);
            if (token) {
              matched.push(token);
            }
          }
          matched.forEach((token) => found.add(token));
        }
      }
    }

    return [...found];
  }

  private extractMaterials(
    description: string,
    descriptionHtml: string,
  ): string[] {
    const text = `${description} ${descriptionHtml}`.toLowerCase();
    const found = new Set<string>();
    for (const keyword of materialKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        const token = formatEnum(keyword);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}

function htmlToText(html: string | undefined): string {
  if (!html) {
    return '';
  }
  return cheerio.load(html).text().trim();
}
