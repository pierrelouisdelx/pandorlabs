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
  formatEnum,
} from '../../utils/product-fields';

const SITE_URL = 'https://vibivenezia.it';
const CATALOG_URL = 'https://vibivenezia.it/en/catalog';
const GRID_URL = 'https://vibivenezia.it/en/catalog/grid';
const MAX_PAGES = 3;
const PAGE_SIZE = '18';
const CATEGORY_ID = '25';

const GET_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const POST_HEADERS = {
  Accept: '*/*',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'X-Requested-With': 'XMLHttpRequest',
  Origin: SITE_URL,
  Referer: CATALOG_URL,
};

/**
 * Vibi Venezia scraper. The source discovers product links via a CSRF-token
 * protected POST to a catalog grid endpoint, using a `requests.Session` that
 * carries cookies across the CSRF-fetch and the grid POSTs.
 *
 * This backend's `FashionHttp` only exposes GET, and (like the source's own
 * proxy rotation) hands out a *fresh* client per call — there is no cookie
 * jar shared across requests. We therefore fall back to the inherited
 * `createImpitClient()` (still no direct `impit` import) to issue the POST
 * requests directly, mirroring the source's flow as closely as this
 * infrastructure allows. Because cookies aren't persisted between the GET and
 * the POSTs, this will likely be rejected server-side — that's expected; the
 * run degrades gracefully via `fetchErrors`.
 */
export class VibiveneziaScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'vibivenezia',
      ScraperCategory.SHOPPING,
      {
        url: SITE_URL,
        metadata: {
          name: 'Vibi Venezia',
          description:
            'Scrapes Vibi Venezia catalog (CSRF-protected HTML POST)',
          tags: ['vibivenezia', 'shopping'],
        },
        collectionName: 'vibivenezia',
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

    for (const link of links) {
      const product = await this.fetchAndParse(link);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<string[]> {
    const links: string[] = [];
    const seen = new Set<string>();

    let csrfToken: string | null = null;
    try {
      const catalogHtml = await this.http.getText(CATALOG_URL, {
        headers: GET_HEADERS,
      });
      this.stats.pagesFetched++;

      const $catalog = cheerio.load(catalogHtml);
      csrfToken =
        $catalog('meta[name="csrf-token"]').attr('content') ??
        $catalog('input[name="_token"]').attr('value') ??
        null;
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Error fetching initial page: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return links;
    }

    let page = 1;
    let maxPage = MAX_PAGES;

    while (page <= maxPage) {
      const body = new URLSearchParams({
        page: String(page),
        perpage: PAGE_SIZE,
        category_id: CATEGORY_ID,
        price_range: '',
        top_products: '',
        size: '',
        model: '',
        color: '',
        tag: '',
        search: '',
        show_filters: '1',
      });

      let html: string;
      try {
        const headers: Record<string, string> = { ...POST_HEADERS };
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        html = await this.postForm(GRID_URL, body, headers);
        this.stats.pagesFetched++;
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Error getting links for page ${page}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        page++;
        continue;
      }

      const $ = cheerio.load(html);

      const pagination = $('ul.pagination');
      if (pagination.length) {
        const items = pagination.find('li');
        const secondToLast = items.eq(items.length - 2);
        const currentMaxPage = parseInt(secondToLast.text().trim() || '1', 10);
        if (!Number.isNaN(currentMaxPage) && currentMaxPage > maxPage) {
          maxPage = currentMaxPage;
        }
      }

      $('article').each((_, el) => {
        const href = $(el).find('a').first().attr('href');
        if (href && !seen.has(href)) {
          seen.add(href);
          links.push(href);
        }
      });

      page++;
    }

    return links;
  }

  /** POST a URL-encoded form body via a fresh Impit client (no `postText` on FashionHttp). */
  private async postForm(
    url: string,
    body: URLSearchParams,
    headers: Record<string, string>,
  ): Promise<string> {
    const client = this.createImpitClient();
    const response = await client.fetch(url, {
      method: 'POST',
      headers,
      body: body.toString(),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return await response.text();
  }

  private async fetchAndParse(link: string): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(link);
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const $ = cheerio.load(html);
      const article = $('article.article-product').first();
      if (!article.length) {
        this.logger.error(`Product article not found in the page ${link}`);
        return null;
      }

      const name = article.find('h1[itemprop="name"]').first().text().trim();
      const subCategory =
        article.find('h2.product-category').first().text().trim() || null;
      const description = article.find('p').first().text().trim() || null;

      let price: number | null = null;
      const priceEl = article
        .find('span.attribute-formattedDisplayFinalPrice')
        .first();
      if (priceEl.length) {
        const priceMatch = priceEl
          .text()
          .trim()
          .match(/€(\d+(?:\.\d{2})?)/);
        if (priceMatch) {
          price = Math.round(parseFloat(priceMatch[1]) * 100);
        }
      }

      return buildProduct({
        url: link,
        name,
        marketplace: 'VIBI_VENEZIA',
        category: 'SHOES',
        subCategory,
        description,
        brand: 'VIBIVENEZIA',
        price,
        discountedPrice: null,
        images: this.extractImages($, article),
        colors: this.extractColors(article),
        materials: extractMaterialsFromText(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(
    $: cheerio.CheerioAPI,
    article: cheerio.Cheerio<any>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const container = article.find('div.figure-container').first();
    if (!container.length) {
      return images;
    }

    container.find('img').each((idx, el) => {
      const src = $(el).attr('src');
      if (!src) {
        return;
      }
      images.push({
        url: `${SITE_URL}${src}`,
        name: $(el).attr('alt') ?? '',
        isMain: idx === 0,
        order: images.length,
      });
    });

    return images;
  }

  private extractColors(article: cheerio.Cheerio<any>): string[] {
    const raw = article
      .find('div.product-details')
      .first()
      .text()
      .replace('Color', '')
      .trim();

    if (!raw || !colorKeywords.includes(raw.toLowerCase())) {
      return [];
    }
    const token = formatEnum(raw);
    return token ? [token] : [];
  }
}
