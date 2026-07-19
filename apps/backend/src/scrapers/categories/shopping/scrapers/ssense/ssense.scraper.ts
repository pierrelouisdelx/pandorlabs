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

interface SsenseListLink {
  link: string;
  category: string;
}

const CATEGORIES = ['clothing', 'bags', 'shoes', 'accessories'];
const MAX_LIST_PAGES = 5;

const HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

/**
 * SSENSE scraper. Uses SSENSE's `.json` listing + product endpoints.
 * Port of the Python `SsenseScraper`.
 *
 * Note: SSENSE sits behind Cloudflare; this relies on impit's TLS impersonation
 * rather than the source's cached cookies. If blocked, the run is marked FAILED.
 */
export class SsenseScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'ssense',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.ssense.com/en-us',
        metadata: {
          name: 'SSENSE',
          description: 'Scrapes SSENSE women via the .json product endpoints',
          tags: ['ssense', 'shopping', 'luxury'],
        },
        collectionName: 'ssense',
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

  private async getLinks(): Promise<SsenseListLink[]> {
    const links: SsenseListLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let maxPage = MAX_LIST_PAGES;

      while (page <= maxPage) {
        const url = `https://www.ssense.com/en-us/women/${category}.json?page=${page}`;
        try {
          const data = await this.http.getJson<{
            pagination_info?: { totalPages?: number };
            products?: { url: string }[];
          }>(url, { headers: HEADERS });
          this.stats.pagesFetched++;

          const totalPages = data.pagination_info?.totalPages ?? maxPage;
          if (totalPages > maxPage) {
            maxPage = Math.min(totalPages, MAX_LIST_PAGES);
          }

          for (const product of data.products ?? []) {
            if (!seen.has(product.url)) {
              seen.add(product.url);
              links.push({ link: product.url, category });
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to fetch SSENSE ${category} page ${page}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }
        page++;
      }
      this.logger.log(`Got ${links.length} links after ${category}`);
    }

    return links;
  }

  private async fetchAndParse(
    linkData: SsenseListLink,
  ): Promise<ScrapedProduct | null> {
    const url = `https://www.ssense.com/en-us${linkData.link}`;
    let data: { product?: Record<string, any> };
    try {
      data = await this.http.getJson<{ product?: Record<string, any> }>(
        `${url}.json`,
        { headers: HEADERS },
      );
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
      const product = data.product;
      if (!product) {
        return null;
      }

      const name: string = product.name?.en ?? '';
      const description: string = product.description?.en ?? '';
      const brand: string = product.brand?.name?.en ?? '';

      let price = Math.round((product.price?.[0]?.regular ?? 0) * 100);
      let discounted = Math.round(
        (product.price?.[0]?.lowest?.amount ?? 0) * 100,
      );
      if (discounted && discounted > price) {
        [price, discounted] = [discounted, price];
      }

      return buildProduct({
        url,
        name,
        marketplace: 'SSENSE',
        category: linkData.category,
        subCategory: product.category?.name?.en ?? null,
        description,
        brand,
        price: price || null,
        discountedPrice: discounted || null,
        images: this.extractImages(product),
        colors: this.extractColors(product),
        materials: this.extractMaterials(product),
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

  private extractImages(product: Record<string, any>): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const seen = new Set<string>();
    const rawImages: string[] = product.images ?? [];

    rawImages.forEach((imgUrl, idx) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      const url = imgUrl.replace('__IMAGE_PARAMS__', 'c_scale,w_1200');
      if (!seen.has(url)) {
        seen.add(url);
        images.push({
          url,
          name: product.name?.en ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(product: Record<string, any>): string[] {
    const primary: string | undefined = product.primaryColor?.en;
    if (!primary || !primary.trim()) {
      return [];
    }
    const token = formatEnum(primary.trim());
    return token ? [token] : [];
  }

  private extractMaterials(product: Record<string, any>): string[] {
    const composition: string = (product.composition?.en ?? '').toLowerCase();
    const found = new Set<string>();
    for (const material of materialKeywords) {
      if (composition.includes(material.toLowerCase())) {
        const token = formatEnum(material);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
