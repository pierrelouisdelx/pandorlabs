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
  extractPrice,
  formatEnum,
  materialKeywords,
} from '../../utils/product-fields';

const SITEMAP_URL = 'https://hvoya.ua/en/product-sitemap.xml';
const VALID_CATEGORIES = new Set(['bags', 'shoes', 'clothes']);

/**
 * Hvoya scraper. Discovers products via the site's XML sitemap, then parses
 * WooCommerce-rendered product pages (HTML → cheerio). Port of the Python
 * `HvoyaScraper`.
 */
export class HvoyaScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'hvoya',
      ScraperCategory.SHOPPING,
      {
        url: 'https://hvoya.ua/en',
        metadata: {
          name: 'Hvoya',
          description:
            'Scrapes Hvoya via the product sitemap + WooCommerce HTML pages',
          tags: ['hvoya', 'shopping'],
        },
        collectionName: 'hvoya',
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

    for (const link of links) {
      const product = await this.fetchAndParse(link, seenImages);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<string[]> {
    let xml: string;
    try {
      xml = await this.http.getText(SITEMAP_URL);
      this.stats.pagesFetched++;
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Failed to fetch Hvoya sitemap: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }

    const $ = cheerio.load(xml, { xmlMode: true });
    const links = $('url loc')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // Port of `self.links.pop(0)`: the first sitemap entry is not a product.
    links.shift();

    return links.filter((link) => !link.includes('gift-'));
  }

  private async fetchAndParse(
    url: string,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(url);
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
      const productPage = $('div.product-page');
      if (productPage.length === 0) {
        this.logger.warn(`Product summary not found for ${url}`);
        return null;
      }

      const name = productPage.find('h1.hv-des-item').first().text().trim();
      const priceText = productPage
        .find('span.woocommerce-Price-amount')
        .first()
        .text()
        .trim();
      const price = extractPrice(priceText);
      const description = productPage
        .find('div.ks_product_content')
        .first()
        .text()
        .trim();

      const breadcrumb = $('nav.woocommerce-breadcrumb');
      let category: string | null = null;
      let subCategory: string | null = null;

      if (breadcrumb.length > 0) {
        const crumbLinks = breadcrumb.find('a');
        if (crumbLinks.length >= 2) {
          const catLink = $(crumbLinks.get(1)).text().trim().toLowerCase();
          if (!VALID_CATEGORIES.has(catLink)) {
            // Not a fashion category we track — skip, matching the Python `return`.
            return null;
          }
          category = catLink === 'clothes' ? 'CLOTHING' : formatEnum(catLink);
        }

        const separators = breadcrumb.find('span.breadcrumb-separator');
        if (separators.length >= 2) {
          const parts = breadcrumb.text().split(' ‒ ');
          if (parts.length >= 3) {
            subCategory = parts[2].trim();
          }
        }
      }

      return buildProduct({
        url,
        name,
        marketplace: 'HVOYA',
        category,
        subCategory,
        description,
        brand: 'HVOYA',
        price,
        discountedPrice: null,
        images: this.extractImages($, seenImages),
        colors: this.extractColors($),
        materials: this.extractMaterials(description),
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
    $: cheerio.CheerioAPI,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    $('div#product-img-gall-nav div.bg_cov').each((idx, el) => {
      const url = $(el).attr('data-pc-i');
      if (url && !seenImages.has(url)) {
        seenImages.add(url);
        images.push({
          url,
          name: '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors($: cheerio.CheerioAPI): string[] {
    const raw = $('fieldset.col_att').first().text().trim();
    if (!raw) {
      return [];
    }
    const token = formatEnum(raw);
    return token ? [token] : [];
  }

  private extractMaterials(description: string): string[] {
    const lower = description.toLowerCase();
    const found = new Set<string>();
    for (const material of materialKeywords) {
      if (lower.includes(material.toLowerCase())) {
        const token = formatEnum(material);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
