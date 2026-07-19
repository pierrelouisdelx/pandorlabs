import * as cheerio from 'cheerio';
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
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface JcrewLink {
  link: string;
  category: string;
  subcategory: string;
  productId: string;
}

interface JcrewCategory {
  main: string;
  subs: string[];
}

const CATEGORIES: JcrewCategory[] = [
  {
    main: 'shoes',
    subs: [
      'espadrilles',
      'sandals',
      'ballets',
      'oxfords-and-loafers',
      'heels',
      'sneakers',
    ],
  },
  {
    main: 'clothing',
    subs: [
      'sweaters',
      'pants',
      'jeans',
      'shirts-and-tops',
      'dresses-and-jumpsuits',
      'blazers',
      'tees-and-tanks',
      'coats-and-jackets',
      'skirts',
      'shorts',
      'pajamas-and-intimates',
      'swim',
      'suiting',
      'sweatshirts-and-sweatpants',
    ],
  },
  { main: 'jewelry', subs: ['jewelry'] },
  { main: 'bags', subs: ['bags'] },
  {
    main: 'accessories',
    subs: ['hats', 'belts', 'hair', 'socks-and-tights'],
  },
];

const BASE_HEADERS = {
  Accept: '*/*',
  'Content-Type': 'application/json',
};

/**
 * JCrew scraper. Uses JCrew's internal `product_search` listing endpoint and
 * `browse/products/(id)` detail endpoint. Port of the Python `JcrewScraper`.
 */
export class JcrewScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'jcrew',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.jcrew.com',
        metadata: {
          name: 'J.Crew',
          description:
            'Scrapes J.Crew via the internal product_search + browse/products JSON endpoints',
          tags: ['jcrew', 'shopping'],
        },
        collectionName: 'jcrew',
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

  private async getLinks(): Promise<JcrewLink[]> {
    const links: JcrewLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let start = 0;
        while (true) {
          const url =
            `https://www.jcrew.com/browse/product_search?count=60&start=${start}` +
            `&refine=cgid%3Dwomens%7Ccategories%7C${category.main}%7C${sub}&country-code=US`;

          let data: { hits?: Record<string, any>[] };
          try {
            data = await this.http.getJson<{ hits?: Record<string, any>[] }>(
              url,
              {
                headers: {
                  ...BASE_HEADERS,
                  Referer: `https://www.jcrew.com/plp/womens/categories/${category.main}/${sub}`,
                },
              },
            );
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch JCrew ${category.main}/${sub} start ${start}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          if (!data.hits || data.hits.length === 0) {
            break;
          }

          for (const product of data.hits) {
            if (!product.c_customData) {
              continue;
            }
            const productName: string = product.product_name ?? '';
            const productId: string = String(product.product_id ?? '').split(
              '-',
            )[0];
            const representedProduct: string | undefined =
              product.represented_product?.id;
            if (!representedProduct) {
              continue;
            }

            const properties = product.c_customData?.hitProductProperties ?? {};
            const categories: string = properties.primaryCategoryId ?? '';

            const link =
              'https://www.jcrew.com/p/' +
              categories.split('|').join('/') +
              '/' +
              productName.toLowerCase().replace(/ /g, '-') +
              '/' +
              productId;

            if (!seen.has(representedProduct)) {
              seen.add(representedProduct);
              links.push({
                link,
                category: category.main,
                subcategory: sub,
                productId: representedProduct,
              });
            }
          }

          start += 60;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: JcrewLink,
  ): Promise<ScrapedProduct | null> {
    const url =
      `https://www.jcrew.com/browse/products/(${linkData.productId})` +
      `?expand=availability%2Cvariations%2Cprices%2Cset_products&display=all&country-code=US`;

    let json: { data?: Record<string, any>[] };
    try {
      json = await this.http.getJson<{ data?: Record<string, any>[] }>(url, {
        headers: BASE_HEADERS,
      });
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
      const data = json.data?.[0];
      if (!data) {
        return null;
      }

      const name: string = data.name ?? '';
      const rawPrice: number | undefined = data.price;
      const priceCents =
        typeof rawPrice === 'number' ? Math.round(rawPrice * 100) : null;

      let description: string =
        data.long_description ?? data.short_description ?? '';
      if (description) {
        description = cheerio.load(description).text().trim();
      }

      let subSubCategory: string | null = null;
      const defaultCategoryId: string = data.c_defaultCategoryId ?? '';
      if (defaultCategoryId) {
        const sscat = defaultCategoryId.split('~').pop() ?? '';
        if (
          sscat &&
          sscat !== linkData.category &&
          sscat !== linkData.subcategory
        ) {
          subSubCategory = sscat;
        }
      }

      const colorSlug: string = (data['c_color-value'] ?? '')
        .toLowerCase()
        .replace(/ /g, '-');
      const productUrl = colorSlug
        ? `${linkData.link}?color_name=${colorSlug}`
        : linkData.link;

      return buildProduct({
        url: productUrl,
        name,
        marketplace: 'JCREW',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory,
        description,
        brand: 'JCREW',
        price: priceCents,
        images: this.extractImages(data),
        colors: this.extractColors(data),
        materials: this.extractMaterials(data),
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

  private extractImages(data: Record<string, any>): ScrapedProductImage[] {
    const baseImageUrl: string = (data.c_imageURL ?? '').split('?')[0];
    if (!baseImageUrl) {
      return [];
    }
    return [
      {
        url: baseImageUrl,
        name: data.name ?? '',
        isMain: true,
        order: 0,
      },
    ];
  }

  private extractColors(data: Record<string, any>): string[] {
    const found = new Set<string>();
    const attributes: Record<string, any>[] = data.variation_attributes ?? [];

    for (const attr of attributes) {
      if (attr.id !== 'color') {
        continue;
      }
      for (const colorValue of attr.values ?? []) {
        const colorName: string = colorValue.name ?? '';
        if (!colorName) {
          continue;
        }
        let matched = false;
        for (const keyword of colorKeywords) {
          if (colorName.toLowerCase().includes(keyword.toLowerCase())) {
            const token = formatEnum(keyword);
            if (token) {
              found.add(token);
              matched = true;
            }
          }
        }
        if (!matched) {
          const token = formatEnum(colorName);
          if (token) {
            found.add(token);
          }
        }
      }
    }

    return [...found];
  }

  private extractMaterials(data: Record<string, any>): string[] {
    const descriptions: string[] = [];
    if (data.long_description) {
      descriptions.push(String(data.long_description).toLowerCase());
    }
    if (data.short_description) {
      descriptions.push(String(data.short_description).toLowerCase());
    }
    if (data.c_longDescriptionTech) {
      descriptions.push(String(data.c_longDescriptionTech).toLowerCase());
    }
    return extractMaterialsFromText(descriptions.join(' '));
  }
}
