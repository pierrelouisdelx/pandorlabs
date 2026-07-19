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
import { formatEnum } from '../../utils/product-fields';

interface OutnetLink {
  url: string;
  category: string;
}

const SITE_URL = 'https://www.theoutnet.com';
const API_URL =
  'https://www.theoutnet.com/api/yoox/ton/search/resources/store/theoutnet_us/productview';

// Mobile-app headers, ported verbatim from the Python source (static values,
// not per-session cookies) — see the "cookie / anti-bot note" in the guide.
const HEADERS = {
  accept: 'application/json',
  'accept-encoding': 'gzip',
  'accept-language': 'en_US',
  host: 'www.theoutnet.com',
  'user-agent':
    'mobile_ton_theoutnet/2025.10 phone; Android 11; 2.68125 Genymobile PIXEL 7A',
  'x-appname': 'native-smartphone-THE OUTNET/175',
  'x-appversion': '2025.10',
  'x-device': 'smartphone',
  'x-ibm-client-id': '575360e8-4812-4c86-a40d-93f6bd9f49b0',
  'x-native-app': 'true',
  'x-platform': 'android',
};

// Only "shoes" is active, matching the source (other categories are
// commented out there too).
const CATEGORIES = [
  // 'clothing',
  'shoes',
  // 'bags',
  // 'accessories/jewelry',
  // 'accessories',
];

const MAX_LIST_PAGES = 3;
const PAGE_SIZE = 256;

/**
 * The Outnet scraper. Uses the site's internal mobile-app `productview` JSON
 * API for both category listing and product detail. Port of the Python
 * `TheOutnetScraper`.
 */
export class TheOutnetScraper extends FashionScraper {
  private readonly seenImages = new Set<string>();
  private readonly seenUrls = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'the_outnet',
      ScraperCategory.SHOPPING,
      {
        url: SITE_URL,
        metadata: {
          name: 'The Outnet',
          description:
            'Scrapes The Outnet via the internal mobile-app productview JSON API',
          tags: ['the_outnet', 'shopping'],
        },
        collectionName: 'the_outnet',
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

    for (const linkData of links) {
      const product = await this.fetchAndParse(linkData);
      if (product) {
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<OutnetLink[]> {
    const links: OutnetLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let maxPage = MAX_LIST_PAGES;

      while (page <= maxPage) {
        const url = `${API_URL}/byCategory?attrs=true&category=%2F${category}&locale=en_US&pageNumber=${page}&pageSize=${PAGE_SIZE}`;

        let data: { products?: Record<string, any>[]; totalPages?: number };
        try {
          data = await this.http.getJson<{
            products?: Record<string, any>[];
            totalPages?: number;
          }>(url, { headers: HEADERS });
          this.stats.pagesFetched++;
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Error fetching data for ${url}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          // The source retries the same page forever after a 30s sleep; we
          // bound that to avoid hanging the run and move to the next category.
          break;
        }

        const products = data.products ?? [];
        for (const product of products) {
          const seoKeyword = product.seo?.seoURLKeyword;
          if (!seoKeyword) {
            continue;
          }
          const productUrl = `${SITE_URL}/en-us/shop${seoKeyword}`;
          if (!seen.has(productUrl)) {
            seen.add(productUrl);
            const cat =
              category === 'accessories/jewelry' ? 'jewelry' : category;
            links.push({ url: productUrl, category: cat });
          }
        }

        const totalPages = data.totalPages ?? maxPage;
        if (totalPages > maxPage) {
          maxPage = totalPages;
        }
        page++;
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: OutnetLink,
  ): Promise<ScrapedProduct | null> {
    const match = linkData.url.match(/(\d+)p?$/);
    if (!match) {
      this.logger.warn(`Could not extract product ID from ${linkData.url}`);
      return null;
    }
    const productId = match[1];
    const apiUrl = `${API_URL}/${productId}`;

    let json: { products?: Record<string, any>[] };
    try {
      json = await this.http.getJson<{ products?: Record<string, any>[] }>(
        apiUrl,
        { headers: HEADERS },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const productData = json.products?.[0];
      if (!productData) {
        return null;
      }

      const seoKeyword = productData.seo?.seoURLKeyword ?? '';
      const url = `${SITE_URL}/en-us/shop/product${seoKeyword}`;
      if (this.seenUrls.has(url)) {
        return null;
      }
      this.seenUrls.add(url);

      const name: string =
        productData.name || productData.shortDescription || '';

      let subCategory: string | null = null;
      let subSubCategory: string | null = null;
      const salesCategories: Record<string, any>[] =
        productData.salesCategories ?? [];
      if (salesCategories.length > 0) {
        subCategory = salesCategories[0].label ?? null;
        if (salesCategories[0].child) {
          subSubCategory = salesCategories[0].child.label ?? null;
        }
      }

      const description: string =
        productData.productColours?.[0]?.shortDescription ?? '';
      const brand: string = productData.designerName || productData.brand || '';

      let price: number | null = null;
      let discountedPrice: number | null = null;
      if (productData.price) {
        price = productData.price.wasPrice?.amount ?? null;
        discountedPrice = productData.price.sellingPrice?.amount ?? null;
      }

      return buildProduct({
        url,
        name,
        marketplace: 'THE_OUTNET',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand,
        price,
        discountedPrice,
        images: this.extractImages(productData),
        colors: this.extractColors(productData),
        materials: this.extractMaterials(productData),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(
    productData: Record<string, any>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const colorData = productData.productColours?.[0];
    if (!colorData) {
      return images;
    }

    const imageTemplate: string | undefined = colorData.imageTemplate;
    const imageViews: string[] = colorData.imageViews ?? [];
    if (!imageTemplate || imageViews.length === 0) {
      return images;
    }

    imageViews.forEach((view, idx) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      let url = imageTemplate.replace('{view}', view).replace('{width}', '800');
      if (url.startsWith('//')) {
        url = `https:${url}`;
      }
      if (!this.seenImages.has(url)) {
        this.seenImages.add(url);
        images.push({
          url,
          name: `${productData.name ?? ''}_image_${view}`,
          isMain: idx === 0,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(productData: Record<string, any>): string[] {
    let colorName: string | null = null;
    for (const attr of productData.attributes ?? []) {
      if (['Brand Colour', 'Color'].includes(attr.identifier)) {
        colorName = attr.values?.[0]?.label ?? null;
        break;
      }
    }
    if (!colorName && productData.productColours?.[0]) {
      colorName = productData.productColours[0].label ?? null;
    }

    if (!colorName) {
      return [];
    }
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }

  private extractMaterials(productData: Record<string, any>): string[] {
    let materialName: string | null = null;
    for (const attr of productData.attributes ?? []) {
      if (
        ['Material Fabric (TON_ALL)', 'Materials'].includes(attr.identifier)
      ) {
        materialName = attr.values?.[0]?.label ?? null;
        break;
      }
    }
    if (!materialName && productData['M&F_1']) {
      materialName =
        productData['M&F_1'].values?.[0]?.values?.[0]?.label ?? null;
    }

    if (!materialName) {
      return [];
    }
    const token = formatEnum(materialName);
    return token ? [token] : [];
  }
}
