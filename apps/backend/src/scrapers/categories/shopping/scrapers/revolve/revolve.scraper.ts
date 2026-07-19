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

interface RevolveLink {
  category: string;
  url: string; // product code
}

const CATEGORIES = ['Clothing', 'Shoes', 'Bags', 'Jewelry', 'Accessories'];

const HEADERS = {
  Connection: 'Keep-Alive',
  Host: 'www.revolve.com',
  'User-Agent':
    'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 8 Build/RQ1A.210105.003)',
};

/**
 * Revolve scraper. Uses Revolve's iPad-app JSON endpoints for both listing
 * and detail. Port of the Python `RevolveScraper`.
 *
 * Note: the source forced `impersonate="chrome110"` on both requests to
 * avoid HTTP/2 errors — impit/our http client doesn't expose that knob, so
 * it's dropped; requests may be more likely to hit HTTP/2-related failures
 * than the source was.
 */
export class RevolveScraper extends FashionScraper {
  private readonly unique_images = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'revolve',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.revolve.com',
        metadata: {
          name: 'Revolve',
          description:
            'Scrapes Revolve via the iPad-app listing + product-detail JSON endpoints',
          tags: ['revolve', 'shopping'],
        },
        collectionName: 'revolve',
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

  private async getLinks(): Promise<RevolveLink[]> {
    const links: RevolveLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let maxPage = 3;

      while (page <= maxPage) {
        const params = new URLSearchParams({
          d: 'Womens',
          n: '',
          s: 'c',
          c: category,
          sc: '',
          ssc: '',
          sssc: '',
          deviceType: 'revolveandroidphone',
          appVersion: '7.3.3',
          navsrc: 'hamburger',
          countryCode: 'US',
          currency: 'USD',
          sortBy: 'featured',
          lang: 'en',
          pageNum: String(page),
          iphoneId: 'f69bfe7916e3a939',
        });

        try {
          const data = await this.http.getJson<{
            pageItems?: { code: string }[];
            totalPages?: number;
          }>(
            `https://www.revolve.com/r/ipadApp/Brands.jsp?${params.toString()}`,
            {
              headers: HEADERS,
            },
          );
          this.stats.pagesFetched++;

          for (const product of data.pageItems ?? []) {
            if (!seen.has(product.code)) {
              seen.add(product.code);
              links.push({ category, url: product.code });
            }
          }

          if (data.totalPages) {
            maxPage = data.totalPages;
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category} page ${page}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }

        page++;
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: RevolveLink,
  ): Promise<ScrapedProduct | null> {
    const code = linkData.url;
    const params = new URLSearchParams({
      deviceType: 'revolveandroidphone',
      noProductRecs: 'true',
      appVersion: '7.3.3',
      code,
      mainProductOnly: 'true',
      countryCode: 'US',
      currency: 'USD',
      dept: 'Womens',
      lang: 'en',
      iphoneId: 'f69bfe7916e3a939',
    });

    let data: { productData?: Record<string, any>[] };
    try {
      data = await this.http.getJson<{ productData?: Record<string, any>[] }>(
        `https://www.revolve.com/r/ipadApp/ProductDetails.jsp?${params.toString()}`,
        { headers: HEADERS },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${code}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }

    try {
      const productData = data.productData?.[0];
      if (!productData) {
        this.logger.warn(`No productData found for code ${code}`);
        return null;
      }

      const fullName: string = productData.name ?? '';
      const brand: string = productData.brand ?? '';
      const price = productData.price ?? 0;
      const priceDiscount = productData.retailPrice ?? price;

      const bulletPoints: string[] = productData.bulletDescription ?? [];
      const description = bulletPoints.length ? bulletPoints.join(' | ') : '';

      const subcategory: string = productData.cat1 ?? productData.cat2 ?? '';

      return buildProduct({
        url: `https://www.revolve.com/dp/${code}/`,
        name: fullName,
        marketplace: 'REVOLVE',
        category: linkData.category,
        subCategory: subcategory,
        description,
        brand,
        price,
        discountedPrice: priceDiscount,
        images: this.extractImages(productData),
        colors: this.extractColors(productData.color),
        materials: this.extractMaterials(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${code}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private extractImages(
    productData: Record<string, any>,
  ): ScrapedProductImage[] {
    const result: ScrapedProductImage[] = [];
    const images: string[] = productData.images ?? [];
    const name: string = productData.name ?? '';

    images.forEach((imgUrl, idx) => {
      if (result.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      if (!this.unique_images.has(imgUrl)) {
        this.unique_images.add(imgUrl);
        result.push({
          url: imgUrl,
          name,
          isMain: idx === 0,
          order: result.length,
        });
      }
    });

    return result;
  }

  private extractColors(color: string | undefined): string[] {
    const token = formatEnum(color ?? null);
    return token ? [token] : [];
  }

  private extractMaterials(description: string): string[] {
    const found = new Set<string>();
    const lower = description.toLowerCase();
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
