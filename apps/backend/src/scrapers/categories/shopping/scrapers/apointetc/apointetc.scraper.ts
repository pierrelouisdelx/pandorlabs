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
  MAX_PRODUCT_IMAGES,
} from '../../utils/product';

interface ApointetcMedia {
  fullUrl: string;
  altText?: string;
}

interface ApointetcLink {
  link: string;
  name: string;
  images: ApointetcMedia[];
  price: number | string;
}

const CATEGORIES = ['all-products'];

/**
 * Apointetc scraper. Discovers products from a Wix "warmup data" JSON blob
 * embedded in the category page, then fetches the product page for a
 * description. Port of the Python `ApointetcScraper`.
 */
export class ApointetcScraper extends FashionScraper {
  private readonly seenImages = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'apointetc',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.apointetc.com',
        metadata: {
          name: 'Apointetc',
          description:
            'Scrapes Apointetc via the embedded Wix warmup-data JSON blob',
          tags: ['apointetc', 'shopping'],
        },
        collectionName: 'apointetc',
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

  private async getLinks(): Promise<ApointetcLink[]> {
    const links: ApointetcLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      const url = `https://www.apointetc.com/category/${category}`;
      try {
        const html = await this.http.getText(url);
        this.stats.pagesFetched++;

        const $ = cheerio.load(html);
        const raw = $('script[type="application/json"]#wix-warmup-data').html();
        if (!raw) {
          this.logger.warn(`No wix-warmup-data found for ${category}`);
          continue;
        }
        const wixData = JSON.parse(raw);
        const products =
          wixData?.appsWarmupData?.['1380b703-ce81-ff05-f115-39571d94dfcd']
            ?.products_default_TPAMultiSection_m6zdvaah_default?.list ?? [];

        for (const product of products) {
          const link: string = product.urlPart;
          if (link && !seen.has(link) && product.isInStock) {
            seen.add(link);
            links.push({
              link,
              name: product.name,
              images: product.media ?? [],
              price: product.price,
            });
          }
        }
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to get links for ${category}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: ApointetcLink,
  ): Promise<ScrapedProduct | null> {
    const url = `https://www.apointetc.com/product-page/${linkData.link}`;
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
      const article = $('article').first();
      if (article.length === 0) {
        this.logger.warn(`No product found for: ${url}`);
        return null;
      }

      // Note: the source Python indexes into a single `find()` result as if
      // it were a list of sections (`collapsible_sections[1]`), which reads
      // as a bug (BeautifulSoup `.find()` returns one Tag, indexing walks its
      // child nodes). We approximate the intent: take the second element
      // child of the collapsible list and read its first <p>.
      let description = '';
      const collapsible = article.find('ul[data-hook="collapse-info-section"]');
      const sections = collapsible.children();
      if (sections.length > 1) {
        const descriptionP = $(sections.get(1)).find('p').first();
        if (descriptionP.length > 0) {
          description = descriptionP.text().trim();
        }
      }

      return buildProduct({
        url,
        name: linkData.name,
        marketplace: 'APOINTETC',
        category: ProductCategory.BAGS,
        subCategory: null,
        description,
        brand: 'APOINTETC',
        price: linkData.price,
        discountedPrice: null,
        currency: 'USD',
        images: this.extractImages(linkData.images),
        colors: [],
        materials: [],
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

  private extractImages(images: ApointetcMedia[]): ScrapedProductImage[] {
    const result: ScrapedProductImage[] = [];
    images.forEach((img, idx) => {
      if (result.length >= MAX_PRODUCT_IMAGES) {
        return;
      }
      if (!img.fullUrl || this.seenImages.has(img.fullUrl)) {
        return;
      }
      this.seenImages.add(img.fullUrl);
      result.push({
        url: img.fullUrl,
        name: img.altText ?? '',
        isMain: idx === 0,
        order: result.length,
      });
    });
    return result;
  }
}
