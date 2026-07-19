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
import {
  formatEnum,
  extractMaterialsFromText,
} from '../../utils/product-fields';

interface StefanelLink {
  link: string;
  category: ProductCategory;
  subcategory: string;
}

interface StefanelCategory {
  main: ProductCategory;
  subs: string[];
}

const CATEGORIES: StefanelCategory[] = [
  {
    main: ProductCategory.CLOTHING,
    subs: [
      'knitwear',
      'outerwear',
      'trousers',
      'shirts-blouses',
      't-shirts-tops',
      'jeans',
      'dresses',
      'skirts',
      'sweatshirts-hoodies',
    ],
  },
  { main: ProductCategory.SHOES, subs: ['shoes'] },
  { main: ProductCategory.BAGS, subs: ['handbags'] },
  { main: ProductCategory.ACCESSORIES, subs: ['accessories'] },
];

/**
 * Stefanel scraper. Discovers products from women's collection pages (HTML →
 * cheerio) and fetches details from the site's internal SFCC `ProductApi-Product`
 * JSON endpoint. Port of the Python `StefanelScraper`.
 */
export class StefanelScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'stefanel',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.stefanel.com/ie/women',
        metadata: {
          name: 'Stefanel',
          description:
            'Scrapes Stefanel women collections (HTML) + ProductApi JSON',
          tags: ['stefanel', 'shopping'],
        },
        collectionName: 'stefanel',
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

  private async getLinks(): Promise<StefanelLink[]> {
    const links: StefanelLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        const url = `https://www.stefanel.com/ie/women/collection/${sub}`;
        try {
          const html = await this.http.getText(url);
          this.stats.pagesFetched++;

          const $ = cheerio.load(html);
          $('a.product-tile__link').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) {
              return;
            }
            if (!seen.has(href)) {
              seen.add(href);
              links.push({
                link: href,
                category: category.main,
                subcategory: sub,
              });
            }
          });
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${sub} in ${category.main}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: StefanelLink,
  ): Promise<ScrapedProduct | null> {
    const productId =
      linkData.link.split('-').pop()?.replace('.html', '') ?? '';
    const apiUrl = `https://www.stefanel.com/on/demandware.store/Sites-stefanel-Site/en_IE/ProductApi-Product?pid=${productId}&cachekill=${encodeURIComponent(
      new Date().toISOString(),
    )}`;

    let json: Record<string, any>;
    try {
      json = await this.http.getJson<Record<string, any>>(apiUrl);
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
      const name: string = json.productName ?? '';
      const description: string = json.longDescription ?? '';
      const priceData = json.price ?? {};
      const salesPrice = priceData.sales ?? {};
      const priceValue = salesPrice.value;

      if (!priceValue) {
        this.logger.warn(`No price found for ${linkData.link}`);
        return null;
      }
      const price = `€${priceValue}`;

      let discountedPrice: string | null = null;
      const listPrice = priceData.list;
      if (listPrice) {
        const listValue = listPrice.value;
        if (listValue && listValue !== priceValue) {
          discountedPrice = `€${listValue}`;
        }
      }

      const productUrl = `https://www.stefanel.com${linkData.link}`;

      return buildProduct({
        url: productUrl,
        name,
        marketplace: 'STEFANEL',
        category: linkData.category,
        subCategory: linkData.subcategory,
        description,
        brand: 'STEFANEL',
        price,
        discountedPrice,
        currency: 'EUR',
        images: this.extractImages(json),
        colors: this.extractColors(json),
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

  private extractImages(json: Record<string, any>): ScrapedProductImage[] {
    const imgs = json.imgs ?? {};
    const urls: string[] = imgs.urls ?? [];
    const alt: string = imgs.alt ?? '';

    return urls.slice(0, MAX_PRODUCT_IMAGES).map((url, idx) => ({
      url,
      name: alt,
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(json: Record<string, any>): string[] {
    const found = new Set<string>();
    const variationAttrs: Record<string, any>[] =
      json.variationAttributes ?? [];
    for (const attr of variationAttrs) {
      if (attr.attributeId !== 'color') {
        continue;
      }
      for (const colorValue of attr.values ?? []) {
        if (!colorValue.selected) {
          continue;
        }
        const colorName: string = colorValue.displayValue ?? '';
        if (!colorName.trim()) {
          continue;
        }
        const token = formatEnum(colorName.trim());
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
