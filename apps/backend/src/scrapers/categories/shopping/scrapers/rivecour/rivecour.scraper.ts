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
  colorKeywords,
  extractMaterialsFromText,
  extractPrice,
  formatEnum,
} from '../../utils/product-fields';

interface RivecourLink {
  category: string;
  link: string;
}

const CATEGORIES: { path: string; category: string }[] = [
  { path: '356-new-in', category: 'SHOES' },
  { path: '442-babies-et-loafers', category: 'SHOES' },
  { path: '410-pumps-and-slingbacks', category: 'SHOES' },
  { path: '191-heeled-sandals', category: 'SHOES' },
  { path: '190-flat-sandals', category: 'SHOES' },
  { path: '411-clogs-and-mules', category: 'SHOES' },
  { path: '13-sneakers', category: 'SHOES' },
  { path: '6-bags', category: 'BAGS' },
];

/**
 * Rivecour scraper. HTML link discovery via cheerio + per-product HTML parse.
 * Port of the Python `RivecourScraper`.
 *
 * Note: the source also had an unused `_extract_price_from_datalayer` helper
 * (regex over inline `dataLayer` scripts) that was never called from
 * `_parse_product_from_raw` — dead code, not ported.
 */
export class RivecourScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'rivecour',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.rivecour.com/en',
        metadata: {
          name: 'Rivecour',
          description: 'Scrapes Rivecour category pages (HTML) via cheerio',
          tags: ['rivecour', 'shopping'],
        },
        collectionName: 'rivecour',
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

  private async getLinks(): Promise<RivecourLink[]> {
    const links: RivecourLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;

      while (true) {
        const url = `https://www.rivecour.com/en/${category.path}?page=${page}`;
        let html: string;
        try {
          html = await this.http.getText(url);
          this.stats.pagesFetched++;
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category.category} page ${page}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }

        const $ = cheerio.load(html);
        const products = $('a.product-thumbnail');
        if (products.length === 0) {
          break;
        }

        products.each((_, el) => {
          const href = $(el).attr('href');
          if (href && !seen.has(href)) {
            seen.add(href);
            links.push({ category: category.category, link: href });
          }
        });

        page++;
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: RivecourLink,
  ): Promise<ScrapedProduct | null> {
    const link = linkData.link;
    let html: string;
    try {
      html = await this.http.getText(link);
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${link}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }

    try {
      const $ = cheerio.load(html);

      const name = $('div.product_header_title').text().trim();

      const regularPriceEl = $('span.regular-price');
      let price: number | null;
      let discountedPrice: number | null;
      if (regularPriceEl.length > 0) {
        price = extractPrice($('div.current-price').text().trim());
        discountedPrice = extractPrice(regularPriceEl.text().trim());
      } else {
        price = extractPrice($('div.current-price').text().trim());
        discountedPrice = null;
      }

      const description = $('div.product-description')
        .find('p')
        .first()
        .text()
        .trim();

      const breadcrumbItems = $('nav.breadcrumb').find('a');
      let subCategory: string | null = null;
      let subSubCategory: string | null = null;
      if (breadcrumbItems.length > 2) {
        subCategory = $(breadcrumbItems[breadcrumbItems.length - 2])
          .text()
          .trim();
        subSubCategory = $(breadcrumbItems[breadcrumbItems.length - 1])
          .text()
          .trim();
      } else if (breadcrumbItems.length > 0) {
        subCategory = $(breadcrumbItems[breadcrumbItems.length - 1])
          .text()
          .trim();
      }

      return buildProduct({
        url: link,
        name,
        marketplace: 'RIVECOUR',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand: 'RIVECOUR',
        price,
        discountedPrice,
        images: this.extractImages($),
        colors: this.extractColors($),
        materials: extractMaterialsFromText(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${link}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private extractImages($: cheerio.CheerioAPI): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    $('ul.product-images')
      .find('img')
      .each((idx, el) => {
        const url = $(el).attr('data-image-large-src');
        if (!url) {
          return;
        }
        images.push({
          url,
          name: $(el).attr('alt') ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      });
    return images;
  }

  private extractColors($: cheerio.CheerioAPI): string[] {
    const ref = $('div.productColor').attr('ref');
    if (!ref) {
      return [];
    }
    if (colorKeywords.includes(ref.toLowerCase())) {
      const token = formatEnum(ref);
      return token ? [token] : [];
    }
    return [];
  }
}
