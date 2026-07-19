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
import {
  extractMaterialsFromText,
  formatEnum,
} from '../../utils/product-fields';
import { SHOPBOP_CATEGORIES } from './shopbop.categories';

interface ShopbopLink {
  link: string;
  category: string;
  subcategory: string;
  product: Record<string, any>;
}

/**
 * Shopbop scraper. Uses the public `api.shopbop.com/public/products` catalog
 * endpoint, which already returns full product detail in the listing
 * response — there is no separate per-product fetch (matching the source,
 * whose `_fetch_raw_product` just re-serializes the data collected during
 * `_get_links`). Port of the Python `ShopbopScraper`.
 */
export class ShopbopScraper extends FashionScraper {
  private readonly unique_images = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'shopbop',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.shopbop.com',
        metadata: {
          name: 'Shopbop',
          description: 'Scrapes Shopbop via the public products catalog API',
          tags: ['shopbop', 'shopping'],
        },
        collectionName: 'shopbop',
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

  private async getLinks(): Promise<ShopbopLink[]> {
    const links: ShopbopLink[] = [];
    const seen = new Set<string>();

    for (const category of SHOPBOP_CATEGORIES) {
      for (const sub of category.subs) {
        let offset = 0;

        while (true) {
          const url =
            `https://api.shopbop.com/public/products?siteId=1000&lang=en-US&currency=USD` +
            `&categoryId=${sub.link}&facetAllowList=C&offset=${offset}&limit=100` +
            `&includeFacets=true&allowOutOfStockItems=false&disableSiteEligibilityFiltering=true` +
            `&imageStrategy=Q_ASPECT`;

          try {
            const data = await this.http.getJson<{
              products?: { product: Record<string, any> }[];
            }>(url);
            this.stats.pagesFetched++;

            const products = data.products ?? [];
            if (products.length === 0) {
              break;
            }

            for (const entry of products) {
              const productData = entry.product;
              const link = productData.productDetailUrl;
              if (link && !seen.has(link)) {
                seen.add(link);
                links.push({
                  link,
                  category: category.main,
                  subcategory: sub.name,
                  product: productData,
                });
              }
            }
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub.name} offset ${offset}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          offset += 100;
        }
      }
    }

    return links;
  }

  private parse(linkData: ShopbopLink): ScrapedProduct | null {
    try {
      const productData = linkData.product;

      const brand: string = productData.designerName ?? '';
      const description: string = productData.shortDescription ?? '';
      const retailPrice = productData.retailPrice ?? {};
      const price = retailPrice.usdPrice ?? 0;

      const colors: Record<string, any>[] = productData.colors ?? [];
      const color = colors[0] ?? {};
      const colorName: string = color.name ?? '';
      const colorImages: Record<string, any>[] = color.images ?? [];

      return buildProduct({
        url: `https://www.shopbop.com${linkData.link}`,
        name: description,
        marketplace: 'SHOPBOP',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory: null,
        description,
        brand,
        price,
        discountedPrice: null,
        images: this.extractImages(colorImages),
        colors: this.extractColors(colorName),
        materials: extractMaterialsFromText(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(images: Record<string, any>[]): ScrapedProductImage[] {
    const result: ScrapedProductImage[] = [];
    images.forEach((image, idx) => {
      if (result.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      const url = `https://m.media-amazon.com/images/G/01/Shopbop/p${image.src}`;
      if (!this.unique_images.has(url)) {
        this.unique_images.add(url);
        result.push({
          url,
          name: `Image_${idx + 1}`,
          isMain: idx === 0,
          order: result.length,
        });
      }
    });
    return result;
  }

  private extractColors(colorName: string): string[] {
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }
}
