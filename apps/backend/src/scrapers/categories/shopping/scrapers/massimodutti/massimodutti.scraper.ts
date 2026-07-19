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
  colorKeywords,
  formatEnum,
  materialKeywords,
} from '../../utils/product-fields';
import { MASSIMO_DUTTI_CATEGORIES } from './massimodutti.categories';

interface MassimoDuttiLink {
  category: string;
  subCategory: string;
  productId: string;
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * Massimo Dutti scraper. Cookie/MITM-gated in the source (Inditex APIs behind
 * anti-bot). We drop the stale cookies and the source's MITM proxy — the base
 * client's own proxy rotation is used instead — so this will likely 403 at
 * runtime, but it must still compile and degrade gracefully.
 * Port of the Python `MassimoDuttiScraper`.
 */
export class MassimoDuttiScraper extends FashionScraper {
  private readonly productLinks = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'massimodutti',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.massimodutti.com/us/',
        metadata: {
          name: 'Massimo Dutti',
          description:
            'Scrapes Massimo Dutti via internal Inditex catalog JSON endpoints',
          tags: ['massimodutti', 'shopping'],
        },
        collectionName: 'massimodutti',
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

  private async getLinks(): Promise<MassimoDuttiLink[]> {
    const links: MassimoDuttiLink[] = [];
    const seen = new Set<string>();

    for (const category of MASSIMO_DUTTI_CATEGORIES) {
      for (const sub of category.subs) {
        try {
          const data = await this.http.getJson<{ productIds?: string[] }>(
            `https://www.massimodutti.com/itxrest/3/catalog/store/34009527/30359506/category/${sub.link}/product?languageId=-1&appId=1&showProducts=true`,
            { headers: HEADERS },
          );
          this.stats.pagesFetched++;

          for (const productId of data.productIds ?? []) {
            if (!seen.has(productId)) {
              seen.add(productId);
              links.push({
                category: category.main,
                subCategory: sub.name,
                productId,
              });
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category.main} - ${sub.name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: MassimoDuttiLink,
  ): Promise<ScrapedProduct | null> {
    let json: { products?: Record<string, any>[] };
    try {
      json = await this.http.getJson<{ products?: Record<string, any>[] }>(
        `https://www.massimodutti.com/itxrest/3/catalog/store/34009451/30359524/productsArray?languageId=-2&appId=1&productIds=${linkData.productId}`,
        { headers: HEADERS },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      if (!json.products || json.products.length === 0) {
        this.logger.warn(
          `No products found in response for ${linkData.productId}`,
        );
        return null;
      }
      const data = json.products[0];

      const name: string = data.name ?? data.nameEn ?? '';
      let productUrl: string = data.productUrl ?? '';
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = `https://www.massimodutti.com/us/${productUrl}`;
      }

      if (this.productLinks.has(productUrl)) {
        return null;
      }
      this.productLinks.add(productUrl);

      const subfamilyName: string = data.subFamilyName ?? '';

      let price: number | null = null;
      let discountedPrice: number | null = null;

      const bundleProducts: Record<string, any>[] =
        data.bundleProductSummaries ?? [];
      if (bundleProducts.length > 0) {
        const detail = bundleProducts[0].detail ?? {};
        const colors: Record<string, any>[] = detail.colors ?? [];
        if (colors.length > 0 && colors[0].sizes?.length > 0) {
          const firstSize = colors[0].sizes[0];
          const priceStr = firstSize.price;
          const oldPriceStr = firstSize.oldPrice;
          if (priceStr) {
            price = Number(priceStr);
          }
          if (oldPriceStr) {
            discountedPrice = price;
            price = Number(oldPriceStr);
          }
        }
      }

      const descriptionParts: string[] = [];
      const attributes: Record<string, any>[] = [...(data.attributes ?? [])];
      if (bundleProducts.length > 0) {
        attributes.push(...(bundleProducts[0].attributes ?? []));
      }
      for (const attr of attributes) {
        if (attr.type === 'DESCRIPTION' && attr.value) {
          descriptionParts.push(attr.value);
        }
      }
      const description = descriptionParts.join('. ');

      return buildProduct({
        url: productUrl,
        name,
        marketplace: 'MASSIMO_DUTTI',
        category: linkData.category,
        subCategory: linkData.subCategory,
        subSubCategory: subfamilyName,
        description,
        brand: 'MASSIMO_DUTTI',
        price,
        discountedPrice,
        images: this.extractImages(data),
        colors: this.extractColors(data),
        materials: this.extractMaterials(data),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.productId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(data: Record<string, any>): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];
    const bundleProducts: Record<string, any>[] =
      data.bundleProductSummaries ?? [];
    if (bundleProducts.length === 0) {
      return images;
    }
    const detail = bundleProducts[0].detail ?? {};
    const xmediaList: Record<string, any>[] = detail.xmedia ?? [];

    for (const xmedia of xmediaList) {
      const xmediaItems: Record<string, any>[] = xmedia.xmediaItems ?? [];
      for (const item of xmediaItems) {
        const medias: Record<string, any>[] = item.medias ?? [];
        medias.forEach((media, idx) => {
          const extraInfo = media.extraInfo ?? {};
          if (!extraInfo.deliveryUrl) {
            return;
          }
          let url: string = extraInfo.url ?? '';
          if (url) {
            url = url.replace(':width:', '2048');
            if (!url.startsWith('http')) {
              url = 'https://static.massimodutti.net/' + url;
            }
          } else {
            url = extraInfo.deliveryUrl ?? '';
          }
          const originalName: string = extraInfo.originalName ?? '';
          if (!url) {
            return;
          }
          images.push({
            url,
            name: originalName,
            isMain: idx === 0,
            order: images.length,
          });
        });
      }
    }

    return images;
  }

  private extractColors(data: Record<string, any>): string[] {
    const found = new Set<string>();
    const bundleColors: Record<string, any>[] = [...(data.bundleColors ?? [])];
    const bundleProducts: Record<string, any>[] =
      data.bundleProductSummaries ?? [];
    if (bundleProducts.length > 0) {
      const detail = bundleProducts[0].detail ?? {};
      bundleColors.push(...(detail.colors ?? []));
    }

    for (const colorData of bundleColors) {
      const colorName: string = colorData.name ?? '';
      if (!colorName) {
        continue;
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
    }

    return [...found];
  }

  private extractMaterials(data: Record<string, any>): string[] {
    const found = new Set<string>();
    const attributes: Record<string, any>[] = [...(data.attributes ?? [])];
    const bundleProducts: Record<string, any>[] =
      data.bundleProductSummaries ?? [];

    let materialText = '';
    if (bundleProducts.length > 0) {
      attributes.push(...(bundleProducts[0].attributes ?? []));
      const detail = bundleProducts[0].detail ?? {};
      const composition: any[] = detail.composition ?? [];
      const compositionByZone: any[] = detail.compositionByZone ?? [];
      for (const comp of [...composition, ...compositionByZone]) {
        const compText = String(comp).toLowerCase();
        for (const keyword of materialKeywords) {
          if (compText.includes(keyword.toLowerCase())) {
            const token = formatEnum(keyword);
            if (token) {
              found.add(token);
            }
          }
        }
      }
    }

    for (const attr of attributes) {
      const attrName: string = (attr.name ?? '').toLowerCase();
      const attrValue: string = (attr.value ?? '').toLowerCase();
      if (
        ['piel', 'leather', 'material', 'composition'].some((keyword) =>
          attrName.includes(keyword),
        )
      ) {
        materialText += ` ${attrValue}`;
      }
    }

    for (const keyword of materialKeywords) {
      if (materialText.toLowerCase().includes(keyword.toLowerCase())) {
        const token = formatEnum(keyword);
        if (token) {
          found.add(token);
        }
      }
    }

    return [...found];
  }
}
