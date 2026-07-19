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

interface LuisaviaromaLink {
  product: Record<string, any>;
  category: string;
}

const CATEGORIES = ['SHOES', 'BAGS', 'ACCESSORIES', 'CLOTHING', 'JEWELRY'];

const HEADERS = {
  Accept: 'application/json',
  'Accept-Encoding': 'gzip',
  env: 'PROD',
  Host: 'api.luisaviaroma.com',
  'User-Agent': 'LVR/2025072 (android 30;11)',
  'x-lvr-appversion': '1',
  'x-lvr-river': '',
};

/**
 * LuisaViaRoma scraper. Uses LVR's internal `catalog/bysubline` app API.
 * Port of the Python `LuisaviaromaScraper`.
 *
 * Cookie/anti-bot note: the source routed this through a MITM proxy
 * (`settings.MITM_PROXY_URL`) to capture the mobile app's session. That's
 * dropped per the porting guide — the base client's own proxy rotation is
 * used instead, and this endpoint is expected to fail (403/blocked) without
 * the app's session context, degrading gracefully via `fetchErrors`.
 */
export class LuisaviaromaScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'luisaviaroma',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.luisaviaroma.com',
        metadata: {
          name: 'LuisaViaRoma',
          description: 'Scrapes LuisaViaRoma via the internal catalog app API',
          tags: ['luisaviaroma', 'shopping', 'luxury'],
        },
        collectionName: 'luisaviaroma',
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

  private async getLinks(): Promise<LuisaviaromaLink[]> {
    const links: LuisaviaromaLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      const cat =
        category.toLowerCase() === 'jewelry'
          ? 'fine_jewellery'
          : category.toLowerCase();

      let page = 1;
      let totalPages = 3;

      while (page <= totalPages) {
        const url =
          `https://api.luisaviaroma.com/lvrapprk/public/v1/catalog/bysubline` +
          `?Gender=women&Season=actual&Subline=${cat}&Language=EN&Country=US` +
          `&CurrencyView=USD&CurrencyFatt=USD&App=true&format=json&Page=${page}`;

        let data: {
          Pagination?: { TotalePages?: number };
          Items?: Record<string, any>[];
        };
        try {
          data = await this.http.getJson<{
            Pagination?: { TotalePages?: number };
            Items?: Record<string, any>[];
          }>(url, { headers: HEADERS });
          this.stats.pagesFetched++;
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to fetch LuisaViaRoma ${category} page ${page}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }

        const total = data.Pagination?.TotalePages;
        if (total && total > totalPages) {
          totalPages = total;
        }

        for (const product of data.Items ?? []) {
          const itemCode = product.ItemCode;
          if (itemCode && !seen.has(itemCode)) {
            seen.add(itemCode);
            links.push({ product, category });
          }
        }

        page++;
      }
    }

    return links;
  }

  private parse(linkData: LuisaviaromaLink): ScrapedProduct | null {
    try {
      const product = linkData.product;

      let priceCents: number | null = null;
      const prices: Record<string, any>[] = product.Pricing?.Prices ?? [];
      const usdPrice = prices.find((p) => p.CurrencyId === 'USD');
      if (usdPrice) {
        priceCents = Math.round(parseFloat(usdPrice.FinalPrice) * 100);
      }

      const subCategory: string | null =
        product.Category?.Descriptions?.[0]?.Descr ?? null;
      const subSubCategory: string | null =
        product.Subline?.Descriptions?.[0]?.Descr ?? null;

      const itemCode = product.ItemCode ?? 'unknown';
      const designer = String(product.Designer ?? 'brand')
        .replace(/ /g, '-')
        .toLowerCase();
      const url = `https://www.luisaviaroma.com/en-us/p/${designer}/women/${itemCode}`;

      return buildProduct({
        url,
        name: product.Description ?? '',
        marketplace: 'LUISAVIAROMA',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description: product.Description ?? '',
        brand: product.Designer ?? null,
        price: priceCents,
        images: this.extractImages(product),
        colors: this.extractColors(product),
        materials: extractMaterialsFromText(product.Description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for LuisaViaRoma product: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(product: Record<string, any>): ScrapedProductImage[] {
    let allImages: string[] = product.AllItemImages ?? [];
    if (!allImages || allImages.length === 0) {
      allImages = [product.Image ?? ''];
    }
    return allImages.filter(Boolean).map((imagePath, idx) => ({
      url: `https://images.lvrcdn.com/Big${imagePath}`,
      name: `Image ${idx + 1}`,
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(product: Record<string, any>): string[] {
    const colorDescription: string = product.ColorDescription ?? '';
    if (!colorDescription) {
      return [];
    }
    const token = formatEnum(colorDescription);
    return token ? [token] : [];
  }
}
