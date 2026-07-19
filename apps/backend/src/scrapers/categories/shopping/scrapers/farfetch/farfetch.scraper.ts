import { Connection } from 'mongoose';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
} from '../../utils/product';
import { formatEnum } from '../../utils/product-fields';

interface FarfetchLink {
  id: string;
  category: string;
}

const CATEGORY_IDS: Record<string, number> = {
  clothing: 135967,
  shoes: 136301,
  bags: 135971,
  accessories: 135973,
};

const MAX_PAGES = 3;
const PAGE_SIZE = 180;

// Note: the Python source embedded a hardcoded SFCC-style bearer token for
// `api.farfetch.net` (a session/guest token). Those expire quickly and are
// dropped here per the porting guide — requests will likely 401 without a
// fresh session.
const HEADERS = {
  'user-agent': 'Farfetch/5.78.0 (Genymobile Pixel 8; Android 11; Scale/2.67)',
  'cache-control': 'no-cache, no-store',
  'ff-country': 'US',
  'ff-currency': 'USD',
  'accept-language': 'en-US',
};

/**
 * Farfetch scraper. Uses the internal `api.farfetch.net` search + product
 * JSON endpoints. Port of the Python `Farfetch` scraper class.
 *
 * The Python source fetched remaining listing pages in parallel via a thread
 * pool; here we fetch sequentially (no bearer token to survive concurrent
 * abuse anyway) but preserve the same pagination/dedup logic.
 */
export class FarfetchScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'farfetch',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.farfetch.com',
        metadata: {
          name: 'Farfetch',
          description:
            'Scrapes Farfetch via the internal api.farfetch.net JSON API',
          tags: ['farfetch', 'shopping'],
        },
        collectionName: 'farfetch',
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

  private async getLinks(): Promise<FarfetchLink[]> {
    const links: FarfetchLink[] = [];
    const seen = new Set<string>();
    const url = 'https://api.farfetch.net/v1/search/products';

    for (const [categoryName, categoryId] of Object.entries(CATEGORY_IDS)) {
      let maxPage = MAX_PAGES;

      let firstPageEntries: { id: string }[] = [];
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: String(PAGE_SIZE),
          sort: 'ranking',
          fields: 'id',
          contextfilters: `categories:${categoryId}`,
        });
        const data = await this.http.getJson<{
          products?: { entries?: { id: string }[]; totalPages?: number };
        }>(`${url}?${params.toString()}`, { headers: HEADERS });
        this.stats.pagesFetched++;

        firstPageEntries = data.products?.entries ?? [];
        const totalPages = data.products?.totalPages ?? maxPage;
        if (maxPage < totalPages) {
          maxPage = totalPages;
        }
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Error fetching first page for ${categoryName}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        continue;
      }

      for (const entry of firstPageEntries) {
        if (!seen.has(entry.id)) {
          seen.add(entry.id);
          links.push({ id: entry.id, category: categoryName });
        }
      }

      for (let page = 2; page <= maxPage; page++) {
        try {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: String(PAGE_SIZE),
            sort: 'ranking',
            fields: 'id',
            contextfilters: `categories:${categoryId}`,
          });
          const data = await this.http.getJson<{
            products?: { entries?: { id: string }[] };
          }>(`${url}?${params.toString()}`, { headers: HEADERS });
          this.stats.pagesFetched++;

          for (const entry of data.products?.entries ?? []) {
            if (!seen.has(entry.id)) {
              seen.add(entry.id);
              links.push({ id: entry.id, category: categoryName });
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Page ${page} for ${categoryName} generated an exception: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: FarfetchLink,
  ): Promise<ScrapedProduct | null> {
    const params = new URLSearchParams({ includeOutOfStock: 'true' });
    const url = `https://api.farfetch.net/v1/products/${linkData.id}?${params.toString()}`;

    let data: Record<string, any>;
    try {
      data = await this.http.getJson<Record<string, any>>(url, {
        headers: HEADERS,
      });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const variants: Record<string, any>[] = data.variants ?? [];
      const availableVariants = variants.filter((v) => (v.quantity ?? 0) > 0);
      if (availableVariants.length === 0) {
        return null;
      }

      const name: string | undefined = data.shortDescription;
      if (!name) {
        this.logger.warn(`Short description is missing for ${linkData.id}`);
        return null;
      }

      const productUrl = `https://www.farfetch.com/shopping/women/${name
        .toLowerCase()
        .replace(/ /g, '-')}-item-${linkData.id}.aspx`;

      const categories: Record<string, any>[] = data.categories ?? [];
      const subCategory = categories.length >= 3 ? categories[2]?.name : null;
      const subSubCategory =
        categories.length >= 4 ? categories[3]?.name : null;

      const { price, discountedPrice, currency } = this.parsePrices(
        data.variants[0],
      );

      return buildProduct({
        url: productUrl,
        name,
        marketplace: 'FARFETCH',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description: data.description ?? null,
        brand: data.brand?.name ?? null,
        price,
        discountedPrice,
        currency,
        images: this.extractImages(data),
        colors: this.extractColors(data),
        materials: this.extractMaterials(data),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private parsePrices(variant: Record<string, any>): {
    price: number | null;
    discountedPrice: number | null;
    currency: string;
  } {
    const priceInfo = variant.price ?? {};
    const priceWithoutPromo: number | undefined =
      priceInfo.priceWithoutPromotion;
    const priceInclTaxes: number | undefined = priceInfo.priceInclTaxes;

    let price: number | null = null;
    let discountedPrice: number | null = null;

    if (priceWithoutPromo !== undefined && priceInclTaxes === undefined) {
      price = Math.round(priceWithoutPromo * 100);
    }
    if (priceWithoutPromo === undefined && priceInclTaxes !== undefined) {
      price = Math.round(priceInclTaxes * 100);
    }
    if (priceWithoutPromo !== undefined && priceInclTaxes !== undefined) {
      price = Math.round(priceWithoutPromo * 100);
      discountedPrice = Math.round(priceInclTaxes * 100);
    }

    if (
      discountedPrice !== null &&
      price !== null &&
      discountedPrice >= price
    ) {
      discountedPrice = null;
    }

    const currency: string = priceInfo.currencyIsoCode ?? 'USD';

    return { price, discountedPrice, currency };
  }

  private extractImages(data: Record<string, any>): ScrapedProductImage[] {
    const imagesData: Record<string, any>[] = data.images?.images ?? [];
    const imagesByOrder = new Map<number, Record<string, string>>();

    for (const img of imagesData) {
      const order = img.order ?? 1;
      const size = String(img.size ?? '0');
      if (!imagesByOrder.has(order)) {
        imagesByOrder.set(order, {});
      }
      imagesByOrder.get(order)![size] = img.url ?? '';
    }

    const preferredSizes = ['1000', '600', '800', '500', '400', '300'];
    const images: ScrapedProductImage[] = [];

    for (const [order, sizeUrls] of imagesByOrder.entries()) {
      let selectedUrl: string | undefined;
      for (const pref of preferredSizes) {
        if (sizeUrls[pref]) {
          selectedUrl = sizeUrls[pref];
          break;
        }
      }
      if (!selectedUrl && Object.keys(sizeUrls).length > 0) {
        const largestSize = Object.keys(sizeUrls).reduce((a, b) =>
          (parseInt(a, 10) || 0) > (parseInt(b, 10) || 0) ? a : b,
        );
        selectedUrl = sizeUrls[largestSize];
      }
      if (selectedUrl) {
        images.push({
          url: selectedUrl,
          name: `Image ${order}`,
          isMain: order === 1,
          order,
        });
      }
    }

    return images;
  }

  private extractColors(data: Record<string, any>): string[] {
    const colorsData: Record<string, any>[] = data.colors ?? [];
    const found = new Set<string>();

    for (const colorData of colorsData) {
      const colorInfo = colorData.color ?? {};
      const colorName = formatEnum((colorInfo.name ?? '').trim());
      const tags: string[] = colorData.tags ?? [];

      if (
        colorName &&
        (tags.length === 0 ||
          tags.includes('MainColor') ||
          tags.includes('SecondaryColor'))
      ) {
        found.add(colorName);
      }
    }

    return [...found];
  }

  private extractMaterials(data: Record<string, any>): string[] {
    const compositions: Record<string, any>[] = data.compositions ?? [];
    const found = new Set<string>();

    for (const comp of compositions) {
      let materialName: string = (comp.material ?? '').trim();
      if (materialName) {
        if (materialName.startsWith('Synthetic->')) {
          materialName = materialName.replace('Synthetic->', '');
        }
        const token = formatEnum(materialName);
        if (token) {
          found.add(token);
        }
      }
    }

    return [...found];
  }
}
