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
  colorKeywords,
  formatEnum,
  materialKeywords,
} from '../../utils/product-fields';
import { ZARA_CATEGORIES } from './zara.categories';

interface ZaraLink {
  link: string;
  category: string;
  subcategory: string;
}

const HEADERS = { Accept: '*/*' };

/**
 * Zara scraper. Uses Zara's internal `?ajax=true` category + product JSON.
 * Port of the Python `ZaraScraper`.
 */
export class ZaraScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'zara',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.zara.com/us/en/',
        metadata: {
          name: 'Zara',
          description: 'Scrapes Zara via internal ajax JSON endpoints',
          tags: ['zara', 'shopping'],
        },
        collectionName: 'zara',
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

  private async getLinks(): Promise<ZaraLink[]> {
    const links: ZaraLink[] = [];
    const seen = new Set<string>();

    for (const category of ZARA_CATEGORIES) {
      for (const sub of category.subs) {
        try {
          const data = await this.http.getJson<{
            productGroups?: {
              elements?: {
                commercialComponents?: {
                  seo?: { keyword?: string; seoProductId?: string };
                }[];
              }[];
            }[];
          }>(sub.link, { headers: HEADERS });
          this.stats.pagesFetched++;

          for (const group of data.productGroups ?? []) {
            for (const element of group.elements ?? []) {
              for (const component of element.commercialComponents ?? []) {
                const seo = component.seo;
                if (!seo?.keyword || !seo?.seoProductId) {
                  continue;
                }
                const url = `https://www.zara.com/us/en/${seo.keyword}-p${seo.seoProductId}.html`;
                if (!seen.has(url)) {
                  seen.add(url);
                  links.push({
                    link: url,
                    category: category.main,
                    subcategory: sub.name,
                  });
                }
              }
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.warn(
            `Failed to get links for ${sub.name} in ${category.main}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: ZaraLink,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    const ajaxUrl = `${linkData.link}?ajax=true`;
    let json: { product?: Record<string, any> };
    try {
      json = await this.http.getJson<{ product?: Record<string, any> }>(
        ajaxUrl,
        { headers: HEADERS },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.link}: ${
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
      const colors: Record<string, any>[] = product.detail?.colors ?? [];

      let price: number | null = null;
      let discounted: number | null = null;
      let description = '';

      if (colors.length > 0) {
        const first = colors[0];
        price = first.oldPrice ?? null;
        if (price === null) {
          price = first.price ?? null;
        } else {
          discounted = first.price ?? null;
        }
        if (discounted !== null && price !== null && discounted > price) {
          [price, discounted] = [discounted, price];
        }
        description = first.description ?? '';
      }

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'ZARA',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory: product.subfamilyName ?? null,
        description,
        brand: 'ZARA',
        price,
        discountedPrice: discounted,
        images:
          colors.length > 0 ? this.extractImages(colors[0], seenImages) : [],
        colors: this.extractColors(colors),
        materials: this.extractMaterials(
          product.detail?.detailedComposition ?? {},
        ),
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

  private extractImages(
    colorData: Record<string, any>,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const media: Record<string, any>[] = colorData.xmedia ?? [];

    media.forEach((item, idx) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      if (item.type !== 'image') {
        return;
      }
      let url: string = item.url ?? '';
      if (url.includes('{width}')) {
        url = url.replace('{width}', '2048');
      }
      if (url && !seenImages.has(url)) {
        seenImages.add(url);
        images.push({
          url,
          name: item.name ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(colorsData: Record<string, any>[]): string[] {
    const found = new Set<string>();
    for (const colorData of colorsData) {
      const colorName: string = colorData.name ?? '';
      const lower = colorName.toLowerCase();
      let matched = false;
      for (const keyword of colorKeywords) {
        if (lower.includes(keyword.toLowerCase())) {
          const token = formatEnum(keyword);
          if (token) {
            found.add(token);
            matched = true;
          }
        }
      }
      if (!matched && colorName) {
        const token = formatEnum(colorName);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }

  private extractMaterials(composition: Record<string, any>): string[] {
    const found = new Set<string>();
    for (const part of composition.parts ?? []) {
      for (const component of part.components ?? []) {
        const material: string = (component.material ?? '').toLowerCase();
        for (const keyword of materialKeywords) {
          if (material.includes(keyword.toLowerCase())) {
            const token = formatEnum(keyword);
            if (token) {
              found.add(token);
            }
          }
        }
      }
    }
    return [...found];
  }
}
