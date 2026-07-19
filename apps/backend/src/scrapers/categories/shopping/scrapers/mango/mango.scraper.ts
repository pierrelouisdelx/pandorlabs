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

interface MangoLink {
  link: string; // productId
  category: string;
}

interface MangoCategory {
  main: string;
  subs: string[];
}

const CATEGORIES: MangoCategory[] = [
  { main: 'SHOES', subs: ['accesorios_she.zapatos_she'] },
  { main: 'BAGS', subs: ['accesorios_she.bolsos_she'] },
  { main: 'JEWELRY', subs: ['accesorios_she.bisuteria_she'] },
  {
    main: 'ACCESSORIES',
    subs: [
      'accesorios_she.cinturones_she',
      'accesorios_she.marroquineria_she',
      'accesorios_she.bufandasypanuelos_she',
      'accesorios_she.gorrosyguantes_she',
      'accesorios_she.gafas_she',
    ],
  },
  {
    main: 'CLOTHING',
    subs: [
      'prendas_she.abrigos_she',
      'prendas_she.vestidos_she',
      'prendas_she.cardigans_she',
      'prendas_she.chaquetas_she',
      'prendas_she.pantalones_she',
      'prendas_she.vaqueros_she',
      'prendas_she.blazers_she',
      'prendas_she.gabardinas_she',
      'prendas_she.camisas_she',
      'prendas_she.faldas_she',
      'prendas_she.tops_she',
      'prendas_she.camisetas_she',
      'prendas_she.prendaspiel_she',
      'prendas_she.chalecos_she',
      'prendas_she.pijamas_she',
      'prendas_she.bano_she',
    ],
  },
];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * Mango scraper. Product listing comes from the `ws-product-lists` catalog
 * endpoint; product detail is assembled from THREE separate endpoints
 * (details, prices, description/tags) that must be combined, one product
 * per color variant. Port of the Python `MangoScraper`.
 */
export class MangoScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'mango',
      ScraperCategory.SHOPPING,
      {
        url: 'https://shop.mango.com/us',
        metadata: {
          name: 'Mango',
          description:
            'Scrapes Mango women via catalog + product/price/tags endpoints',
          tags: ['mango', 'shopping'],
        },
        collectionName: 'mango',
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
      const parsed = await this.fetchAndParse(linkData, seenImages);
      for (const product of parsed) {
        if (!seenUrls.has(product.url)) {
          seenUrls.add(product.url);
          products.push(product);
          this.stats.itemsScraped++;
        }
      }
    }

    return products;
  }

  private async getLinks(): Promise<MangoLink[]> {
    const links: MangoLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      for (const sub of category.subs) {
        try {
          const data = await this.http.getJson<{
            groups?: { items?: { productId: string }[] }[];
          }>(
            `https://shop.mango.com/ws-product-lists/v1/channels/shop/countries/us/linkIdOrCatalogId/${sub}/catalog?language=en`,
            { headers: HEADERS },
          );
          this.stats.pagesFetched++;

          const items = data.groups?.[0]?.items ?? [];
          for (const item of items) {
            if (!seen.has(item.productId)) {
              seen.add(item.productId);
              links.push({ link: item.productId, category: category.main });
            }
          }
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
    linkData: MangoLink,
    seenImages: Set<string>,
  ): Promise<ScrapedProduct[]> {
    const productId = linkData.link;
    let productDetails: Record<string, any>;
    let priceData: Record<string, any>;
    let descriptionData: Record<string, any>;

    try {
      productDetails = await this.http.getJson<Record<string, any>>(
        `https://online-orchestrator.mango.com/v4/products?channelId=shop&countryIso=US&languageIso=en&productId=${productId}`,
        { headers: HEADERS },
      );
      priceData = await this.http.getJson<Record<string, any>>(
        `https://online-orchestrator.mango.com/v3/prices/products?channelId=shop&countryIso=US&productId=${productId}`,
        { headers: HEADERS },
      );
      descriptionData = await this.http.getJson<Record<string, any>>(
        `https://online-orchestrator.mango.com/v2/products/tags?channelId=shop&countryIso=US&languageIso=en&productId=${productId}`,
        { headers: HEADERS },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }

    const results: ScrapedProduct[] = [];

    try {
      const link = 'https://shop.mango.com' + (productDetails.url ?? '');
      const name: string = productDetails.nameEn ?? '';
      const subcategory: string = productDetails.families?.[0]?.labelEn ?? '';
      const colors: Record<string, any>[] = productDetails.colors ?? [];

      for (const color of colors) {
        try {
          const colorId = color.id;
          const variantLink = `${link}?c=${colorId}`;
          const colorName: string = color.label ?? '';

          if (!priceData || Object.keys(priceData).length === 0) {
            this.logger.warn(`No price data for ${link}`);
            continue;
          }
          const priceKey = Object.keys(priceData)[0];
          const priceValue = priceData[priceKey]?.price;

          let descText = '';
          let materialsText = '';
          const descColors = descriptionData?.colors;
          if (descColors && Object.keys(descColors).length > 0) {
            const matched =
              descColors[String(colorId)] ??
              descColors[Object.keys(descColors)[0]];
            if (matched) {
              descText = (matched.description?.bullets ?? []).join(', ');
              materialsText = (matched.compositions ?? []).join(', ');
            }
          }

          const looks = color.looks ?? {};
          let images: Record<string, any> = {};
          const lookKeys = Object.keys(looks);
          if (lookKeys.length > 0) {
            images = looks[lookKeys[0]]?.images ?? {};
          }

          const product = buildProduct({
            url: variantLink,
            name,
            marketplace: 'MANGO',
            category: linkData.category,
            subCategory: subcategory,
            subSubCategory: null,
            description: descText,
            brand: 'MANGO',
            price: priceValue ?? null,
            discountedPrice: null,
            images: this.extractImages(images, name, seenImages),
            colors: this.extractColors(colorName),
            materials: this.extractMaterials(materialsText),
          });
          results.push(product);
        } catch (error) {
          this.stats.itemsFailed++;
          this.logger.error(
            `Parsing failed for variant of ${productId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return results;
  }

  private extractImages(
    images: Record<string, any>,
    name: string,
    seenImages: Set<string>,
  ): ScrapedProductImage[] {
    const result: ScrapedProductImage[] = [];
    const keys = Object.keys(images);
    keys.forEach((key, idx) => {
      const url = 'https://shop.mango.com' + images[key].img;
      const alt: string = images[key].alt ?? name;
      if (!seenImages.has(url)) {
        seenImages.add(url);
        result.push({
          url,
          name: alt,
          isMain: idx === 0,
          order: result.length,
        });
      }
    });
    return result;
  }

  private extractColors(colorName: string): string[] {
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }

  private extractMaterials(materials: string): string[] {
    const found = new Set<string>();
    const lower = materials.toLowerCase();
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
