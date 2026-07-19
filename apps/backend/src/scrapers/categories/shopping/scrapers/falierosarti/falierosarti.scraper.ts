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
import {
  formatEnum,
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface FalieroSartiCategory {
  main: ProductCategory;
  slug: string;
}

interface FalieroSartiLink {
  link: string;
  category: FalieroSartiCategory;
}

const CATEGORIES: FalieroSartiCategory[] = [
  { main: ProductCategory.CLOTHING, slug: 'women-s-clothing' },
  { main: ProductCategory.ACCESSORIES, slug: 'scarves' },
];

/**
 * Faliero Sarti scraper. Discovers products from paginated Magento category
 * pages (HTML → cheerio) and parses product detail pages.
 * Port of the Python `FalieroSartiScraper`.
 */
export class FalieroSartiScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'falierosarti',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.falierosarti.com/en/',
        metadata: {
          name: 'Faliero Sarti',
          description: 'Scrapes Faliero Sarti category pages (HTML)',
          tags: ['falierosarti', 'shopping'],
        },
        collectionName: 'falierosarti',
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

  private async getLinks(): Promise<FalieroSartiLink[]> {
    const links: FalieroSartiLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let productsAvailable = true;

      while (productsAvailable) {
        const url = `https://www.falierosarti.com/en/${category.slug}?p=${page}`;
        try {
          const html = await this.http.getText(url);
          this.stats.pagesFetched++;

          const $ = cheerio.load(html);
          const products = $('ol.products.list.items.product-items');
          if (products.length === 0) {
            productsAvailable = false;
            break;
          }

          const foundLinks = products.find(
            'a.product.photo.product-item-photo',
          );
          foundLinks.each((_, el) => {
            const href = $(el).attr('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              links.push({ link: href, category });
            }
          });

          productsAvailable = foundLinks.length > 0;
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to fetch Faliero Sarti ${category.slug} page ${page}: ${
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
    linkData: FalieroSartiLink,
  ): Promise<ScrapedProduct | null> {
    const url = linkData.link;
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
      const pageTitleDiv = $('div.page-title-wrapper').first();
      if (pageTitleDiv.length === 0) {
        return null;
      }

      const nameTag = pageTitleDiv.find('h1.page-title').first();
      const name = nameTag.length > 0 ? nameTag.text().trim() : 'Unknown';

      const priceBox = $('span.price').first();
      const priceText = priceBox.length > 0 ? priceBox.text().trim() : '0';

      let description = '';
      const descriptionDiv = $('div.product.attribute.description').first();
      if (descriptionDiv.length > 0) {
        const valueDiv = descriptionDiv.find('div.value').first();
        if (valueDiv.length > 0) {
          description = valueDiv.text().trim();
        }
      }

      let detailsText = '';
      $('div.am-custom-tab').each((_, tab) => {
        $(tab)
          .find('p')
          .each((__, p) => {
            detailsText += $(p).text().trim() + ' ';
          });
      });

      const subCategory = linkData.category.slug;

      return buildProduct({
        url,
        name,
        marketplace: 'FALIEROSARTI',
        category: linkData.category.main,
        subCategory: formatEnum(subCategory),
        subSubCategory: null,
        description,
        brand: 'FALIEROSARTI',
        price: priceText,
        discountedPrice: null,
        currency: 'USD',
        images: this.extractImages($),
        colors: [],
        materials: extractMaterialsFromText(`${description} ${detailsText}`),
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

  private extractImages($: cheerio.CheerioAPI): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const mainSwiper = $('div.product-main').first();
    if (mainSwiper.length === 0) {
      return images;
    }

    const slides = mainSwiper.find(
      '.swiper-slide:not(.swiper-slide-duplicate) img',
    );
    const seenUrls = new Set<string>();

    slides.each((idx, img) => {
      const url = $(img).attr('src');
      if (!url || seenUrls.has(url)) {
        return;
      }
      seenUrls.add(url);
      images.push({
        url,
        name: $(img).attr('alt') ?? 'Product Image',
        isMain: idx === 0,
        order: images.length,
      });
    });

    return images;
  }
}
