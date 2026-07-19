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
  extractColorsFromText,
  extractMaterialsFromText,
  extractPrice,
} from '../../utils/product-fields';

interface MeherKakaliaLink {
  category: string;
  link: string;
}

const BASE_URL = 'https://meherkakalia.com';

const CATEGORIES: { category: string; path: string }[] = [
  { category: 'SHOES', path: 'shoes-14' },
  { category: 'BAGS', path: 'bags-16' },
];

/**
 * Meher Kakalia scraper. Plain HTML site (no anti-bot noted in the source),
 * discovers products via category grid pages and parses detail pages for
 * name/price/description/breadcrumbs. Port of the Python `MeherKakaliaScraper`.
 */
export class MeherKakaliaScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'meher_kakalia',
      ScraperCategory.SHOPPING,
      {
        url: BASE_URL,
        metadata: {
          name: 'Meher Kakalia',
          description: 'Scrapes meherkakalia.com category and product pages',
          tags: ['meher_kakalia', 'shopping'],
        },
        collectionName: 'meher_kakalia',
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

  private async getLinks(): Promise<MeherKakaliaLink[]> {
    const links: MeherKakaliaLink[] = [];

    for (const category of CATEGORIES) {
      const url = `${BASE_URL}/${category.path}`;
      try {
        const html = await this.http.getText(url);
        this.stats.pagesFetched++;

        const $ = cheerio.load(html);
        $('div.item-product').each((_, el) => {
          const href = $(el).find('a').first().attr('href');
          if (href) {
            links.push({ category: category.category, link: href });
          }
        });
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to get links for ${category.category}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: MeherKakaliaLink,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(linkData.link);
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
      const contentWrapper = $('#content-wrapper');
      const name = contentWrapper.find('h1.namne_details').text().trim();
      const priceText = contentWrapper.find('div.current-price').text();
      const price = extractPrice(priceText);
      const description = contentWrapper.find('div.product-desc').text().trim();

      const breadcrumbItems = $('nav.breadcrumb-inner').find('a');
      const crumbTexts = breadcrumbItems
        .map((_, el) => $(el).text().trim())
        .get();
      const subCategory = crumbTexts[crumbTexts.length - 2] ?? null;
      const subSubCategory = crumbTexts[crumbTexts.length - 1] ?? null;

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'MEHER_KAKALIA',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand: 'MEHER_KAKALIA',
        price,
        discountedPrice: null,
        images: this.extractImages($),
        colors: extractColorsFromText(description),
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

  private extractImages($: cheerio.CheerioAPI): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    $('div.product-images')
      .find('img')
      .each((idx, el) => {
        const url = $(el).attr('data-image-large-src');
        if (url) {
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
}
