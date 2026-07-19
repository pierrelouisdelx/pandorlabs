import * as cheerio from 'cheerio';
import { Connection } from 'mongoose';
import { ProductCategory } from '@pandorlabs/types';
import { ScraperCategory } from '@scrapers/enums';
import { ProxyService } from '@scrapers/services/proxy.service';
import { FashionScraper } from '../../base/fashion-scraper.abstract';
import {
  buildProduct,
  ScrapedProduct,
  ScrapedProductImage,
} from '../../utils/product';
import { formatEnum, materialKeywords } from '../../utils/product-fields';

interface ItalistCategory {
  main: ProductCategory;
  id: number;
}

interface ItalistLink {
  link: string;
  category: ProductCategory;
}

const CATEGORIES: ItalistCategory[] = [
  { main: ProductCategory.CLOTHING, id: 2 },
  { main: ProductCategory.SHOES, id: 108 },
  { main: ProductCategory.BAGS, id: 76 },
  { main: ProductCategory.ACCESSORIES, id: 82 },
  { main: ProductCategory.JEWELRY, id: 69 },
];

const STEP = 60;
const BASE_URL = 'https://www.italist.com/us';

const HEADERS = {
  Accept: 'application/json, text/plain, */*',
};

/**
 * Italist scraper. Uses the site's `search_products` JSON API for listing and
 * HTML product pages for detail. Port of the Python `ItalistScraper`.
 *
 * The source required real-browser cookies (`requires_cookies = True`) to
 * keep the listing API returning results; those are dropped here per the
 * porting guide, so listing pages will likely come back empty/blocked.
 */
export class ItalistScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'italist',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.italist.com/us',
        metadata: {
          name: 'Italist',
          description:
            'Scrapes Italist via the search_products API + HTML product pages',
          tags: ['italist', 'shopping', 'luxury'],
        },
        collectionName: 'italist',
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

  private async getLinks(): Promise<ItalistLink[]> {
    const links: ItalistLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let skip = 0;

      while (true) {
        const url = `https://www.italist.com/api/search_products/women?skip=${skip}&categories[]=${category.id}&langIsoCode2=en`;

        let data: { products?: { url: string }[] };
        try {
          data = await this.http.getJson<{ products?: { url: string }[] }>(
            url,
            {
              headers: {
                ...HEADERS,
                Referer: `https://www.italist.com/us/women/clothing/${category.id}/`,
              },
            },
          );
          this.stats.pagesFetched++;
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Error fetching data for ${url}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }

        if (!data.products || data.products.length === 0) {
          this.logger.log(
            `No products found for category ${category.main}, change the cookies`,
          );
          break;
        }

        for (const product of data.products) {
          const productUrl = `${BASE_URL}${product.url}`;
          if (!seen.has(productUrl)) {
            seen.add(productUrl);
            links.push({ link: productUrl, category: category.main });
          }
        }

        skip += STEP;
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: ItalistLink,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(linkData.link, {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          Referer: 'https://www.italist.com/us/women/clothing/2/',
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
      const breadcrumbs = $('a.breadcrumbs-link');
      const subSubCategory =
        breadcrumbs.length >= 2
          ? $(breadcrumbs.get(breadcrumbs.length - 2))
              .text()
              .trim()
          : null;
      const subCategory =
        breadcrumbs.length >= 3
          ? $(breadcrumbs.get(breadcrumbs.length - 3))
              .text()
              .trim()
          : null;

      const brand = $('h2.brand').first().text().trim();
      const name = $('h1.model').first().text().trim();

      const discountedPriceElem = $('span.sales-price').first();
      const discountedPrice = discountedPriceElem.length
        ? parseInt(discountedPriceElem.text().replace(/\D/g, ''), 10) * 100
        : null;

      const priceElem = $('span.old-price').first();
      let price: number | null;
      if (priceElem.length) {
        price = parseInt(priceElem.text().replace(/\D/g, ''), 10) * 100;
      } else {
        const priceText = $('span.price').first().text().trim();
        price = priceText
          ? parseInt(priceText.replace(/\D/g, ''), 10) * 100
          : null;
      }

      const description = $('div.accordion-content').first().text().trim();

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'ITALIST',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand,
        price,
        discountedPrice,
        images: this.extractImages($, seenImages),
        colors: this.extractColors(name),
        materials: this.extractMaterials(description),
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
    $('div.carousel div.carousel-item').each((idx, el) => {
      const imgs = $(el).find('img');
      if (imgs.length === 0) {
        return;
      }
      const img = imgs.last();
      const src = img.attr('src');
      if (src && !seenImages.has(src)) {
        seenImages.add(src);
        images.push({
          url: src,
          name: img.attr('alt') ?? '',
          isMain: idx === 1,
          order: idx,
        });
      }
    });
    return images;
  }

  private extractColors(name: string): string[] {
    const token = formatEnum(name);
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
