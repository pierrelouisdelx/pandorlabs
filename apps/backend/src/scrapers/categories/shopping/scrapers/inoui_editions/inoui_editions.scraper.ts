import { Connection } from 'mongoose';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
} from '../../utils/product';
import { formatEnum, materialKeywords } from '../../utils/product-fields';

interface InouiCategory {
  main: string;
  subs: string[];
}

interface InouiLink {
  handle: string;
  category: string;
  subcategory: string;
}

const CATEGORIES: InouiCategory[] = [
  { main: 'bags', subs: ['shoulder-bags', 'handbag', 'backpack', 'bags'] },
  { main: 'accessories', subs: ['small-accessories', 'scarves', 'foutas'] },
];

// Next.js build id — changes on every site deploy. The Python source already
// hard-codes this and logs a "buildId might be outdated" warning on 404;
// ported as-is. This is the most likely reason this scraper stops working.
const BUILD_ID = '9uMH2PP-IoBMqebzhBcxo';

const HEADERS = {
  Referer: 'https://inoui-editions.com/',
  Origin: 'https://inoui-editions.com',
};

/**
 * Inoui Editions scraper. Uses the site's Next.js `_next/data/{buildId}` JSON
 * endpoints for both category listings and product detail. Port of the
 * Python `InouiEditionsScraper`.
 *
 * Note: `requires_cookies = True` in the source, but the Python client never
 * actually attaches `self.cookies` to these requests — so there is no cookie
 * behavior to port. The real fragility here is the hard-coded Next.js
 * `buildId`, which goes stale on every site deploy (see `BUILD_ID`).
 */
export class InouiEditionsScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'inoui_editions',
      ScraperCategory.SHOPPING,
      {
        url: 'https://inoui-editions.com',
        metadata: {
          name: 'Inoui Editions',
          description: 'Scrapes Inoui Editions via Next.js data JSON endpoints',
          tags: ['inoui_editions', 'shopping'],
        },
        collectionName: 'inoui_editions',
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
    const seenImages = new Set<string>();

    for (const linkData of links) {
      const product = await this.fetchAndParse(linkData, seenImages);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<InouiLink[]> {
    const links: InouiLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        const handle =
          sub !== category.main && category.main !== 'accessories'
            ? `${category.main}/${sub}`
            : category.main === 'accessories'
              ? sub
              : category.main;

        const url =
          `https://inoui-editions.com/_next/data/${BUILD_ID}/en-us/category/${handle}.json` +
          `?locale=en-us&paths=bags`;

        try {
          const data = await this.http.getJson<{
            pageProps?: { products?: { slug: string }[] };
          }>(url, { headers: HEADERS });
          this.stats.pagesFetched++;

          for (const product of data.pageProps?.products ?? []) {
            const link = product.slug;
            if (!seen.has(link)) {
              seen.add(link);
              links.push({
                handle: link,
                category: category.main,
                subcategory: sub,
              });
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          const message =
            error instanceof Error ? error.message : String(error);
          if (message.includes('404')) {
            this.logger.error(
              `Fetch failed with 404 for category ${handle}. The buildId '${BUILD_ID}' might be outdated. Error: ${message}`,
            );
          } else {
            this.logger.error(
              `Fetch failed for category ${handle}: ${message}`,
            );
          }
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: InouiLink,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    const handleParts = linkData.handle.split('?');
    let url = `https://inoui-editions.com/_next/data/${BUILD_ID}/en-us/product/`;
    url +=
      handleParts.length > 1
        ? `${handleParts[0]}.json?${handleParts[1]}&locale=en-us`
        : `${handleParts[0]}.json?locale=en-us`;

    let json: { pageProps?: { product?: Record<string, any> } };
    try {
      json = await this.http.getJson<{
        pageProps?: { product?: Record<string, any> };
      }>(url, { headers: HEADERS });
    } catch (error) {
      this.stats.fetchErrors++;
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('404')) {
        this.logger.error(
          `Fetch failed with 404. The buildId '${BUILD_ID}' might be outdated. Error: ${message}`,
        );
      } else {
        this.logger.error(`Fetch failed for ${url}: ${message}`);
      }
      return null;
    }

    try {
      const product = json.pageProps?.product;
      if (!product) {
        return null;
      }

      const name: string = product.title ?? '';
      const description: string = product.description ?? '';
      const materialsText: string = product.details_section_materials ?? '';
      const productUrl = `https://inoui-editions.com/en-us/product/${linkData.handle}`;

      return buildProduct({
        url: productUrl,
        name,
        marketplace: 'INOUI_EDITIONS',
        category: linkData.category,
        subCategory: linkData.subcategory,
        description,
        brand: 'INOUI_EDITIONS',
        price: product.price !== undefined ? Number(product.price) : null,
        discountedPrice: null,
        images: this.extractImages(product, seenImages),
        colors: this.extractColors(product),
        materials: this.extractMaterials(`${materialsText} ${description}`),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.handle}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(
    product: Record<string, any>,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    let hasFrontImage = false;

    const frontImageRef: string | undefined = product.frontImage?.asset?._ref;
    if (frontImageRef) {
      hasFrontImage = true;
      const cleaned = frontImageRef.split('image-')[1]?.replaceAll('-', '.');
      if (cleaned) {
        images.push({
          url: `https://inoui-editions.com/cdn?url=${cleaned}&w=2400&q=100`,
          name: 'frontImage',
          isMain: true,
          order: images.length,
        });
      }
    }

    const gallery: Record<string, any>[] = product.gallery ?? [];
    gallery.forEach((image, idx) => {
      const ref: string | undefined = image.asset?._ref;
      if (!ref) {
        return;
      }
      const cleaned = ref.split('image-')[1]?.replaceAll('-', '.');
      if (!cleaned) {
        return;
      }
      const url = `https://inoui-editions.com/cdn?url=${cleaned}&w=2400&q=100`;
      if (!seenImages.has(url)) {
        seenImages.add(url);
        images.push({
          url,
          name: '',
          isMain: idx === 0 && !hasFrontImage,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(product: Record<string, any>): string[] {
    const found = new Set<string>();
    for (const col of product.colors ?? []) {
      const token = formatEnum(col?.title ?? null);
      if (token) {
        found.add(token);
      }
    }
    return [...found];
  }

  private extractMaterials(text: string): string[] {
    const lower = text.toLowerCase();
    const found = new Set<string>();
    for (const material of materialKeywords) {
      if (lower.includes(material.toLowerCase())) {
        const token = formatEnum(material);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
