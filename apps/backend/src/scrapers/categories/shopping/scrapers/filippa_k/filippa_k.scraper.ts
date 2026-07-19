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
  extractPrice,
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface FilippaKSub {
  name: string;
  handle: string;
}

interface FilippaKCategory {
  main: string;
  link: string;
  subs: FilippaKSub[];
}

interface FilippaKLink {
  link: string;
  category: string;
  subcategory: string;
}

const CATEGORIES: FilippaKCategory[] = [
  {
    main: 'CLOTHING',
    link: 'https://www.filippa-k.com/us/en/woman/',
    subs: [
      { name: 'coats-jackets', handle: 'woman-outerwear' },
      { name: 'trousers-shorts', handle: 'woman-trousers' },
      { name: 'knitwear', handle: 'woman-sweaters' },
      { name: 'tops-t-shirts', handle: 'woman-tops' },
      { name: 'jeans', handle: 'woman-denim' },
      { name: 'blazers', handle: 'woman-blazers' },
      { name: 'tailoring', handle: 'woman-tailoring-plp' },
      { name: 'shirts-blouses', handle: 'woman-shirts' },
      { name: 'dresses', handle: 'woman-dresses' },
      { name: 'skirts', handle: 'woman-skirts' },
      { name: 'leggings', handle: 'woman-leggings' },
      { name: 'ready-to-wear', handle: 'woman-ready-to-wear' },
    ],
  },
  {
    main: 'ACCESSORIES',
    link: 'https://www.filippa-k.com/us/en/woman/accessories',
    subs: [
      { name: 'belts', handle: 'woman-belts' },
      { name: 'hats-scarves', handle: 'woman-hats-scarves' },
    ],
  },
  {
    main: 'SHOES',
    link: 'https://www.filippa-k.com/us/en/woman/shoes',
    subs: [{ name: 'shoes', handle: 'woman-shoes' }],
  },
  {
    main: 'BAGS',
    link: 'https://www.filippa-k.com/us/en/woman/bags',
    subs: [{ name: 'bags', handle: 'woman-bags' }],
  },
];

const HEADERS = { Referer: 'https://www.filippa-k.com/us/en/woman/' };

/**
 * Filippa K scraper. Discovers products from the SFCC `Search-UpdateGrid`
 * ajax endpoint (HTML fragment → cheerio) and parses product detail pages via
 * their embedded JSON-LD schema.
 * Port of the Python `FilippaKScraper`.
 */
export class FilippaKScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'filippa_k',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.filippa-k.com/us/en/woman/',
        metadata: {
          name: 'Filippa K',
          description:
            'Scrapes Filippa K via the SFCC Search-UpdateGrid ajax endpoint',
          tags: ['filippa_k', 'shopping'],
        },
        collectionName: 'filippa_k',
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

  private async getLinks(): Promise<FilippaKLink[]> {
    const links: FilippaKLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      try {
        // The Python fetches the category landing page first (its response is
        // unused beyond warming cookies); we mirror the request for parity.
        await this.http.getText(category.link, { headers: HEADERS });
        this.stats.pagesFetched++;
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.warn(
          `Failed to fetch Filippa K category landing page ${category.link}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      for (const sub of category.subs) {
        let start = 0;
        let hasNextPage = true;

        while (hasNextPage) {
          const url = `https://www.filippa-k.com/on/demandware.store/Sites-FilippaK-Site/en_US/Search-UpdateGrid?cgid=${sub.handle}&start=${start}&sz=24`;
          try {
            const html = await this.http.getText(url, { headers: HEADERS });
            this.stats.pagesFetched++;

            const $ = cheerio.load(html);
            const tiles = $('div.product-tile');
            if (tiles.length === 0) {
              hasNextPage = false;
              break;
            }

            tiles.each((_, tile) => {
              const a = $(tile).find('a').first();
              const href = a.attr('href');
              if (!href) {
                return;
              }
              const link = `https://www.filippa-k.com${href}`;
              if (!seen.has(link)) {
                seen.add(link);
                links.push({
                  link,
                  category: category.main,
                  subcategory: sub.name,
                });
              }
            });
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch Filippa K ${sub.name} start ${start}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }
          start += 96;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: FilippaKLink,
  ): Promise<ScrapedProduct | null> {
    const url = linkData.link;
    let html: string;
    try {
      html = await this.http.getText(url, { headers: HEADERS });
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
      const $ = cheerio.load(html);
      const jsonSchema = $('script[type="application/ld+json"]').first();
      if (jsonSchema.length === 0) {
        this.logger.warn(`No JSON-LD schema found for ${url}`);
        return null;
      }

      const productData = JSON.parse(jsonSchema.html() ?? '{}');

      const name: string = productData.name ?? '';
      const price = extractPrice(String(productData.offers?.price ?? ''));
      const description: string = productData.description ?? '';

      let subSubCategory: string | null = null;
      const breadcrumbNav =
        $('nav[aria-label="breadcrumb"]').first().length > 0
          ? $('nav[aria-label="breadcrumb"]').first()
          : $('ol.breadcrumb').first();
      if (breadcrumbNav.length > 0) {
        const items = breadcrumbNav.find('a');
        if (items.length > 2) {
          const lastBreadcrumb = formatEnum(
            $(items[items.length - 1])
              .text()
              .trim(),
          );
          if (lastBreadcrumb !== linkData.subcategory) {
            subSubCategory = lastBreadcrumb;
          }
        }
      }

      const images: string[] = Array.isArray(productData.image)
        ? productData.image
        : productData.image
          ? [productData.image]
          : [];

      return buildProduct({
        url,
        name,
        marketplace: 'FILIPPA_K',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory,
        description,
        brand: 'FILIPPA_K',
        price,
        discountedPrice: null,
        images: this.extractImages(images),
        colors: this.extractColors($),
        materials: extractMaterialsFromText(description),
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

  private extractImages(images: string[]): ScrapedProductImage[] {
    return images.map((image, idx) => ({
      url: image,
      name: `Image ${idx + 1}`,
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors($: cheerio.CheerioAPI): string[] {
    const el = $('span.js-selected-color').first();
    if (el.length === 0) {
      return [];
    }
    const color = el.text().trim();
    if (!color) {
      return [];
    }
    const token = formatEnum(color);
    return token ? [token] : [];
  }
}
