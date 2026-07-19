import { Connection } from 'mongoose';
import { ProductCategory } from '@pandorlabs/types';
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
  formatEnum,
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface ArketCategory {
  name: ProductCategory;
  subs: string[];
}

interface ArketLink {
  url: string;
  category: ProductCategory;
  subcategory: string;
}

const CATEGORIES: ArketCategory[] = [
  {
    name: ProductCategory.CLOTHING,
    subs: [
      'shirtsblouses',
      'jacketscoats',
      'dresses',
      'knitwear',
      'jeans',
      'tops/tshirts',
      'tops',
      'trousers',
      'skirts',
      'shorts',
      'sweatshirts-hoodies',
      'sleeveless',
      'linen-collection',
      'swimwear',
      'loungewear',
      'sportswear',
      'socks',
    ],
  },
  { name: ProductCategory.BAGS, subs: ['crossbody-bags', 'tote-bags'] },
  {
    name: ProductCategory.SHOES,
    subs: ['sandals', 'trainers', 'flats', 'boots'],
  },
  {
    name: ProductCategory.ACCESSORIES,
    subs: ['sunglasses', 'belts', 'hair-accessories'],
  },
  { name: ProductCategory.JEWELRY, subs: ['jewellery'] },
];

const BASE_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Content-Type': 'text/plain;charset=UTF-8',
};

const PAGE_SIZE = 48;

/**
 * Arket scraper. Uses Arket's `/api/search/` POST endpoint for link
 * discovery and the Next.js `__NEXT_DATA__` blob for product detail.
 * Port of the Python `ArketScraper`.
 *
 * Cookie-gated site (`requires_cookies = True` in the source): we don't have
 * a browser-cookie manager here, so this relies on the base proxy/TLS
 * impersonation alone and may be blocked (403) at runtime — that's expected.
 */
export class ArketScraper extends FashionScraper {
  private readonly seenImages = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'arket',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.arket.com/en-ww/women/',
        metadata: {
          name: 'Arket',
          description: 'Scrapes Arket via the internal search POST API',
          tags: ['arket', 'shopping'],
        },
        collectionName: 'arket',
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

  /** POST a JSON body via the inherited proxied Impit client (no POST helper on FashionHttp). */
  private async postJson<T>(
    url: string,
    body: string,
    headers: Record<string, string>,
  ): Promise<T> {
    const client = this.createImpitClient();
    const response = await client.fetch(url, {
      method: 'POST',
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return JSON.parse(await response.text()) as T;
  }

  private async getLinks(): Promise<ArketLink[]> {
    const links: ArketLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 1;

        while (true) {
          const headers = {
            ...BASE_HEADERS,
            Referer: `https://www.arket.com/en-ww/women/${category.name}/`,
          };
          const body = JSON.stringify({
            categoryArray: [`women/${sub}`],
            fredhopperFilteringQueryKeys: 'full_price',
            language: 'en',
            marketCode: 'ww',
            requestFilters: [],
            sortOrder: 'relevance',
            startIndex: PAGE_SIZE * (page - 1),
            viewSize: PAGE_SIZE,
          });

          let data: { products?: { uri?: string }[] };
          try {
            data = await this.postJson<{ products?: { uri?: string }[] }>(
              'https://www.arket.com/api/search/',
              body,
              headers,
            );
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub} in ${category.name}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const products = data.products ?? [];
          if (products.length === 0) {
            break;
          }

          for (const product of products) {
            const url = `https://www.arket.com/en-ww/product/${product.uri ?? ''}`;
            if (!seen.has(url)) {
              seen.add(url);
              links.push({ url, category: category.name, subcategory: sub });
            }
          }

          page++;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: ArketLink,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(linkData.url, { headers: BASE_HEADERS });
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
      const match = html.match(
        /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
      );
      if (!match) {
        this.logger.warn(`No __NEXT_DATA__ found for ${linkData.url}`);
        return null;
      }
      const nextData = JSON.parse(match[1]);

      const blocks: Record<string, any>[] =
        nextData?.props?.pageProps?.blocks ?? [];
      const productBlock = blocks.find(
        (block) => block.component === 'productDetails',
      );
      const productData = productBlock?.product;
      if (!productData) {
        this.logger.warn(
          `Product details not found in NEXT_DATA for ${linkData.url}`,
        );
        return null;
      }

      const name: string = productData.defaultName ?? '';
      const description: string = productData.description ?? '';
      const price: number | null =
        productData.priceAsNumber !== undefined &&
        productData.priceAsNumber !== null
          ? Number(productData.priceAsNumber)
          : null;

      return buildProduct({
        url: linkData.url,
        name,
        marketplace: 'ARKET',
        category: linkData.category,
        subCategory: linkData.subcategory,
        description,
        brand: 'ARKET',
        price,
        discountedPrice: null,
        images: this.extractImages(productData.mediaObjects ?? []),
        colors: this.extractColors(productData.defaultVariantName),
        materials: extractMaterialsFromText(description),
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

  private extractImages(media: Record<string, any>[]): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    media.forEach((item, idx) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      const url: string | undefined = item?.attributes?.media_original_url;
      if (url && !this.seenImages.has(url)) {
        this.seenImages.add(url);
        images.push({
          url,
          name: item.alt ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors(colorName: string | null | undefined): string[] {
    const token = formatEnum(colorName ?? null);
    return token ? [token] : [];
  }
}
