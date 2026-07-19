import { Connection } from 'mongoose';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import { buildProduct, ScrapedProduct } from '../../utils/product';
import { extractPrice } from '../../utils/product-fields';
import { QUINCE_CATEGORIES, QuinceSub } from './quince.categories';

interface QuinceLink {
  link: string;
  category: string;
  subcategory: string;
}

/**
 * Quince sits behind Cloudflare and required real-browser cookies in Python
 * (`requires_cookies = True`). We are not porting the cookie manager, so
 * these requests will likely 403 — expected/acceptable per the porting guide.
 */
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.5',
  'x-show-dynamic-filters': 'false',
  Origin: 'https://www.quince.com',
  Referer: 'https://www.quince.com/',
};

/**
 * Next.js `buildId` baked into the detail-page data URL. The Python source
 * carries the same hardcoded value with a comment noting it "might be
 * outdated" — kept as-is; a stale buildId will 404 every product fetch until
 * it's refreshed by inspecting a live page load.
 */
const BUILD_ID = '25512';

/**
 * Quince scraper. Port of the Python `QuinceScraper`.
 *
 * Note: the source's `_get_product_images/_get_product_colors/_get_product_materials`
 * were all unimplemented stubs (`pass`) — this port faithfully leaves
 * images/colors/materials empty rather than inventing extraction logic.
 */
export class QuinceScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'quince',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.quince.com',
        metadata: {
          name: 'Quince',
          description:
            'Scrapes Quince via the collection feed + Next.js data endpoints',
          tags: ['quince', 'shopping'],
        },
        collectionName: 'quince',
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

  private async getLinks(): Promise<QuinceLink[]> {
    const links: QuinceLink[] = [];
    const seen = new Set<string>();

    for (const category of QUINCE_CATEGORIES) {
      for (const sub of category.subs) {
        let page = 0;

        while (true) {
          const slug = this.collectionSlug(sub);
          const url =
            `https://api-prod-public.onequince.com/bff-service/v1/collection/get-products-feed` +
            `?slug=${encodeURIComponent(slug)}&currentSlug=${encodeURIComponent(sub.slug)}` +
            `&sortBy=FEATURED&baseSortBy=FEATURED&pageType=GROUPED&limit=30&page=${page}`;

          try {
            const data = await this.http.getJson<{
              subCollections?: {
                productCards?: { product?: { slug?: string } }[];
              }[];
            }>(url, { headers: HEADERS });
            this.stats.pagesFetched++;

            const subCollections = data.subCollections ?? [];
            if (subCollections.length === 0) {
              break;
            }

            const productCards = subCollections[0].productCards ?? [];
            if (productCards.length === 0) {
              break;
            }

            for (const card of productCards) {
              const link = card.product?.slug;
              if (link && !seen.has(link)) {
                seen.add(link);
                links.push({
                  link,
                  category: category.main,
                  subcategory: sub.name,
                });
              }
            }
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub.name} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          page++;
        }
      }
    }

    return links;
  }

  /** Mirrors the Python's 4-segment slug trim (drops the last path segment). */
  private collectionSlug(sub: QuinceSub): string {
    const parts = sub.slug.split('/');
    if (parts.length === 4) {
      return parts.slice(0, -1).join('/');
    }
    return sub.slug;
  }

  private async fetchAndParse(
    linkData: QuinceLink,
  ): Promise<ScrapedProduct | null> {
    const url = `https://www.quince.com/_next/data/${BUILD_ID}/default-locale/${linkData.link}.json`;

    let body: string;
    try {
      body = await this.http.getText(url, { headers: HEADERS });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${url}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }

    try {
      const json = JSON.parse(body);
      const productData = json?.pageProps?.pageData?.context?.seoData;
      if (!productData) {
        return null;
      }

      const name: string = productData.title ?? '';
      const description: string = productData.description ?? '';
      const brand: string = productData.metaSchemaData?.brand?.name ?? '';
      const priceRaw: string = productData.metaSchemaData?.offers?.price ?? '';
      const price = priceRaw ? extractPrice(String(priceRaw)) : null;

      return buildProduct({
        url,
        name,
        marketplace: 'QUINCE',
        category: linkData.category,
        subCategory: linkData.subcategory,
        description,
        brand,
        price,
        discountedPrice: null,
        images: [],
        colors: [],
        materials: [],
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
}
