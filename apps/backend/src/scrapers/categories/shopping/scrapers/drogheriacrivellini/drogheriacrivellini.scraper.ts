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
  colorKeywords,
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface DrogheriaCrivelliniLink {
  link: string;
  category: string;
  subCategory: string;
}

interface DrogheriaCrivelliniCategory {
  main: string;
  subs: string[];
}

const CATEGORIES: DrogheriaCrivelliniCategory[] = [
  {
    main: 'SHOES',
    subs: [
      '13-fu-geta',
      '3-fu-tabi',
      '27-fu-kung',
      '14-square-toe',
      '6-papusse-soft-mary-jane',
      '19-ballet-round',
      '4-mary-jane',
      '10-classic',
      '26-mules',
      '15-limited',
    ],
  },
  { main: 'CLOTHING', subs: ['11-accessories'] },
];

const HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  Referer: 'https://drogheriacrivellini.com/en/',
};

/**
 * Drogheria Crivellini scraper. Discovers products from paginated collection
 * pages (HTML → cheerio) and fetches product detail pages for full parsing.
 * Port of the Python `DrogheriaCrivelliniScraper`.
 */
export class DrogheriaCrivelliniScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'drogheriacrivellini',
      ScraperCategory.SHOPPING,
      {
        url: 'https://drogheriacrivellini.com/en/',
        metadata: {
          name: 'Drogheria Crivellini',
          description: 'Scrapes Drogheria Crivellini collection pages (HTML)',
          tags: ['drogheriacrivellini', 'shopping'],
        },
        collectionName: 'drogheriacrivellini',
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

  private async getLinks(): Promise<DrogheriaCrivelliniLink[]> {
    const links: DrogheriaCrivelliniLink[] = [];

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const url = `https://drogheriacrivellini.com/en/${sub}?page=${page}`;
          try {
            const html = await this.http.getText(url, { headers: HEADERS });
            this.stats.pagesFetched++;

            const $ = cheerio.load(html);
            const productList = $('div#js-product-list');
            if (productList.length === 0) {
              break;
            }

            const found = productList.find('a.product-thumbnail');
            if (found.length === 0) {
              break;
            }

            found.each((_, el) => {
              const href = $(el).attr('href');
              if (href) {
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
              `Failed to fetch Drogheria Crivellini ${sub} page ${page}: ${
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
    linkData: DrogheriaCrivelliniLink,
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
      const mainProduct = $('div#main-product-wrapper');
      if (mainProduct.length === 0) {
        return null;
      }

      const productSummary = mainProduct.find('div.col-md-5').first();
      if (productSummary.length === 0) {
        return null;
      }

      const name = productSummary.find('h1.page-title').first().text().trim();

      let price: number | null;
      let discountedPrice: number | null;
      const regularPriceEl = productSummary.find('span.regular-price').first();
      if (regularPriceEl.length > 0) {
        price = extractPrice(regularPriceEl.text().trim());
        discountedPrice = extractPrice(
          productSummary.find('span.current-price').first().text().trim(),
        );
      } else {
        price = extractPrice(
          productSummary.find('span.current-price').first().text().trim(),
        );
        discountedPrice = null;
      }

      let description = '';
      const descriptionEl = productSummary
        .find('div.product-description')
        .first();
      if (descriptionEl.length > 0) {
        const p = descriptionEl.find('p').first();
        if (p.length > 0) {
          description = p.text().trim();
        }
      }

      const subCategory = linkData.subCategory.replace(/[^a-zA-Z]/g, '');

      return buildProduct({
        url,
        name,
        marketplace: 'DROGHERIA_CRIVELLINI',
        category: linkData.category,
        subCategory,
        description,
        brand: 'DROGHERIA_CRIVELLINI',
        price,
        discountedPrice,
        images: this.extractImages($, name),
        colors: this.extractColors(name + description),
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

  private extractImages(
    $: cheerio.CheerioAPI,
    name: string,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const container = $('div.col-product-image');
    if (container.length === 0) {
      return images;
    }

    const slides = container.find('div.product-lmage-large');
    slides.each((idx, slide) => {
      const img = $(slide).find('img').first();
      if (img.length === 0) {
        return;
      }
      let imgUrl: string | undefined =
        img.attr('data-image-large-src') ?? undefined;
      const src = img.attr('src');
      if (!imgUrl && src && !src.startsWith('data:image/svg+xml')) {
        imgUrl = src;
      }
      if (!imgUrl) {
        imgUrl = img.attr('data-src');
      }
      if (imgUrl) {
        images.push({
          url: imgUrl,
          name: img.attr('alt') ?? name,
          isMain: idx === 0,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(text: string): string[] {
    const lower = text.toLowerCase();
    const found = new Set<string>();
    for (const color of colorKeywords) {
      if (lower.includes(color.toLowerCase())) {
        const token = formatEnum(color);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
