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

interface MuunLink {
  link: string;
  category: string;
  subcategory: string;
}

const CATEGORY_SUBS = [
  'winter-bags-2025',
  'ss25',
  'leather-and-fabric-bags',
  'pouches',
  'home',
  'outlet',
];

const MATERIAL_LABELS = [
  'Base',
  'Handles',
  'Pouch',
  'Straps',
  'Material',
  'Fabric',
];

/**
 * Muun scraper. WooCommerce-based site — plain HTML for both listing and
 * product pages. Port of the Python `MuunScraper`.
 */
export class MuunScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'muun',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.muun-collection.com',
        metadata: {
          name: 'Muun',
          description: 'Scrapes Muun (WooCommerce) bag categories',
          tags: ['muun', 'shopping'],
        },
        collectionName: 'muun',
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

  private async getLinks(): Promise<MuunLink[]> {
    const links: MuunLink[] = [];
    const seen = new Set<string>();

    for (const sub of CATEGORY_SUBS) {
      const url = `https://www.muun-collection.com/categorie-produit/${sub}`;
      try {
        const html = await this.http.getText(url);
        this.stats.pagesFetched++;

        const $ = cheerio.load(html);
        $('ul.products')
          .find('a')
          .each((_, el) => {
            const href = $(el).attr('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              links.push({
                link: href,
                category: ProductCategory.BAGS,
                subcategory: sub,
              });
            }
          });
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to get links for ${sub}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: MuunLink,
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

      const nameElem = $('h1.product_title');
      if (nameElem.length === 0) {
        this.logger.warn(`No product name found for ${linkData.link}`);
        return null;
      }
      const name = nameElem.text().trim();

      const priceElem = $('span.woocommerce-Price-amount').first();
      if (priceElem.length === 0) {
        this.logger.warn(`No price found for ${linkData.link}`);
        return null;
      }
      const priceBdi = priceElem.find('bdi');
      if (priceBdi.length === 0) {
        this.logger.warn(`Could not parse price for ${linkData.link}`);
        return null;
      }
      const priceText = priceBdi.text().trim();
      const currencySymbol = priceBdi.find(
        'span.woocommerce-Price-currencySymbol',
      );
      let currency: string;
      let priceValue: string;
      if (currencySymbol.length > 0) {
        currency = currencySymbol.text().trim();
        priceValue = priceText.replace(currency, '').trim();
      } else {
        priceValue = priceText.replace('€', '').trim();
        currency = 'EUR';
      }
      const price = `€${priceValue}`;

      const descElem = $('div.woocommerce-product-details__short-description');
      const description = descElem.length > 0 ? descElem.text().trim() : '';

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'MUUN',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory: null,
        description,
        brand: 'MUUN',
        price,
        discountedPrice: null,
        currency,
        images: this.extractImages($),
        colors: this.extractColors($),
        materials: this.extractMaterials($),
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
    const seen = new Set<string>();
    $('div.woo-product-gallery-slider')
      .find('img')
      .each((idx, el) => {
        const node = $(el);
        const url =
          node.attr('data-large_image') ||
          node.attr('data-zoom_src') ||
          node.attr('src');
        if (!url || seen.has(url)) {
          return;
        }
        seen.add(url);
        const altText = node.attr('alt') ?? '';
        const classes = node.attr('class') ?? '';
        const isMain = idx === 0 || classes.includes('slick-current');
        images.push({ url, name: altText, isMain, order: images.length });
      });
    return images;
  }

  private extractColors($: cheerio.CheerioAPI): string[] {
    const found = new Set<string>();

    const colorSelect = $('select#pa_colors');
    if (colorSelect.length > 0) {
      colorSelect.find('option').each((_, el) => {
        const colorText = $(el).text().trim();
        if (!colorText || colorText === 'Choose an option') {
          return;
        }
        const colorName = colorText.split(/\s+/)[0];
        if (!colorName) {
          return;
        }
        const token = formatEnum(colorName);
        if (token) {
          found.add(token);
        }
      });
    }

    if (found.size === 0) {
      $('li.variable-item').each((_, el) => {
        const colorText = $(el).attr('data-title');
        if (!colorText) {
          return;
        }
        const colorName = colorText.split(/\s+/)[0];
        if (!colorName) {
          return;
        }
        const token = formatEnum(colorName);
        if (token) {
          found.add(token);
        }
      });
    }

    return [...found];
  }

  private extractMaterials($: cheerio.CheerioAPI): string[] {
    const attributesTable = $('table.woocommerce-product-attributes');
    if (attributesTable.length === 0) {
      return [];
    }

    let materialText = '';
    attributesTable.find('tr').each((_, row) => {
      const label = $(row).find('th');
      const value = $(row).find('td');
      if (label.length === 0 || value.length === 0) {
        return;
      }
      const labelText = label.text().trim();
      if (MATERIAL_LABELS.some((ml) => labelText.includes(ml))) {
        materialText += ' ' + value.text().trim();
      }
    });

    const found = new Set<string>();
    const lower = materialText.toLowerCase();
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
