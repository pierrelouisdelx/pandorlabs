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
  extractMaterialsFromText,
  formatEnum,
} from '../../utils/product-fields';

interface StandStudioLink {
  link: string;
  category: string;
  sub: string;
}

const CATEGORIES: { main: string; subs: string[] }[] = [
  { main: 'SHOES', subs: ['shoes'] },
  {
    main: 'CLOTHING',
    subs: [
      'outerwear',
      'tops',
      'skirts',
      'trousers',
      'dresses',
      'jersey',
      'ready-to-wear',
    ],
  },
  { main: 'BAGS', subs: ['bags'] },
];

/** Matches the raw (backslash-escaped, embedded-in-JSON) product hrefs the source scraped via regex. */
const PRODUCT_HREF_PATTERN = /(\/product\/[^"]*)\\/g;

/**
 * Stand Studio scraper. Link discovery is a raw regex scan over category-page
 * HTML (matching an escaped Next.js data payload, not a DOM selector) and
 * detail parsing pulls the embedded JSON-LD `<script id="json-ld-product">`.
 * Port of the Python `StandStudioScraper`.
 *
 * Note: the image and color selectors target Tailwind/build-generated class
 * names (`w-full h-full vt-zoom cursor-pointer`, `fffdbeeec ...`) copied
 * verbatim from the source — these are unstable, likely already stale, and
 * the most probable point of breakage if the site's build has changed.
 */
export class StandStudioScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'standstudio',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.standstudio.com/eu',
        metadata: {
          name: 'Stand Studio',
          description:
            'Scrapes Stand Studio category pages (regex link scan) + JSON-LD product detail',
          tags: ['standstudio', 'shopping'],
        },
        collectionName: 'standstudio',
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

  private async getLinks(): Promise<StandStudioLink[]> {
    const links: StandStudioLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 0;

        while (true) {
          const url = `https://www.standstudio.com/eu/category/${sub}?page=${page}`;
          let html: string;
          try {
            html = await this.http.getText(url);
            this.stats.pagesFetched++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const matches = [...html.matchAll(PRODUCT_HREF_PATTERN)].map(
            (m) => m[1],
          );
          const uniqueHrefs = [...new Set(matches)].sort();

          for (const href of uniqueHrefs) {
            if (!seen.has(href)) {
              seen.add(href);
              links.push({
                link: `https://www.standstudio.com/eu${href}`,
                category: category.main,
                sub,
              });
            }
          }

          page++;

          if (uniqueHrefs.length === 0) {
            break;
          }
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: StandStudioLink,
  ): Promise<ScrapedProduct | null> {
    const link = linkData.link;
    let html: string;
    try {
      html = await this.http.getText(link, { headers: { Referer: link } });
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${link}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }

    try {
      const $ = cheerio.load(html);
      const jsonSchema = $('script#json-ld-product');
      if (jsonSchema.length === 0) {
        this.logger.error(`No JSON LD found for ${link}`);
        return null;
      }

      const productData = JSON.parse(jsonSchema.text());

      const rawName: string = productData.name ?? '';
      const name = rawName.includes('|')
        ? rawName.split('|')[1].trim()
        : rawName.trim();
      const price = (productData.hasVariant?.[0]?.offers?.price ?? 0) * 100;
      const description: string = productData.description ?? '';

      const colorElem = $(
        'p.fffdbeeec.fffdbeeec-desktop.font-light.font-title',
      ).first();
      const color =
        colorElem.length > 0
          ? colorElem.find('span').first().text().trim()
          : null;

      return buildProduct({
        url: link,
        name,
        marketplace: 'STAND_STUDIO',
        category: linkData.category,
        subCategory: linkData.sub,
        description,
        brand: 'STAND_STUDIO',
        price,
        discountedPrice: null,
        images: this.extractImages($),
        colors: color ? this.extractColors(color) : [],
        materials: extractMaterialsFromText(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${link}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private extractImages($: cheerio.CheerioAPI): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    $('img.w-full.h-full.vt-zoom.cursor-pointer').each((idx, el) => {
      let url = $(el).attr('src') ?? '';
      if (url.startsWith('/_next/image?url=')) {
        url = decodeURIComponent(url.replace('/_next/image?url=', ''));
      }
      if (!url) {
        return;
      }
      images.push({
        url,
        name: $(el).attr('alt') ?? '',
        isMain: idx === 0,
        order: images.length,
      });
    });
    return images;
  }

  private extractColors(colorName: string): string[] {
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }
}
