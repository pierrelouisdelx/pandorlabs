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

interface CasadeiLink {
  id: string;
  url: string;
  category: string;
}

const CATEGORIES = ['shoes', 'bags'];

// Note: the source hardcodes a `Authorization: Bearer <JWT>` guest-session
// token (already expired) and routes through a local MITM proxy for cookie
// injection. Per the porting guide we drop both — this relies on the base
// client's proxy/TLS impersonation instead, so 401/403 at runtime is
// expected until a real session is available.
const HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Sec-GPC': '1',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  Connection: 'keep-alive',
};

/**
 * Casadei scraper. Uses the Salesforce Commerce Cloud (SFCC) shopper-search
 * and shopper-products APIs exposed via Casadei's `/mobify/proxy` gateway.
 * Port of the Python `CasadeiScraper`.
 */
export class CasadeiScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'casadei',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.casadei.com/en-us/',
        metadata: {
          name: 'Casadei',
          description: 'Scrapes Casadei via the SFCC shopper-search API',
          tags: ['casadei', 'shopping'],
        },
        collectionName: 'casadei',
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

  private async getLinks(): Promise<CasadeiLink[]> {
    const links: CasadeiLink[] = [];
    const seen = new Set<string>();

    for (const cat of CATEGORIES) {
      let page = 0;
      let maxPages = 2;

      while (page <= maxPages) {
        const headers = {
          ...HEADERS,
          Referer: `https://www.casadei.com/en-us/${cat}/?page=${page}`,
        };
        const url =
          `https://www.casadei.com/mobify/proxy/api/search/shopper-search/v1/organizations/f_ecom_bgdg_prd/product-search` +
          `?siteId=casadei&q=&refine=cgid%3D${cat}&sort=&currency=USD&locale=en` +
          `&allImages=false&perPricebook=false&allVariationProperties=false` +
          `&offset=${page * 24}&limit=24`;

        try {
          const data = await this.http.getJson<{
            hits?: { representedProduct: { id: string }; c_url: string }[];
            total?: number;
          }>(url, { headers });
          this.stats.pagesFetched++;

          const hits = data.hits ?? [];
          if (hits.length === 0) {
            break;
          }

          for (const product of hits) {
            const productId = product.representedProduct.id;
            if (!seen.has(productId)) {
              seen.add(productId);
              links.push({ id: productId, url: product.c_url, category: cat });
            }
          }

          if ((data.total ?? 0) > maxPages * 24) {
            maxPages = Math.floor((data.total ?? 0) / 24);
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${cat} page ${page}: ${
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
    linkData: CasadeiLink,
  ): Promise<ScrapedProduct | null> {
    const url = `https://www.casadei.com/mobify/proxy/api/product/shopper-products/v1/organizations/f_ecom_bgdg_prd/products?ids=${linkData.id}&currency=USD&locale=en&siteId=casadei`;

    let json: { data?: Record<string, any>[] };
    try {
      json = await this.http.getJson<{ data?: Record<string, any>[] }>(url, {
        headers: HEADERS,
      });
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
      const data = json.data?.[0];
      if (!data) {
        return null;
      }

      return buildProduct({
        url: linkData.url,
        name: data.name,
        marketplace: 'CASADEI',
        category: linkData.category,
        subCategory: data.c_categoryName,
        description: data.shortDescription,
        brand: data.brand,
        price: data.price,
        images: this.extractImages(data.imageGroups?.[0]?.images ?? []),
        colors: this.extractColors(data.c_colorDescription),
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

  private extractColors(color: string | null | undefined): string[] {
    const token = formatEnum(color ?? null);
    return token ? [token] : [];
  }

  private extractMaterials(data: Record<string, any>): string[] {
    if (data.c_material) {
      const token = formatEnum(data.c_material);
      return token ? [token] : [];
    }
    if (data.longDescription) {
      return extractMaterialsFromText(data.longDescription);
    }
    return [];
  }
}
