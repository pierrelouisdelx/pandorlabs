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
  extractColorsFromText,
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface EmanuelaCarousoLink {
  url: string;
  category: string;
}

const CATEGORIES: EmanuelaCarousoLink[] = [
  { url: 'https://emanuelacaruso.com/us/sandali.html', category: 'SHOES' },
  {
    url: 'https://emanuelacaruso.com/us/sandali-exclusive.html',
    category: 'SHOES',
  },
  { url: 'https://emanuelacaruso.com/us/borse.html', category: 'BAGS' },
];

/**
 * Emanuela Carouso scraper. Discovers products from paginated Magento
 * category pages (HTML → cheerio) and parses product detail pages, including
 * a regex-extracted inline `"images": [...]` JSON blob.
 * Port of the Python `EmanuelaCarousoScraper`.
 */
export class EmanuelaCarousoScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'emanuela_carouso',
      ScraperCategory.SHOPPING,
      {
        url: 'https://emanuelacaruso.com/us/',
        metadata: {
          name: 'Emanuela Carouso',
          description: 'Scrapes Emanuela Carouso category pages (HTML)',
          tags: ['emanuela_carouso', 'shopping'],
        },
        collectionName: 'emanuela_carouso',
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

  private async getLinks(): Promise<EmanuelaCarousoLink[]> {
    const links: EmanuelaCarousoLink[] = [];
    const seen = new Set<string>();

    for (const { url, category } of CATEGORIES) {
      let page = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const paginatedUrl = `${url}?p=${page}&product_list_limit=36`;
        try {
          const html = await this.http.getText(paginatedUrl);
          this.stats.pagesFetched++;

          const $ = cheerio.load(html);
          const products = $('a.product');

          const prevLen = seen.size;
          products.each((_, el) => {
            const href = $(el).attr('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              links.push({ url: href, category });
            }
          });

          if (prevLen === seen.size) {
            break;
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to fetch Emanuela Carouso ${url} page ${page}: ${
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
    linkData: EmanuelaCarousoLink,
  ): Promise<ScrapedProduct | null> {
    const url = linkData.url;
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
      const product = $('div.product-info-main').first();
      if (product.length === 0) {
        return null;
      }

      const productInfo = product.find('div').first();
      const h1 = productInfo.find('h1').first();
      const title = h1.length > 0 ? h1.text().trim() : 'No title found';

      const priceElement = productInfo.find('div.final-price').first();
      let price: number | null = null;
      if (priceElement.length > 0) {
        const priceSpans = priceElement.find('span.price');
        if (priceSpans.length > 0) {
          const priceText = $.html(priceSpans.last());
          price = extractPrice(priceText);
        }
      }

      const descriptionEl = productInfo.find('div.tab-content.py-4').first();
      const description =
        descriptionEl.length > 0 ? descriptionEl.text().trim() : '';

      let subCategory: string | null = null;
      let subSubCategory: string | null = null;
      const breadcrumbs = $('nav.breadcrumbs').first();
      if (breadcrumbs.length > 0) {
        const ol = breadcrumbs.find('ol').first();
        if (ol.length > 0) {
          const items = ol.find('li');
          if (items.length >= 2) {
            subCategory = $(items[items.length - 2])
              .text()
              .trim();
          }
          if (items.length >= 1) {
            subSubCategory = $(items[items.length - 1])
              .text()
              .trim();
          }
        }
      }

      return buildProduct({
        url,
        name: title,
        marketplace: 'EMANUELA_CAROUSO',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand: 'EMANUELA_CAROUSO',
        price,
        discountedPrice: null,
        images: this.extractImages(html),
        colors: extractColorsFromText(title),
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

  /** Ported from the Python's regex-extracted `"images": [...]` inline JSON blob. */
  private extractImages(html: string): ScrapedProductImage[] {
    const match = html.match(/"images":\s*\[.*?\]/s);
    if (!match) {
      return [];
    }

    let parsed: { images?: { full?: string }[] };
    try {
      parsed = JSON.parse(`{${match[0]}}`);
    } catch {
      return [];
    }

    const images: ScrapedProductImage[] = [];
    (parsed.images ?? []).forEach((img, idx) => {
      if (img.full) {
        images.push({
          url: img.full,
          name: '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }
}
