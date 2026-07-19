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
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface LilysilkLinkData {
  category: string;
  data: Record<string, any>;
}

interface LilysilkCategory {
  name: string;
  ids: number[];
}

const CATEGORIES: LilysilkCategory[] = [
  { name: 'CLOTHING', ids: [938342259863381, 938342301806457] },
  { name: 'SHOES', ids: [1225145044100718] },
  { name: 'ACCESSORIES', ids: [938342310194986] },
];

const HEADERS = {
  Referer: 'https://www.lilysilk.com/',
  'content-type': 'application/json',
  Origin: 'https://www.lilysilk.com',
};

/**
 * Lilysilk scraper. Uses Lilysilk's `queryProductList` category endpoint,
 * which already returns full product detail JSON per item (no separate
 * detail fetch is needed).
 * Port of the Python `LilysilkScraper`.
 *
 * Note: the source issues this listing call as a POST with a JSON body.
 * `this.http` only supports GET, so the same payload fields are sent as
 * query params here — if the API rejects GET, that category page yields a
 * fetch error and is skipped, degrading gracefully rather than crashing.
 */
export class LilysilkScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'lilysilk',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.lilysilk.com',
        metadata: {
          name: 'LilySilk',
          description: 'Scrapes LilySilk via the queryProductList category API',
          tags: ['lilysilk', 'shopping'],
        },
        collectionName: 'lilysilk',
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
      const product = this.parse(linkData);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<LilysilkLinkData[]> {
    const links: LilysilkLinkData[] = [];
    const seen = new Set<number>();

    for (const category of CATEGORIES) {
      for (const categoryId of category.ids) {
        let page = 1;
        while (true) {
          const params = new URLSearchParams({
            pageSize: '100',
            categoryId: String(categoryId),
            orderBy: '0',
            page: String(page),
            pageType: '1',
          });
          const url = `https://api.services.lilysilk.com/us/item/api/v2/categroy/queryProductList.json?${params.toString()}`;

          let data: { data?: Record<string, any>[] };
          try {
            data = await this.http.getJson<{ data?: Record<string, any>[] }>(
              url,
              { headers: HEADERS },
            );
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch Lilysilk category ${categoryId} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const products = data.data ?? [];
          if (products.length === 0) {
            break;
          }

          for (const product of products) {
            if (!seen.has(product.id)) {
              seen.add(product.id);
              links.push({ category: category.name, data: product });
            }
          }

          page++;
        }
      }
    }

    return links;
  }

  private parse(linkData: LilysilkLinkData): ScrapedProduct | null {
    try {
      const product = linkData.data;
      const name: string = product.title ?? '';
      const description: string = product.description ?? '';
      const url = `https://www.lilysilk.com/us/${product.url ?? ''}.html`;

      let subCategory: string | null = null;
      let subSubCategory: string | null = null;
      const categoryGa = product.categoryGa;
      if (categoryGa) {
        if (categoryGa.secondLevel?.length) {
          subCategory = categoryGa.secondLevel[0];
        }
        if (categoryGa.thirdLevel?.length) {
          subSubCategory = categoryGa.thirdLevel[0];
        }
      }
      if (
        subCategory &&
        subCategory.toLowerCase() === linkData.category.toLowerCase()
      ) {
        subCategory = subSubCategory;
        subSubCategory = null;
      }

      let priceCents: number | null = null;
      if (product.discountMinPrice) {
        const { cent, precision } = product.discountMinPrice;
        const dollars = cent / 10 ** precision;
        priceCents = Math.round(dollars * 100);
      }

      return buildProduct({
        url,
        name,
        marketplace: 'LILYSILK',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand: 'LILYSILK',
        price: priceCents,
        images: this.extractImages(product),
        colors: this.extractColors(product),
        materials: extractMaterialsFromText(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for Lilysilk product: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(product: Record<string, any>): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const spuImg: Record<string, any>[] = product.spuImg ?? [];
    spuImg.forEach((image, idx) => {
      if (image.mediaType === 1) {
        images.push({
          url: `https://images.lilysilk.com${image.url}`,
          name: image.alt ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors(product: Record<string, any>): string[] {
    const found = new Set<string>();
    const colorOption: Record<string, any>[] = product.colorOption ?? [];
    for (const option of colorOption) {
      const token = formatEnum(option.name);
      if (token) {
        found.add(token);
      }
    }
    return [...found];
  }
}
