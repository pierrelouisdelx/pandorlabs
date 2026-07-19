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
import { formatEnum, materialKeywords } from '../../utils/product-fields';
import { RALPH_LAUREN_CATEGORIES } from './ralphlauren.categories';

interface RalphLaurenLink {
  main: string;
  sub: string;
  link: string; // product_id
}

const SEARCH_HEADERS = {
  client_id: '0752f5408d8046eab42252845b2bcf93',
  client_secret: '4B16FF8E29974E1cB027109edE1e2a50',
  Connection: 'Keep-Alive',
  Host: 'api.ralphlauren.com',
  'User-Agent': 'App com.ralphlauren.us.app v3.6.9 (android/33)',
  'x-employee-tnc': 'false',
  'x-enable-sts-sdd': 'true',
  'x-px-authorization': '3',
};

const PRODUCT_HEADERS = {
  accept: 'application/json, text/plain, */*',
  Connection: 'Keep-Alive',
  Host: 'rldapi.ralphlauren.com',
  origin: 'https://rldapi.ralphlauren.com/dw/shop/v20_10/',
  'User-Agent': 'App com.ralphlauren.us.app v3.6.9 (android/33)',
  'x-dw-client-id': '7bedfbcb-e80a-41ed-a65a-8ff08ffa0333',
};

/**
 * Ralph Lauren scraper. Uses the RL mobile-app `product_search` endpoint for
 * link discovery and the `rldapi` Demandware product endpoint for details.
 * Port of the Python `RalphLaurenScraper`.
 *
 * Note: the source also had an unused `_get_categories` helper (queried
 * `rldapi.../categories/...` but its result was never wired into
 * `self.categories`) — dead code, not ported.
 */
export class RalphLaurenScraper extends FashionScraper {
  private readonly unique_images = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'ralphlauren',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.ralphlauren.com',
        metadata: {
          name: 'Ralph Lauren',
          description:
            'Scrapes Ralph Lauren via the mobile-app product search + rldapi endpoints',
          tags: ['ralphlauren', 'shopping'],
        },
        collectionName: 'ralphlauren',
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

  private async getLinks(): Promise<RalphLaurenLink[]> {
    const links: RalphLaurenLink[] = [];
    const seen = new Set<string>();

    for (const category of RALPH_LAUREN_CATEGORIES) {
      for (const sub of category.subs) {
        let start = 0;

        while (true) {
          const url =
            `https://api.ralphlauren.com/dtc/digital/v1/product_search` +
            `?client_id=7bedfbcb-e80a-41ed-a65a-8ff08ffa0333` +
            `&_br_uid_2=uid=189a7e9d-2269-4c23-9978-a6d975090683:v=app:ts=1755630972775:hc=2` +
            `&refine_2=c_isProductHide%3Dfalse&refine_3=cgid%3D${sub.id}&count=60&start=${start}`;

          try {
            const data = await this.http.getJson<{
              count?: number;
              hits?: { product_id: string }[];
            }>(url, { headers: SEARCH_HEADERS });
            this.stats.pagesFetched++;

            if (!data.count) {
              break;
            }

            for (const hit of data.hits ?? []) {
              const productId = hit.product_id;
              if (!seen.has(productId)) {
                seen.add(productId);
                links.push({
                  main: category.main,
                  sub: sub.name,
                  link: productId,
                });
              }
            }
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${category.main} - ${sub.name} start ${start}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          start += 60;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: RalphLaurenLink,
  ): Promise<ScrapedProduct | null> {
    const productId = linkData.link;
    const url =
      `https://rldapi.ralphlauren.com/dw/shop/v20_10/products/${productId}` +
      `?expand=availability,promotions,options,images,prices,variations,prices,links,set_products` +
      `&all_images=true&colorFilterEnabledParam=true&colorFilterPriceBooksEnabledParam=true`;

    let data: Record<string, any>;
    try {
      data = await this.http.getJson<Record<string, any>>(url, {
        headers: PRODUCT_HEADERS,
      });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${url}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }

    try {
      const inventory = data.inventory?.stock_level ?? 0;
      if (!inventory) {
        return null;
      }

      const name: string = data.name ?? '';
      const categoryId: string =
        data.primary_category_id ?? data.c_CategoryCode ?? '';
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const link = `https://www.ralphlauren.com/${categoryId}/${slug}-${productId}.html`;

      const images: { link: string; alt: string }[] = [];
      const colors = new Set<string>();

      for (const imageGroup of data.image_groups ?? []) {
        const groupImages = imageGroup.images;
        if (!groupImages || groupImages.length === 0) {
          continue;
        }
        const image = groupImages[0];
        images.push({ link: image.link, alt: image.alt ?? '' });

        for (const attribute of imageGroup.variation_attributes ?? []) {
          if (attribute.id === 'colorname') {
            for (const value of attribute.values ?? []) {
              colors.add(value.value);
            }
          }
        }
      }

      const materialsSource: string =
        data.c_fabric ?? data.long_description ?? '';

      return buildProduct({
        url: link,
        name,
        marketplace: 'RALPH_LAUREN',
        category: linkData.main,
        subCategory: linkData.sub,
        description: data.short_description ?? '',
        brand: data.brand ?? '',
        price: data.master?.price ?? null,
        discountedPrice: null,
        images: this.extractImages(images),
        colors: this.extractColors(colors),
        materials: this.extractMaterials(materialsSource),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(
    images: { link: string; alt: string }[],
  ): ScrapedProductImage[] {
    const result: ScrapedProductImage[] = [];
    images.forEach((image, idx) => {
      if (result.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      if (!this.unique_images.has(image.link)) {
        this.unique_images.add(image.link);
        result.push({
          url: image.link,
          name: image.alt,
          isMain: idx === 0,
          order: result.length,
        });
      }
    });
    return result;
  }

  private extractColors(colors: Set<string>): string[] {
    const found = new Set<string>();
    for (const color of colors) {
      const token = formatEnum(color);
      if (token) {
        found.add(token);
      }
    }
    return [...found];
  }

  private extractMaterials(source: string): string[] {
    const found = new Set<string>();
    const lower = source.toLowerCase();
    for (const material of materialKeywords) {
      if (lower.includes(material.toLowerCase())) {
        const token = formatEnum(material);
        if (token) {
          found.add(token);
        }
      }
    }
    const wholeToken = formatEnum(source);
    if (wholeToken) {
      found.add(wholeToken);
    }
    return [...found];
  }
}
