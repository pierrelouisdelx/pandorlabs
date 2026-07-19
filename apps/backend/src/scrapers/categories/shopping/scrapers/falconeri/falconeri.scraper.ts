import { Connection } from 'mongoose';
import { ProductCategory } from '@pandorlabs/types';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
} from '../../utils/product';
import { formatEnum, materialKeywords } from '../../utils/product-fields';

interface FalconeriCategory {
  main: ProductCategory;
  subs: string[];
}

interface FalconeriLink {
  id: string;
  url: string;
  category: ProductCategory;
}

const CATEGORIES: FalconeriCategory[] = [
  { main: ProductCategory.ACCESSORIES, subs: ['FAL_Women_Accessories'] },
  {
    main: ProductCategory.CLOTHING,
    subs: [
      'FAL_Women_Coats-And-Jackets',
      'FAL_Women_Pants',
      'FAL_Women_Knitwear',
      'FAL_Women_Tailleur',
      'FAL_Women_Leisurewear',
      'FAL_Women_Shirts-And-Blouses',
      'FAL_Women_Tshirts-And-Tops',
      'FAL_Women_Dresses-And-Skirts',
    ],
  },
];

// Note: the Python source hardcoded a bearer token + correlation-id for the
// SFCC "shopper" API; those are short-lived session tokens. We drop them —
// unauthenticated requests to this endpoint will likely 401/403.
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * Falconeri scraper. Uses the Salesforce Commerce Cloud "shopper" search +
 * product JSON APIs (mobify proxy). Port of the Python `FalconeriScraper`.
 *
 * The Python source embedded a hardcoded SFCC bearer token which expires
 * quickly and cannot be regenerated without a browser session; requests will
 * likely fail with 401 here — that's expected and acceptable per the porting
 * guide (no cookie/session manager ported).
 */
export class FalconeriScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'falconeri',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.falconeri.com',
        metadata: {
          name: 'Falconeri',
          description:
            'Scrapes Falconeri via the SFCC shopper-search/shopper-products JSON APIs',
          tags: ['falconeri', 'shopping'],
        },
        collectionName: 'falconeri',
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

  private async getLinks(): Promise<FalconeriLink[]> {
    const links: FalconeriLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 0;
        let maxPages = 2;

        while (page <= maxPages) {
          const offset = page * 20;
          const url =
            `https://www.falconeri.com/mobify/proxy/api/search/shopper-search/v1/organizations/f_ecom_bkql_prd/product-search` +
            `?siteId=falconeri-us&refine=cgid%3D${sub}&refine=price%3D%280.01..10000000%29&sort=best-matches` +
            `&currency=USD&locale=en-US&expand=none&offset=${offset}&limit=20&c_category=${sub}`;

          try {
            const data = await this.http.getJson<{
              hits?: {
                representedProduct?: { id?: string };
                c_seourl?: string;
              }[];
              total?: number;
            }>(url, { headers: HEADERS });
            this.stats.pagesFetched++;

            if (!data.hits) {
              break;
            }

            for (const hit of data.hits) {
              const productId = hit.representedProduct?.id;
              if (productId && !seen.has(productId)) {
                seen.add(productId);
                links.push({
                  id: productId,
                  url: hit.c_seourl ?? '',
                  category: category.main,
                });
              }
            }

            if ((data.total ?? 0) > maxPages * 24) {
              maxPages = Math.floor((data.total ?? 0) / 24);
            }
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch Falconeri ${sub} page ${page}: ${
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

  private async fetchAndParse(
    linkData: FalconeriLink,
  ): Promise<ScrapedProduct | null> {
    const url =
      `https://www.falconeri.com/mobify/proxy/api/product/shopper-products/v1/organizations/f_ecom_bkql_prd/products/${linkData.id}` +
      `?currency=USD&expand=availability%2Cvariations&locale=en-US&siteId=falconeri-us`;

    let json: { data?: Record<string, any>[] };
    try {
      json = await this.http.getJson<{ data?: Record<string, any>[] }>(url, {
        headers: HEADERS,
      });
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
      const data = json.data?.[0];
      if (!data) {
        return null;
      }

      return buildProduct({
        url: linkData.url,
        name: data.name ?? '',
        marketplace: 'FALCONERI',
        category: linkData.category,
        subCategory: data.c_categoryName ?? null,
        description: data.shortDescription ?? null,
        brand: data.brand ?? 'FALCONERI',
        price: data.price ?? null,
        discountedPrice: null,
        images: this.extractImages(data.imageGroups?.[0]?.images ?? []),
        colors: this.extractColors(data.c_colorDescription ?? ''),
        materials: this.extractMaterials(data),
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

  private extractImages(images: Record<string, any>[]): ScrapedProductImage[] {
    return images.map((image, idx) => ({
      url: image.link,
      name: image.alt ?? '',
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(color: string): string[] {
    if (!color) {
      return [];
    }
    const token = formatEnum(color);
    return token ? [token] : [];
  }

  private extractMaterials(data: Record<string, any>): string[] {
    const found = new Set<string>();
    if (data.c_material) {
      const token = formatEnum(data.c_material);
      if (token) {
        found.add(token);
      }
    } else if (data.longDescription) {
      const lower: string = data.longDescription.toLowerCase();
      for (const material of materialKeywords) {
        if (lower.includes(material.toLowerCase())) {
          const token = formatEnum(material);
          if (token) {
            found.add(token);
          }
        }
      }
    }
    return [...found];
  }
}
