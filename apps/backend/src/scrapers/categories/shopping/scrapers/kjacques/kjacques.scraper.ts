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
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface KJacquesSub {
  name: string;
  slug: string;
}

interface KJacquesLink {
  link: string;
  category: string;
  subCategory: string;
}

const CATEGORIES: { main: string; subs: KJacquesSub[] }[] = [
  {
    main: 'SHOES',
    subs: [
      { name: 'sandals', slug: '6-flat-sandals' },
      { name: 'wedges', slug: '7-wedges-sandals' },
      { name: 'heels', slug: '8-stacked-heels-sandals' },
    ],
  },
];

const HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

/**
 * KJacques scraper. Discovers products from paginated collection pages
 * (HTML → cheerio) then fetches per-color variant data.
 * Port of the Python `KJacquesScraper`.
 *
 * Note: the source used a POST ajax endpoint (`action=refresh`) to fetch each
 * color variant's price/images. `this.http` only supports GET, so the ajax
 * call below is issued as GET with the same query params — the site may
 * reject this (405/empty body), in which case that color is skipped and
 * counted as a fetch error rather than aborting the whole product.
 */
export class KjacquesScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'kjacques',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.kjacques.fr/en',
        metadata: {
          name: 'K.Jacques',
          description: 'Scrapes K.Jacques collection pages + variant data',
          tags: ['kjacques', 'shopping'],
        },
        collectionName: 'kjacques',
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
      const items = await this.fetchAndParse(linkData);
      for (const product of items) {
        if (!seenUrls.has(product.url)) {
          seenUrls.add(product.url);
          products.push(product);
          this.stats.itemsScraped++;
        }
      }
    }

    return products;
  }

  private async getLinks(): Promise<KJacquesLink[]> {
    const links: KJacquesLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 1;
        while (true) {
          const url = `https://www.kjacques.fr/en/${sub.slug}?page=${page}`;
          let html: string;
          try {
            html = await this.http.getText(url, { headers: HEADERS });
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch KJacques ${sub.name} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const $ = cheerio.load(html);
          const products = $('div#js-product-list div.product');
          if (products.length === 0) {
            break;
          }

          products.each((_, el) => {
            const href = $(el).find('a').first().attr('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              links.push({
                link: href,
                category: category.main,
                subCategory: sub.name,
              });
            }
          });

          page++;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: KJacquesLink,
  ): Promise<ScrapedProduct[]> {
    let mainHtml: string;
    try {
      mainHtml = await this.http.getText(linkData.link, { headers: HEADERS });
      this.stats.pagesFetched++;
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.link}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }

    const $ = cheerio.load(mainHtml);
    const colorsLi = $('ul#group_432 li');
    if (colorsLi.length === 0) {
      return [];
    }

    const productId = linkData.link
      .replace(/\/$/, '')
      .split('/')
      .pop()!
      .split('-')[0];

    const products: ScrapedProduct[] = [];

    for (const el of colorsLi.toArray()) {
      const input = $(el).find('input').first();
      const inputValue = input.attr('value');
      const colorName = input.attr('title') ?? 'Unknown';
      if (!inputValue) {
        continue;
      }

      const ajaxUrl =
        `https://www.kjacques.fr/en/index.php?controller=product&token=0feaeba930814e10aa896baffe06e05e` +
        `&id_product=${productId}&id_customization=0&group%5B432%5D=${inputValue}&qty=1` +
        `&quickview=0&ajax=1&action=refresh&quantity_wanted=1`;

      let variantData: Record<string, any>;
      try {
        variantData = await this.http.getJson<Record<string, any>>(ajaxUrl, {
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            Origin: 'https://www.kjacques.fr',
            Referer: linkData.link,
          },
        });
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Variant fetch failed for ${linkData.link} (${colorName}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        continue;
      }

      try {
        const product = this.parseVariant(variantData, colorName, linkData);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        this.stats.itemsFailed++;
        this.logger.error(
          `Parsing failed for ${linkData.link} (${colorName}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return products;
  }

  private parseVariant(
    data: Record<string, any>,
    colorName: string,
    linkData: KJacquesLink,
  ): ScrapedProduct | null {
    const detailsHtml: string = data.product_details;
    if (!detailsHtml) {
      return null;
    }
    const $ = cheerio.load(detailsHtml);
    const detailsDiv = $('div#product-details');
    const rawProduct = detailsDiv.attr('data-product');
    if (!rawProduct) {
      return null;
    }
    const details = JSON.parse(rawProduct);
    const priceCents = Math.round(parseFloat(details.price_amount) * 100);

    return buildProduct({
      url: data.product_url,
      name: data.product_title,
      marketplace: 'KJACQUES',
      category: linkData.category,
      subCategory: linkData.subCategory,
      description: details.meta_description,
      brand: 'KJACQUES',
      price: priceCents,
      images: this.extractImages(data),
      colors: this.extractColors(colorName),
      materials: extractMaterialsFromText(colorName),
    });
  }

  private extractImages(data: Record<string, any>): ScrapedProductImage[] {
    const html: string = data.product_cover_thumbnails ?? '';
    if (!html) {
      return [];
    }
    const $ = cheerio.load(html);
    const images: ScrapedProductImage[] = [];
    $('img').each((idx, el) => {
      const url = $(el).attr('data-image-large-src');
      if (url) {
        images.push({
          url,
          name: $(el).attr('alt') ?? '',
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors(colorName: string): string[] {
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }
}
