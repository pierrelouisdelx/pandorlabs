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
import { formatEnum, materialKeywords } from '../../utils/product-fields';

interface FwrdCategory {
  url: string;
  name: string;
  subs: string[];
}

interface FwrdLink {
  link: string;
  category: string;
  subCategory: string | null;
}

const CATEGORIES: FwrdCategory[] = [
  {
    url: 'category-clothing/3699fc',
    name: 'CLOTHING',
    subs: [
      'category-dresses/a8e981',
      'category-tops/db773d',
      'category-tops-blouses/d01fe8',
      'category-jackets-coats-blazers/6e5426',
      'category-jackets-coats/e4012a',
      'category-jumpsuits-rompers/372e45',
      'category-sweaters-knits/a49835',
      'category-loungewear/97c04e',
      'category-denim/2664ce',
      'category-pants/44d522',
      'category-skirts/8b6a66',
      'category-shorts/9d2482',
      'category-intimates/dad0f5',
      'category-tops-bodysuits/68e631',
      'category-activewear/fcda16',
      'category-swimsuits-coverups/05adb8',
    ],
  },
  {
    url: 'category-shoes/3f40a9',
    name: 'SHOES',
    subs: [
      'category-shoes-heels/51fd9f',
      'category-shoes-flats/f39c40',
      'category-shoes-boots/59da4f',
      'category-shoes-flats-ballet/45baf7',
      'category-shoes-flats-loafers-oxfords/623542',
      'category-shoes-sandals/016eb5',
      'category-shoes-sneakers/2aec17',
      'category-shoes-wedges/1f0dec',
    ],
  },
  {
    url: 'category-bags/2df9df',
    name: 'BAGS',
    subs: [
      'category-bags-clutches/cc5b36',
      'category-bags-crossbody-bags/f8c179d',
      'category-bags-mini-bags/1eeb6d',
      'category-bags-shoulder-bags/276024',
      'category-bags-top-handle/221f06',
      'category-bags-totes/317dcf',
      'category-bags-travel-luggage/a3f9e7',
      'category-bags-wallets/c2506c',
    ],
  },
  {
    url: 'category-accessories/2fa629',
    name: 'ACCESSORIES',
    subs: [
      'category-accessories-belts/b828f2',
      'category-accessories-hats/f15b10',
      'category-accessories-hair-accessories/58ea3b',
      'category-accessories-gifts/e6dd21',
      'category-accessories-keychains-bag-charms/596389',
    ],
  },
  {
    url: 'category-jewelry/5d8a4a',
    name: 'JEWELRY',
    subs: [
      'category-jewelry-fine-jewelry/254f61',
      'category-jewelry-preowned/a121c0',
      'category-jewelry-earrings/dafe4a',
      'category-jewelry-necklaces/8f23b3',
      'category-jewelry-bracelets/ae67a8',
      'category-jewelry-rings/706e5f',
      'category-jewelry-watches/f2b58a',
      'category-jewelry-jewelry-watch-cases/a697eb',
    ],
  },
];

const MAX_LIST_PAGES = 3;

/**
 * FWRD (Forward) scraper. Uses the site's server-rendered `productsinc.jsp`
 * listing fragment + HTML product pages. Port of the Python `FwrdScraper`.
 */
export class FwrdScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'fwrd',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.fwrd.com',
        metadata: {
          name: 'FWRD',
          description: 'Scrapes FWRD via server-rendered listing fragments',
          tags: ['fwrd', 'shopping'],
        },
        collectionName: 'fwrd',
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

  private async getLinks(): Promise<FwrdLink[]> {
    const links: FwrdLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        let page = 1;
        let maxPage = MAX_LIST_PAGES;

        const subCategory = sub.includes(
          `category-${category.name.toLowerCase()}`,
        )
          ? sub
              .split(`category-${category.name.toLowerCase()}`)[1]
              ?.split('/')[0]
          : sub.split('category-')[1]?.split('/')[0];

        while (page <= maxPage) {
          const url =
            `https://www.fwrd.com/fw/productsinc.jsp?site=f&aliasURL=${sub}` +
            `&s=c&c=${category.name.charAt(0) + category.name.slice(1).toLowerCase()}` +
            `&navsrc=${category.name.toLowerCase()}&pageNum=${page}`;

          try {
            const html = await this.http.getText(url, {
              headers: {
                Accept: '*/*',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: `https://www.fwrd.com/${sub}/?navsrc=${category.name.toLowerCase()}&pageNum=${page}`,
                Origin: 'https://www.fwrd.com',
              },
            });
            this.stats.pagesFetched++;

            const $ = cheerio.load(html);
            const paginationItems = $('li.pagination__item');
            if (paginationItems.length > 0) {
              const lastPageAttr = paginationItems
                .last()
                .find('a')
                .attr('data-page-num');
              const lastPage = lastPageAttr ? parseInt(lastPageAttr, 10) : NaN;
              if (!Number.isNaN(lastPage)) {
                maxPage = lastPage;
              }
            }

            $('main div#plp-product-list ul li').each((_, el) => {
              const href = $(el).find('a').attr('href');
              if (href && href.startsWith('/product-')) {
                const link = href.split('?')[0];
                if (!seen.has(link)) {
                  seen.add(link);
                  links.push({
                    link,
                    category: category.name,
                    subCategory: subCategory ?? null,
                  });
                }
              }
            });
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub} page ${page}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }
          page++;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: FwrdLink,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct | null> {
    const url = `https://www.fwrd.com${linkData.link}`;
    let html: string;
    try {
      html = await this.http.getText(url, {
        headers: {
          Accept: '*/*',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
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
      const pdp = $('main div.pdp');
      if (pdp.length === 0) {
        this.logger.warn(`Product details not found in HTML for ${url}`);
        return null;
      }

      const brand =
        pdp.find('.pdp__brand-title').first().text().trim() || 'FWRD';
      const name =
        pdp.find('.pdp__brand-desc').first().text().trim() || 'No Name';
      const price = pdp.find('.price__retail').first().text().trim() || null;
      const description = pdp.find('.pdp-details ul').first().text().trim();

      return buildProduct({
        url,
        name,
        marketplace: 'FWRD',
        category: linkData.category,
        subCategory: linkData.subCategory,
        description,
        brand,
        price,
        discountedPrice: null,
        images: this.extractImages($, pdp, seenImages),
        colors: this.extractColors(pdp),
        materials: this.extractMaterials(description),
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

  private extractImages(
    $: cheerio.CheerioAPI,
    pdp: cheerio.Cheerio<any>,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    pdp.find('.js-pdp-image-zoom img.pdp__image').each((idx, el) => {
      let src = $(el).attr('src');
      if (src && src.startsWith('data:image')) {
        src = $(el).attr('data-lazy');
      }
      if (src && src.startsWith('https://') && !seenImages.has(src)) {
        seenImages.add(src);
        images.push({
          url: src,
          name: `image_${idx + 1}`,
          isMain: idx === 0,
          order: images.length,
        });
      }
    });
    return images;
  }

  private extractColors(pdp: cheerio.Cheerio<any>): string[] {
    const raw = pdp.find('span.pdp__color-option').first().text().trim();
    if (!raw) {
      return [];
    }
    const found = new Set<string>();
    for (const part of raw.split(/[,&]/)) {
      const trimmed = part.trim();
      if (trimmed) {
        const token = formatEnum(trimmed);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
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
