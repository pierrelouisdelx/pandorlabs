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

interface SensoLink {
  link: string;
  category: string;
  subCategory: string;
}

const CATEGORIES = [
  { main: 'SHOES', subs: ['BOOTS', 'HEELS', 'SANDALS', 'FLATS'] },
];

/**
 * Senso scraper. WooCommerce-based HTML site, categories fetched with
 * `perpage=-1` (single page per sub-category). Port of the Python `SensoScraper`.
 */
export class SensoScraper extends FashionScraper {
  private readonly unique_images = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'senso',
      ScraperCategory.SHOPPING,
      {
        url: 'https://senso.com.au',
        metadata: {
          name: 'Senso',
          description:
            'Scrapes Senso WooCommerce category + product pages (HTML) via cheerio',
          tags: ['senso', 'shopping'],
        },
        collectionName: 'senso',
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

  private async getLinks(): Promise<SensoLink[]> {
    const links: SensoLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        const url = `https://senso.com.au/product-category/${sub.toLowerCase()}/?perpage=-1&v=0b3b97fa6688`;
        try {
          const html = await this.http.getText(url);
          this.stats.pagesFetched++;

          const $ = cheerio.load(html);
          $('a.woocommerce-loop-product__link').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              links.push({
                link: href,
                category: category.main,
                subCategory: sub,
              });
            }
          });
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${sub}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: SensoLink,
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

      const subCategoryFromPage = $('h5').first().text().trim();
      const finalSubCategory = linkData.subCategory || subCategoryFromPage;

      const name = $('h1.product_title').first().text().trim();

      const prices = $('span.woocommerce-Price-amount');
      let price: number | null = null;
      let discountedPrice: number | null = null;
      if (prices.length > 1) {
        discountedPrice = extractPrice($(prices[0]).text());
        price = extractPrice($(prices[1]).text());
      } else if (prices.length === 1) {
        price = extractPrice($(prices[0]).text());
      }

      const description = $('div.accordion-content').first().text().trim();

      return buildProduct({
        url: link,
        name,
        marketplace: 'SENSO',
        category: linkData.category,
        subCategory: finalSubCategory,
        description,
        brand: 'SENSO',
        price,
        discountedPrice:
          discountedPrice && discountedPrice > 0 ? discountedPrice : null,
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
    const containers = $('div.gallery-menu').find(
      'div.woocommerce-product-gallery__image',
    );
    containers.each((idx, container) => {
      const img = $(container).find('img').first();
      const src = img.attr('src');
      if (!src || this.unique_images.has(src)) {
        return;
      }
      this.unique_images.add(src);
      images.push({
        url: src,
        name: img.attr('alt') ?? '',
        isMain: idx === 0,
        order: images.length,
      });
    });
    return images;
  }

  private extractColors($: cheerio.CheerioAPI): string[] {
    let colorName = $('h3').first().text().trim();

    if (!colorName) {
      const attributesTable = $('table.woocommerce-product-attributes');
      const colorRow = attributesTable.find(
        'tr.woocommerce-product-attributes-item--attribute_pa_color',
      );
      const colorCell = colorRow.find(
        'td.woocommerce-product-attributes-item__value',
      );
      colorName = colorCell.find('a').first().text().trim();
    }

    if (!colorName) {
      return [];
    }

    const found = new Set<string>();
    for (const keyword of colorKeywords) {
      if (colorName.toLowerCase().includes(keyword.toLowerCase())) {
        const token = formatEnum(keyword);
        if (token) {
          found.add(token);
        }
      }
    }
    if (found.size === 0) {
      const token = formatEnum(colorName);
      if (token) {
        found.add(token);
      }
    }
    return [...found];
  }
}
