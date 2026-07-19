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

interface LvLink {
  link: string;
  category: string;
}

const CATEGORIES: { name: string; link: string }[] = [
  { name: 'BAGS', link: 'tfr7qdp' },
  { name: 'SHOES', link: 't1mcbujj' },
  { name: 'CLOTHING', link: 'to8aw9x' },
  { name: 'JEWELRY', link: 'tqnlr03' },
];

const HEADERS = {
  Accept: '*/*',
  Referer:
    'https://us.louisvuitton.com/eng-us/women/shoes/all-shoes/_/N-t1mcbujj',
  client_id: '607e3016889f431fb8020693311016c9',
  client_secret: '60bbcdcD722D411B88cBb72C8246a22F',
};

/**
 * Louis Vuitton scraper. Uses LV's internal `search-merch-eapi` listing +
 * `catalog/product` detail JSON endpoints.
 * Port of the Python `LouisVuittonScraper`.
 *
 * Note: the source routed both requests through a hardcoded MITM proxy URL
 * (`settings.MITM_PROXY_URL`); that's dropped here in favor of the base
 * client's own proxy rotation, per the porting guide.
 */
export class LouisVuittonScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'louis_vuitton',
      ScraperCategory.SHOPPING,
      {
        url: 'https://us.louisvuitton.com/eng-us',
        metadata: {
          name: 'Louis Vuitton',
          description:
            'Scrapes Louis Vuitton via the internal search-merch-eapi + catalog/product endpoints',
          tags: ['louis_vuitton', 'shopping', 'luxury'],
        },
        collectionName: 'louis_vuitton',
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

  private async getLinks(): Promise<LvLink[]> {
    const links: LvLink[] = [];

    for (const category of CATEGORIES) {
      const url = `https://api.louisvuitton.com/eco-eu/search-merch-eapi/v1/eng-us/plp/products/${category.link}`;
      try {
        const data = await this.http.getJson<{
          hits?: { url: string }[];
        }>(url, { headers: HEADERS });
        this.stats.pagesFetched++;

        for (const product of data.hits ?? []) {
          links.push({ link: product.url, category: category.name });
        }
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to fetch LV links for ${category.name}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: LvLink,
  ): Promise<ScrapedProduct | null> {
    const sku = linkData.link.split('/').pop() ?? linkData.link;
    const apiUrl = `https://api.louisvuitton.com/api/eng-us/catalog/product/${sku}`;

    let data: Record<string, any>;
    try {
      data = await this.http.getJson<Record<string, any>>(apiUrl, {
        headers: HEADERS,
      });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${apiUrl}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const priceSpecs: Record<string, any>[] =
        data.offers?.priceRawSpecification ?? [];
      const rawPrice = priceSpecs[0]?.priceRaw;
      const priceCents =
        typeof rawPrice === 'number' ? Math.round(rawPrice * 100) : null;

      return buildProduct({
        url: linkData.link,
        name: data.name ?? '',
        marketplace: 'LOUIS_VUITTON',
        category: linkData.category,
        description: data.disambiguatingDescription ?? '',
        brand: 'LOUIS_VUITTON',
        price: priceCents,
        images: this.extractImages(data),
        colors: this.extractColors(data.color),
        materials: this.extractMaterials(data.material),
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
    const images: Record<string, any>[] = data.images ?? [];
    return images.map((image, idx) => ({
      url: (image.url ?? '')
        .replace('{IMG_WIDTH}', '2048')
        .replace('{IMG_HEIGHT}', '2048'),
      name: `${data.name ?? ''}_image_${idx}`,
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(color: string | undefined): string[] {
    if (!color) {
      return [];
    }
    const token = formatEnum(color);
    return token ? [token] : [];
  }

  private extractMaterials(materialStr: string | undefined): string[] {
    if (!materialStr) {
      return [];
    }
    const parts = materialStr.toUpperCase().replace(/&/g, ',').split(',');
    const found = new Set<string>();
    for (const part of parts) {
      const token = formatEnum(part.trim());
      if (token) {
        found.add(token);
      }
    }
    return [...found];
  }
}
