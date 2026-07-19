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

interface HmCategory {
  main: string;
  pageId: string;
  categoryId: string;
}

interface HmLink {
  link: string;
  category: string;
  subcategory: string | null;
}

const CATEGORIES: HmCategory[] = [
  {
    main: 'SHOES',
    pageId: '/ladies/shoes/view-all',
    categoryId: 'ladies_shoes',
  },
  {
    main: 'CLOTHING',
    pageId: '/ladies/shop-by-product/view-all',
    categoryId: 'ladies_all',
  },
  {
    main: 'ACCESSORIES',
    pageId: '/ladies/accessories/view-all',
    categoryId: 'ladies_accessories',
  },
];

const MAX_LIST_PAGES = 3;

const LIST_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  Referer: 'https://www2.hm.com/en_us/women.html',
};

/**
 * H&M scraper. Uses the public `api.hm.com` listing endpoint and the mobile
 * `app2.hm.com` article-detail endpoint. Port of the Python `HmScraper`.
 *
 * The source relied on browser cookies + a mobile-app "sensor data" anti-bot
 * token for the detail endpoint; both are dropped here (see guide's cookie
 * note) since we cannot regenerate the sensor token, so detail fetches are
 * expected to fail (403/blocked) until a proper cookie/anti-bot story exists.
 */
export class HmScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'hm',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www2.hm.com/en_us/women.html',
        metadata: {
          name: 'H&M',
          description:
            'Scrapes H&M via the api.hm.com listing + app2 article endpoints',
          tags: ['hm', 'shopping'],
        },
        collectionName: 'hm',
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

  private async getLinks(): Promise<HmLink[]> {
    const links: HmLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let maxPage = MAX_LIST_PAGES;

      while (page <= maxPage) {
        const url =
          `https://api.hm.com/search-services/v1/en_us/listing/resultpage?pageSource=PLP` +
          `&page=${page}&sort=RELEVANCE&pageId=${category.pageId}&page-size=36` +
          `&categoryId=${category.categoryId}&filters=sale:false||oldSale:false` +
          `&touchPoint=DESKTOP&skipStockCheck=false`;

        try {
          const data = await this.http.getJson<{
            pagination?: { totalPages?: number };
            plpList?: { productList?: { url: string; mainCatCode?: string }[] };
          }>(url, { headers: LIST_HEADERS });
          this.stats.pagesFetched++;

          const totalPages = data.pagination?.totalPages ?? maxPage;
          maxPage = Math.max(maxPage, totalPages);

          for (const item of data.plpList?.productList ?? []) {
            const link = item.url;
            if (!seen.has(link)) {
              seen.add(link);
              const subcategory = item.mainCatCode
                ? formatEnum(item.mainCatCode.split('_').pop() ?? null)
                : null;
              links.push({ link, category: category.main, subcategory });
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category.main} page ${page}: ${
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
    linkData: HmLink,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    const parts = linkData.link.split('.');
    const productId = parts.length >= 2 ? parts[parts.length - 2] : null;
    const url = `https://www2.hm.com${linkData.link}`;

    if (!productId) {
      this.stats.itemsFailed++;
      this.logger.warn(`Could not derive product id for ${linkData.link}`);
      return null;
    }

    let json: { product?: Record<string, any> };
    try {
      json = await this.http.getJson<{ product?: Record<string, any> }>(
        `https://app2.hm.com/hmwebservices/service/article/get-article-by-code/hm-us/Online/${productId}/en.json`,
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'user-agent': 'targetapp_android_22',
            'x-app-devicetype': 'Google Pixel 8',
            'x-app-version': '25.50.0',
          },
        },
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
      const product = json.product;
      if (!product) {
        return null;
      }

      const name: string = product.name ?? '';
      const description: string = product.description ?? '';
      const price = product.whitePrice?.price ?? null;

      return buildProduct({
        url: product.productUrl ?? url,
        name,
        marketplace: 'HM',
        category: linkData.category,
        subCategory:
          linkData.subcategory !== linkData.category
            ? linkData.subcategory
            : null,
        description,
        brand: 'H&M',
        price,
        discountedPrice: null,
        images: this.extractImages(product, seenImages),
        colors: this.extractColors(product.color?.text),
        materials: this.extractMaterials(description),
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

  private extractImages(
    product: Record<string, any>,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const gallery: { url: string }[] =
      product.articlesList?.[0]?.galleryDetails ?? [];

    gallery.forEach((image, idx) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      if (image.url && !seenImages.has(image.url)) {
        seenImages.add(image.url);
        images.push({
          url: image.url,
          name: `Image ${idx + 1}`,
          isMain: idx === 0,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(colorText: string | undefined): string[] {
    const token = formatEnum(colorText ?? null);
    return token ? [token] : [];
  }

  private extractMaterials(description: string): string[] {
    const lower = description.toLowerCase();
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
