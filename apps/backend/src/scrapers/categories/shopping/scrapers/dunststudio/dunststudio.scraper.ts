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
  colorKeywords,
  materialKeywords,
} from '../../utils/product-fields';

interface DunstStudioSub {
  name: string;
  id: number;
}

interface DunstStudioCategory {
  main: string;
  subs: DunstStudioSub[];
}

interface DunstStudioLink {
  category: string;
  subCategory: string;
  product: Record<string, any>;
}

const CATEGORIES: DunstStudioCategory[] = [
  {
    main: 'CLOTHING',
    subs: [
      { name: 'outerwear', id: 29 },
      { name: 'shirts & blouses', id: 32 },
      { name: 't-shirts', id: 31 },
      { name: 'Knitwear', id: 30 },
      { name: 'sweatshirts', id: 447 },
      { name: 'dresses & skirts', id: 33 },
      { name: 'pants', id: 34 },
    ],
  },
  {
    main: 'ACCESSORIES',
    subs: [{ name: 'accessories', id: 36 }],
  },
];

const HEADERS = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  Referer: 'https://en.dunststudio.com/category/outerwear/29/',
};

/**
 * Dunst Studio scraper. Uses the site's internal `ApiProductNormal` endpoint,
 * which returns full product data directly in the listing response — no
 * separate detail fetch is required. Port of the Python `DunstStudioScraper`.
 */
export class DunstStudioScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'dunststudio',
      ScraperCategory.SHOPPING,
      {
        url: 'https://en.dunststudio.com',
        metadata: {
          name: 'Dunst Studio',
          description:
            'Scrapes Dunst Studio via internal ApiProductNormal listing endpoint',
          tags: ['dunststudio', 'shopping'],
        },
        collectionName: 'dunststudio',
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

  private async getLinks(): Promise<DunstStudioLink[]> {
    const links: DunstStudioLink[] = [];
    const seen = new Set<number>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const url = `https://en.dunststudio.com/exec/front/Product/ApiProductNormal?cate_no=${sub.id}&supplier_code=S0000000&page=${page}&bInitMore=F&count=48`;
          try {
            const json = await this.http.getJson<{
              rtn_data?: { data?: Record<string, any>[]; end?: boolean };
            }>(url, { headers: HEADERS });
            this.stats.pagesFetched++;

            const data = json.rtn_data;
            if (!data) {
              break;
            }

            for (const product of data.data ?? []) {
              const productNo = product.product_no;
              if (!seen.has(productNo)) {
                seen.add(productNo);
                links.push({
                  category: category.main,
                  subCategory: sub.name,
                  product,
                });
              }
            }

            if (data.end) {
              break;
            }
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch DunstStudio ${sub.name} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }
          page++;
        }
      }
    }

    return links;
  }

  private parse(linkData: DunstStudioLink): ScrapedProduct | null {
    const productData = linkData.product;
    const url = `https://en.dunststudio.com${productData.link_product_detail ?? ''}`;
    const price = (productData.product_price ?? 0) * 100;

    try {
      return buildProduct({
        url,
        name: productData.product_name_striptag ?? '',
        marketplace: 'DUNSTSTUDIO',
        category: linkData.category,
        subCategory: linkData.subCategory,
        description: productData.simple_desc_important ?? null,
        brand: 'DUNSTSTUDIO',
        price,
        discountedPrice: null,
        images: this.extractImages(productData),
        colors: this.extractColors(productData),
        materials: this.extractMaterials(productData),
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
    productData: Record<string, any>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const name = productData.product_name_striptag ?? '';

    if (productData.image_big) {
      images.push({
        url: productData.image_big,
        name: `${name}_main`,
        isMain: true,
        order: images.length,
      });
    }

    for (let i = 1; i <= 20; i++) {
      const addImage = productData[`add_image_src${i}`];
      if (addImage) {
        images.push({
          url: addImage,
          name: `${name}_image_${i}`,
          isMain: false,
          order: images.length,
        });
      }
    }

    return images;
  }

  private extractColors(productData: Record<string, any>): string[] {
    const productName: string = (
      productData.product_name_striptag ?? ''
    ).toUpperCase();
    const found = new Set<string>();
    for (const color of colorKeywords) {
      if (productName.includes(color.toUpperCase())) {
        const token = formatEnum(color);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }

  private extractMaterials(productData: Record<string, any>): string[] {
    const description: string = productData.simple_desc_important ?? '';
    const productName: string = productData.product_name_striptag ?? '';
    const combined = `${productName} ${description}`.toLowerCase();
    const found = new Set<string>();
    for (const material of materialKeywords) {
      if (combined.includes(material.toLowerCase())) {
        const token = formatEnum(material);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
