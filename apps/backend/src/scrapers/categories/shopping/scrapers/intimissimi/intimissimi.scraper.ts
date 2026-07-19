import * as cheerio from 'cheerio';
import { Connection } from 'mongoose';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
  MAX_PRODUCT_IMAGES,
} from '../../utils/product';
import {
  extractColorsFromText,
  extractMaterialsFromText,
  extractPrice,
} from '../../utils/product-fields';

interface IntimissimiCategory {
  main: string;
  path: string;
}

const CATEGORIES: IntimissimiCategory[] = [
  { main: 'CLOTHING', path: '/en-us/lingerie/' },
  { main: 'CLOTHING', path: '/en-us/nightwear/' },
  { main: 'CLOTHING', path: '/en-us/loungewear/' },
];

const MAX_PRODUCTS_PER_CATEGORY = 60;

/**
 * Intimissimi scraper.
 *
 * The Python `IntimissimiScraper` is a template stub — every `_get_*` method
 * is `pass`, so there is no scraping logic to port faithfully. This is a
 * minimal, best-effort implementation that follows the same shape as the
 * other HTML-based scrapers (category page → cheerio link discovery → HTML
 * product-page fetch/parse), using generic, defensively-guarded selectors
 * since no verified Intimissimi markup was available to port from. Expect
 * this to need real selector tuning; it is wired for correct compile/runtime
 * behavior (stats, dedupe, graceful failure) rather than guaranteed
 * extraction accuracy.
 */
export class IntimissimiScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'intimissimi',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.intimissimi.com/en-us/',
        metadata: {
          name: 'Intimissimi',
          description:
            'Best-effort scrape of Intimissimi category pages (no Python reference logic existed)',
          tags: ['intimissimi', 'shopping'],
        },
        collectionName: 'intimissimi',
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

    for (const linkData of links) {
      const product = await this.fetchAndParse(linkData, seenImages);
      if (product && !seenUrls.has(product.url)) {
        seenUrls.add(product.url);
        products.push(product);
        this.stats.itemsScraped++;
      }
    }

    return products;
  }

  private async getLinks(): Promise<{ link: string; category: string }[]> {
    const links: { link: string; category: string }[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      const url = `https://www.intimissimi.com${category.path}`;
      try {
        const html = await this.http.getText(url, {
          headers: {
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        this.stats.pagesFetched++;

        const $ = cheerio.load(html);
        $('a').each((_, el) => {
          if (links.length >= MAX_PRODUCTS_PER_CATEGORY) {
            return false;
          }
          const href = $(el).attr('href');
          if (!href || !/\/p\/|\/product\//.test(href)) {
            return undefined;
          }
          const absolute = href.startsWith('http')
            ? href
            : `https://www.intimissimi.com${href.startsWith('/') ? '' : '/'}${href}`;
          const clean = absolute.split('?')[0];
          if (!seen.has(clean)) {
            seen.add(clean);
            links.push({ link: clean, category: category.main });
          }
          return undefined;
        });
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to get links for ${category.path}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: { link: string; category: string },
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(linkData.link, {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const $ = cheerio.load(html);

      const name =
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content')?.trim() ||
        '';

      const priceText =
        $('[itemprop="price"]').first().attr('content') ||
        $('[itemprop="price"]').first().text().trim() ||
        $('.price, .product-price').first().text().trim() ||
        $('meta[property="product:price:amount"]').attr('content') ||
        '';
      const price = priceText ? extractPrice(priceText) : null;

      const description =
        $('meta[name="description"]').attr('content')?.trim() ||
        $('.product-description, .description').first().text().trim() ||
        '';

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'INTISSIMI',
        category: linkData.category,
        description,
        brand: 'INTIMISSIMI',
        price,
        discountedPrice: null,
        images: this.extractImages($, seenImages),
        colors: extractColorsFromText(name, { fallbackToRaw: false }),
        materials: extractMaterialsFromText(description),
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

  private extractImages(
    $: cheerio.CheerioAPI,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];

    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !seenImages.has(ogImage)) {
      seenImages.add(ogImage);
      images.push({ url: ogImage, name: '', isMain: true, order: 0 });
    }

    $('picture img, .product-images img, .pdp-image img').each((_, el) => {
      if (images.length >= MAX_PRODUCT_IMAGES) {
        return false;
      }
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !seenImages.has(src)) {
        seenImages.add(src);
        images.push({
          url: src,
          name: $(el).attr('alt') ?? '',
          isMain: images.length === 0,
          order: images.length,
        });
      }
      return undefined;
    });

    return images;
  }
}
