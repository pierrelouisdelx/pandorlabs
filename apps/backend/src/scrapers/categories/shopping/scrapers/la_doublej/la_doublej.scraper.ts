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

interface LaDoubleJLink {
  link: string;
  category: string;
  subcategory: string;
}

interface LaDoubleJCategory {
  main: string;
  category: string;
  subs: string[];
}

const CATEGORIES: LaDoubleJCategory[] = [
  { main: 'SHOES', category: 'accessories', subs: ['shoes'] },
  {
    main: 'CLOTHING',
    category: 'our-categories',
    subs: [
      'dresses',
      'shirts-and-tops',
      'shorts-and-pants',
      'denim',
      'skirts',
      'knitwear',
      'outerwear',
      'tshirts',
      'loungewear',
      'swimwear',
    ],
  },
  { main: 'BAGS', category: 'accessories', subs: ['bags-and-pochettes'] },
  {
    main: 'ACCESSORIES',
    category: 'accessories',
    subs: ['hair-accessories', 'scarves', 'small-accessories', 'hats', 'belts'],
  },
  {
    main: 'JEWELRY',
    category: 'jewelry',
    subs: [
      'earrings',
      'necklaces',
      'bracelets',
      'rings',
      'brooches-and-pins',
      'charms',
    ],
  },
];

/**
 * La DoubleJ scraper. Discovers products from paginated collection pages
 * (HTML → cheerio) and parses details from the embedded `Product` JSON-LD
 * block. Port of the Python `LaDoubleJScraper`.
 */
export class LaDoubleJScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'la_doublej',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.ladoublej.com/en',
        metadata: {
          name: 'La DoubleJ',
          description:
            'Scrapes La DoubleJ collection pages + JSON-LD product schema',
          tags: ['la_doublej', 'shopping'],
        },
        collectionName: 'la_doublej',
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

  private async getLinks(): Promise<LaDoubleJLink[]> {
    const links: LaDoubleJLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 0;
        while (true) {
          const url =
            `https://www.ladoublej.com/en/ready-to-wear/${category.category}/${sub}/` +
            `?page=${page}&format=page-element&direction=next&position=next&subview=false&loadall=false&subcategory=false`;

          let html: string;
          try {
            html = await this.http.getText(url);
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to fetch LaDoubleJ ${category.main}/${sub} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const $ = cheerio.load(html);
          const productLinks = $('a.js-producttile_name');
          if (productLinks.length === 0) {
            break;
          }

          productLinks.each((_, el) => {
            const href = $(el).attr('href');
            if (href && !seen.has(href)) {
              seen.add(href);
              links.push({
                link: href,
                category: category.main,
                subcategory: sub,
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
    linkData: LaDoubleJLink,
  ): Promise<ScrapedProduct | null> {
    const url = `https://www.ladoublej.com${linkData.link}`;
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
      let productData: Record<string, any> | null = null;
      let breadcrumbData: Record<string, any> | null = null;

      $('script[type="application/ld+json"]').each((_, el) => {
        let parsed: any;
        try {
          parsed = JSON.parse($(el).text());
        } catch {
          return;
        }
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item?.['@type'] === 'Product') {
            productData = item;
          } else if (item?.['@type'] === 'BreadcrumbList') {
            breadcrumbData = item;
          }
        }
      });

      if (!productData) {
        this.logger.warn(`No product schema found for ${url}`);
        return null;
      }

      const product: Record<string, any> = productData;

      let subSubCategory: string | null = null;
      if (
        breadcrumbData &&
        Array.isArray((breadcrumbData as Record<string, any>).itemListElement)
      ) {
        const items = (breadcrumbData as Record<string, any>).itemListElement;
        subSubCategory = items[items.length - 1]?.name ?? null;
      }

      return buildProduct({
        url,
        name: product.name,
        marketplace: 'LA_DOUBLEJ',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory,
        price: product.offers?.price,
        brand: product.brand?.name,
        description: product.description,
        images: this.extractImages(product),
        colors: this.extractColors(product.color),
        materials: extractMaterialsFromText(product.description),
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

  private extractImages(product: Record<string, any>): ScrapedProductImage[] {
    const images: string[] = Array.isArray(product.image)
      ? product.image
      : product.image
        ? [product.image]
        : [];

    return images.map((url, idx) => ({
      url,
      name: `Image ${idx + 1}`,
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(description: string | undefined): string[] {
    if (!description || !description.includes('Item Color:')) {
      return [];
    }
    const color = description.split('Item Color:')[1]?.split('\n')[0]?.trim();
    if (!color) {
      return [];
    }
    const token = formatEnum(color);
    return token ? [token] : [];
  }
}
