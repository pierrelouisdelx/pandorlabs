import { Connection } from 'mongoose';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import { ScrapedProduct } from '../../utils/product';
import { parseShopifyProduct, ShopifyRawProduct } from './shopify-product.util';
import { ShopifyStore } from './shopify.types';

const REQUEST_HEADERS = {
  Accept: 'application/json',
};

/** Safety cap on pages per collection handle to avoid pathological loops. */
const MAX_PAGES_PER_HANDLE = 100;

/**
 * Generic Shopify storefront scraper.
 *
 * One instance is registered per store (from `SHOPIFY_STORES`), so each store
 * gets its own scraper id, config, and Mongo collection. Reverse-engineers the
 * public `/collections/{handle}/products.json` endpoint — no HTML scraping,
 * no cookies. Port of the Python `ShopifyScraper`.
 */
export class ShopifyScraper extends FashionScraper {
  private readonly store: ShopifyStore;
  /** URL host used to build product links (Italic proxies a myshopify domain). */
  private readonly websiteLink: string;

  constructor(
    store: ShopifyStore,
    connection?: Connection,
    proxyService?: ProxyService,
  ) {
    super(
      store.id,
      ScraperCategory.SHOPPING,
      {
        url: store.link,
        metadata: {
          name: `${store.name} (Shopify)`,
          description: `Scrapes ${store.name} via the Shopify products.json API`,
          tags: ['shopify', 'shopping', store.marketplace.toLowerCase()],
        },
        collectionName: store.id,
        isActive: true,
      },
      connection,
      proxyService,
    );

    this.store = store;
    // Italic serves a raw *.myshopify.com domain but its canonical product URLs
    // live on italic.com (matches the source's special-case).
    this.websiteLink =
      store.link === 'https://cf29c4.myshopify.com'
        ? 'https://www.italic.com'
        : store.link;
  }

  protected async collectProducts(): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    const seenUrls = new Set<string>();

    for (const collection of this.store.collections) {
      for (const handle of collection.handles) {
        await this.scrapeHandle(handle, collection.main, products, seenUrls);
      }
    }

    return products;
  }

  private async scrapeHandle(
    handle: string,
    category: string,
    products: ScrapedProduct[],
    seenUrls: Set<string>,
  ): Promise<void> {
    for (let page = 1; page <= MAX_PAGES_PER_HANDLE; page++) {
      const url = `${this.store.link}/collections/${handle}/products.json?page=${page}`;

      let raw: { products?: ShopifyRawProduct[] };
      try {
        raw = await this.http.getJson<{ products?: ShopifyRawProduct[] }>(url, {
          headers: REQUEST_HEADERS,
        });
        this.stats.pagesFetched++;
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to fetch ${this.store.id} ${handle} page ${page}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return; // Stop this handle; other handles still run.
      }

      const pageProducts = raw.products ?? [];
      if (pageProducts.length === 0) {
        return; // No more pages for this handle.
      }

      for (const rawProduct of pageProducts) {
        try {
          const product = parseShopifyProduct(rawProduct, {
            marketplace: this.store.marketplace,
            websiteLink: this.websiteLink,
            category,
          });
          if (!product) {
            continue;
          }
          if (seenUrls.has(product.url)) {
            continue;
          }
          seenUrls.add(product.url);
          products.push(product);
          this.stats.itemsScraped++;
        } catch (error) {
          this.stats.itemsFailed++;
          this.logger.warn(
            `Failed to parse ${this.store.id} product: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      if (page === MAX_PAGES_PER_HANDLE) {
        this.logger.warn(
          `Reached page cap (${MAX_PAGES_PER_HANDLE}) for ${this.store.id} ${handle}`,
        );
      }
    }
  }
}
