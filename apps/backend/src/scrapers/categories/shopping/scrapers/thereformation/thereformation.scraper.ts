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
  colorKeywords,
  materialKeywords,
  formatEnum,
} from '../../utils/product-fields';

interface ReformationSub {
  name: string;
  link: string;
}

interface ReformationCategory {
  main: ProductCategory;
  link: string;
  subs: ReformationSub[];
}

interface ReformationLink {
  link: string;
  category: ProductCategory;
  subcategory: string;
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  Referer: 'https://www.thereformation.com/shoes',
};

const PAGE_SIZE = 96;
const MAX_PAGES_PER_SUB = 20; // safety bound; the source loops until empty

/**
 * The Reformation scraper. Discovers sub-categories from each top-level
 * category page (HTML → cheerio), then paginates the SFCC
 * `Search-UpdateGrid` endpoint per sub-category, and parses product detail
 * pages via cheerio. Port of the Python `TheReformationScraper`.
 */
export class TheReformationScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'thereformation',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.thereformation.com',
        metadata: {
          name: 'Reformation',
          description:
            'Scrapes Reformation collections (HTML) + SFCC search grid',
          tags: ['thereformation', 'shopping'],
        },
        collectionName: 'thereformation',
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

  private async getLinks(): Promise<ReformationLink[]> {
    const categories: ReformationCategory[] = [
      {
        main: ProductCategory.SHOES,
        link: 'https://www.thereformation.com/shoes',
        subs: [],
      },
      {
        main: ProductCategory.CLOTHING,
        link: 'https://www.thereformation.com/clothing',
        subs: [],
      },
      {
        main: ProductCategory.BAGS,
        link: 'https://www.thereformation.com/bags',
        subs: [],
      },
      {
        main: ProductCategory.JEWELRY,
        link: 'https://www.thereformation.com/jewelry',
        subs: [],
      },
    ];

    const links: ReformationLink[] = [];
    const seen = new Set<string>();

    for (const category of categories) {
      try {
        const html = await this.http.getText(category.link, {
          headers: HEADERS,
        });
        this.stats.pagesFetched++;

        const $ = cheerio.load(html);
        const subcats = $('div.content-tile__categories');
        subcats.find('a.content-tile__cta').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) {
            return;
          }
          let sub = href.split('/').pop() ?? '';
          if (sub.includes('=')) {
            sub = sub.split('=')[1];
          }
          const name = formatEnum($(el).text().trim());
          if (sub && name) {
            category.subs.push({ name, link: sub });
          }
        });
      } catch (error) {
        this.stats.fetchErrors++;
        this.logger.error(
          `Failed to get subcategories for ${category.main}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      category.subs.push({
        name: category.main,
        link: category.main.toLowerCase(),
      });

      for (const sub of category.subs) {
        let start = 0;
        let hasNextPage = true;
        let pagesFetchedForSub = 0;

        while (hasNextPage && pagesFetchedForSub < MAX_PAGES_PER_SUB) {
          const url = `https://www.thereformation.com/on/demandware.store/Sites-reformation-us-Site/en_US/Search-UpdateGrid?cgid=${sub.link}&pmpt=qualifying&start=${start}&sz=${PAGE_SIZE}&pageTypeContext=Search-Show`;

          let html: string;
          try {
            html = await this.http.getText(url, { headers: HEADERS });
            this.stats.pagesFetched++;
            pagesFetchedForSub++;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Failed to get links for ${sub.link} in ${category.main}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }

          const $ = cheerio.load(html);
          const anchors = $('a.product-tile__anchor');
          if (anchors.length === 0) {
            hasNextPage = false;
            break;
          }

          anchors.each((_, el) => {
            const href = $(el).attr('href');
            if (!href) {
              return;
            }
            const link = `https://www.thereformation.com${href}`;
            if (!seen.has(link)) {
              seen.add(link);
              links.push({
                link,
                category: category.main,
                subcategory: sub.name,
              });
            }
          });

          start += PAGE_SIZE;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: ReformationLink,
  ): Promise<ScrapedProduct | null> {
    let html: string;
    try {
      html = await this.http.getText(linkData.link, { headers: HEADERS });
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

      const nameElement = $('h1[data-product-component="name"]').first();
      const name = (
        nameElement.length
          ? nameElement.text()
          : $('h1.pdp__name').first().text()
      ).trim();

      let price: string | null = null;
      const priceDiv = $('div.price__sales').first();
      if (priceDiv.length && priceDiv.find('span').length) {
        const span = priceDiv.find('span').first();
        price = span.attr('content') || span.text().trim();
      } else {
        this.logger.warn(`Price not found for ${linkData.link}`);
      }

      const descriptionParts: string[] = [];
      const fabricInfo = $('div[data-product-component="fabric-info"]').first();
      if (fabricInfo.length) {
        const fabricText = fabricInfo
          .find('span[data-product-component-content=""]')
          .first();
        if (fabricText.length) {
          descriptionParts.push(fabricText.text().trim());
        }
      }
      const fitDetails = $('div[data-product-component="fit-tip"]').first();
      if (fitDetails.length) {
        const fitText = fitDetails
          .find('span[data-product-component-content=""]')
          .first();
        if (fitText.length) {
          descriptionParts.push(fitText.text().trim());
        }
      }
      const shoeInfo = $('div[data-product-component="shoe-info"]').first();
      if (shoeInfo.length) {
        descriptionParts.push(shoeInfo.text().trim());
      }
      const bagInfo = $('div[data-product-component="bag-info"]').first();
      if (bagInfo.length) {
        descriptionParts.push(bagInfo.text().trim());
      }
      const description = descriptionParts.join(' ');

      let subSubCategory: string | null = null;
      const breadcrumbNav = $('nav[aria-label="breadcrumb"]').first().length
        ? $('nav[aria-label="breadcrumb"]').first()
        : $('ol.breadcrumb').first();
      if (breadcrumbNav.length) {
        const breadcrumbItems = breadcrumbNav.find('a');
        if (breadcrumbItems.length > 2) {
          const lastBreadcrumb = formatEnum(
            breadcrumbItems.last().text().trim(),
          );
          if (lastBreadcrumb !== linkData.subcategory) {
            subSubCategory = lastBreadcrumb;
          }
        }
      }

      return buildProduct({
        url: linkData.link,
        name,
        marketplace: 'REFORMATION',
        category: linkData.category,
        subCategory: linkData.subcategory,
        subSubCategory,
        description,
        brand: 'THE_REFORMATION',
        price,
        discountedPrice: null,
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

    const collect = (selector: string) => {
      $(selector).each((idx, el) => {
        const img = $(el).find('img').first();
        if (!img.length) {
          return;
        }
        let url: string | undefined;
        const srcset = img.attr('srcset') || img.attr('data-srcset');
        if (srcset && srcset.trim()) {
          url = srcset.split(' ')[0];
        }
        if (!url) {
          url = img.attr('src');
        }
        if (url && !url.includes('data:image/gif')) {
          images.push({
            url,
            name: img.attr('alt') ?? '',
            isMain: idx === 0,
            order: images.length,
          });
        }
      });
    };

    collect('button.product-gallery__button');
    if (images.length === 0) {
      collect('button.product-gallery__button--mobile');
    }

    return images;
  }

  private extractColors($: cheerio.CheerioAPI): string[] {
    const found = new Set<string>();

    $('button.product-attribute__swatch').each((_, el) => {
      let colorName = $(el).attr('title') || $(el).attr('aria-label') || '';
      if (!colorName) {
        const img = $(el).find('img').first();
        if (img.length) {
          colorName = img.attr('alt') ?? '';
        }
      }
      if (colorName.startsWith('Color:')) {
        colorName = colorName.replace('Color:', '').trim();
      }
      if (!colorName) {
        return;
      }

      let matched = false;
      for (const keyword of colorKeywords) {
        if (colorName.toLowerCase().includes(keyword.toLowerCase())) {
          const token = formatEnum(keyword);
          if (token) {
            found.add(token);
            matched = true;
          }
        }
      }
      if (!matched) {
        const token = formatEnum(colorName);
        if (token) {
          found.add(token);
        }
      }
    });

    return [...found];
  }

  private extractMaterials($: cheerio.CheerioAPI): string[] {
    const found = new Set<string>();

    const addMatchesFromText = (text: string) => {
      const lower = text.toLowerCase();
      for (const keyword of materialKeywords) {
        if (lower.includes(keyword.toLowerCase())) {
          const token = formatEnum(keyword);
          if (token) {
            found.add(token);
          }
        }
      }
    };

    const fabricInfo = $('div[data-product-component="fabric-info"]').first();
    if (fabricInfo.length) {
      addMatchesFromText(fabricInfo.text());
    }

    const materialPatterns = [
      /Upper:\s*(\d+%\s*\w+)/gi,
      /Lining:\s*(\d+%\s*\w+)/gi,
      /Sole:\s*([^.]+)/gi,
      /(\d+%\s*\w+)/gi,
    ];
    $('ul').each((_, ul) => {
      $(ul)
        .find('li')
        .each((_, li) => {
          const text = $(li).text();
          for (const pattern of materialPatterns) {
            const matches = [...text.matchAll(pattern)];
            for (const match of matches) {
              addMatchesFromText(match[1] ?? match[0]);
            }
          }
        });
    });

    const fabricModal = $(
      'div[data-product-component="fabric-detail-modal"]',
    ).first();
    if (fabricModal.length) {
      addMatchesFromText(fabricModal.text());
    }

    return [...found];
  }
}
