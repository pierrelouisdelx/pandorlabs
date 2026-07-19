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
  extractMaterialsFromText,
  formatEnum,
} from '../../utils/product-fields';

interface NetAPorterLink {
  productId: string;
  category: string;
}

const BASE_URL = 'https://www.net-a-porter.com';

const CATEGORIES = ['clothing', 'shoes', 'bags'];

// Stale session cookie from the source dropped; the rest of the mobile-app
// impersonation headers are kept as static headers.
const HEADERS = {
  accept: 'application/json',
  'accept-encoding': 'gzip',
  'accept-language': 'en_US',
  connection: 'Keep-Alive',
  host: 'www.net-a-porter.com',
  'user-agent':
    'mobile_nap_netaporter/2025.08 phone; Android 11; 2.675 Genymobile PIXEL 8',
  'x-appname': 'native-smartphone-Net-a-Porter/251',
  'x-appversion': '2025.08',
  'x-device': 'smartphone',
  'x-ibm-client-id': '5e25664f-3b6f-4012-8a9f-4443f695b185',
  'x-native-app': 'true',
  'x-platform': 'android',
};

/**
 * Net-a-Porter scraper. Uses the mobile-app `productview` JSON API for both
 * listing and detail. Port of the Python `NetAPorterScraper`.
 */
export class NetAPorterScraper extends FashionScraper {
  private readonly uniqueUrls = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'net_a_porter',
      ScraperCategory.SHOPPING,
      {
        url: BASE_URL,
        metadata: {
          name: 'Net-A-Porter',
          description:
            'Scrapes Net-A-Porter via the mobile-app productview JSON API',
          tags: ['net_a_porter', 'shopping'],
        },
        collectionName: 'net_a_porter',
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
      const parsed = await this.fetchAndParse(linkData);
      for (const product of parsed) {
        if (!seenUrls.has(product.url)) {
          seenUrls.add(product.url);
          products.push(product);
          this.stats.itemsScraped++;
        }
      }
    }

    return products;
  }

  private async getLinks(): Promise<NetAPorterLink[]> {
    const links: NetAPorterLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let maxPage = 3;

      while (page <= maxPage) {
        try {
          const data = await this.http.getJson<{
            products?: { partNumber?: string }[];
            totalPages?: number;
          }>(
            `https://www.net-a-porter.com/api/mobile/nap/search/resources/store/nap_us/productview/byCategory?category=%2F${category}&pageSize=96&pageNumber=${page}&attrs=true&locale=en_US`,
            { headers: HEADERS },
          );
          this.stats.pagesFetched++;

          for (const product of data.products ?? []) {
            const partNumber = product.partNumber;
            if (partNumber && !seen.has(partNumber)) {
              seen.add(partNumber);
              links.push({ productId: partNumber, category });
            }
          }

          const totalPages = data.totalPages ?? maxPage;
          if (totalPages > maxPage) {
            maxPage = totalPages;
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category} page ${page}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }
        page++;
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: NetAPorterLink,
  ): Promise<ScrapedProduct[]> {
    let json: { products?: Record<string, any>[] };
    try {
      json = await this.http.getJson<{ products?: Record<string, any>[] }>(
        `https://www.net-a-porter.com/api/mobile/nap/search/resources/store/nap_us/productview/${linkData.productId}?locale=en_US`,
        { headers: HEADERS },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }

    const results: ScrapedProduct[] = [];

    try {
      if (!json.products || json.products.length === 0) {
        return [];
      }
      const productData = json.products[0];

      const productColours: Record<string, any>[] =
        productData.productColours ?? [];
      const name: string = productData.tracking?.name ?? '';

      const masterCategory = productData.masterCategory ?? {};
      const subCategory: string = masterCategory.child?.labelEN ?? '';
      const subSubCategoryNode = masterCategory.child?.child;
      const subSubCategory: string = subSubCategoryNode?.labelEN ?? '';

      const brand: string = productData.designerIdentifier ?? '';

      let price: number | null = null;
      let discountedPrice: number | null = null;
      if (productData.price) {
        const priceInfo = productData.price;
        price = priceInfo.wasPrice?.amount ?? null;
        discountedPrice = priceInfo.sellingPrice?.amount ?? null;
        if (price === null && discountedPrice !== null) {
          price = discountedPrice;
          discountedPrice = null;
        }
      }

      for (const productColour of productColours) {
        try {
          const seoUrlKeyword: string = productColour.seo?.seoURLKeyword ?? '';
          const url = `${BASE_URL}/en-us/shop/product${seoUrlKeyword}`;
          if (this.uniqueUrls.has(url)) {
            continue;
          }
          this.uniqueUrls.add(url);

          const description: string = productColour.editorialDescription ?? '';

          const product = buildProduct({
            url,
            name,
            marketplace: 'NET_A_PORTER',
            category: linkData.category,
            subCategory,
            subSubCategory,
            description,
            brand,
            price,
            discountedPrice,
            images: this.extractImages(productColour),
            colors: this.extractColors(productColour),
            materials: extractMaterialsFromText(description),
          });
          results.push(product);
        } catch (error) {
          this.stats.itemsFailed++;
          this.logger.error(
            `Parsing failed for a color variant of ${linkData.productId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return results;
  }

  private extractImages(
    productColour: Record<string, any>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const imageTemplate: string | undefined = productColour.imageTemplate;
    const imageViews: string[] = productColour.imageViews ?? [];

    if (imageTemplate && imageViews.length > 0) {
      imageViews.forEach((view, idx) => {
        let url = imageTemplate
          .replace('{view}', view)
          .replace('{width}', '800');
        if (url.startsWith('//')) {
          url = 'https:' + url;
        }
        images.push({
          url,
          name: `image_${view}`,
          isMain: idx === 0,
          order: images.length,
        });
      });
    }

    return images;
  }

  private extractColors(productColour: Record<string, any>): string[] {
    let colorName: string | undefined;
    for (const attr of productColour.attributes ?? []) {
      if (['Brand Colour', 'Color'].includes(attr.identifier)) {
        colorName = attr.values?.[0]?.label;
        break;
      }
    }
    if (!colorName && productColour.productColours?.length > 0) {
      colorName = productColour.productColours[0]?.label;
    }
    if (!colorName) {
      return [];
    }
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }
}
