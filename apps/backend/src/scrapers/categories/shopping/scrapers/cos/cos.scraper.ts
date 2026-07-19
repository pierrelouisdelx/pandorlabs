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

interface CosSlug {
  cat: string | null;
  slug: string;
}

interface CosCategory {
  name: string;
  slugs: CosSlug[];
}

interface CosLink {
  link: string;
  category: string;
  subCategory: string | null;
}

const NEXT_HASH = '244f80d4f15fa9830a05cb93efd3d71ed5494892';

const CATEGORIES: CosCategory[] = [
  {
    name: 'SHOES',
    slugs: [
      {
        cat: null,
        slug: 'catalog01_women_womenaccessories_womenaccessoriesshoes',
      },
    ],
  },
  {
    name: 'JEWELRY',
    slugs: [
      {
        cat: null,
        slug: 'catalog01_women_womenaccessories_womenaccessoriesjewellery',
      },
    ],
  },
  {
    name: 'BAGS',
    slugs: [
      {
        cat: null,
        slug: 'catalog01_women_womenaccessories_womenaccessoriesbags',
      },
    ],
  },
  {
    name: 'ACCESSORIES',
    slugs: [
      {
        cat: 'SWIMWEAR',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearswimwear',
      },
      {
        cat: 'HATS & SCARVES',
        slug:
          'catalog01_women_womenaccessories_womenaccessorieshatsscarvesgloves,' +
          'catalog01_women_womenaccessories_womenaccessorieshatsscarvesgloves_womenaccessorieshatsscarvesglovesoutdoorlayers',
      },
      {
        cat: 'BELTS',
        slug: 'catalog01_women_womenaccessories_womenaccessoriesbelts',
      },
      {
        cat: 'SOCKS & TIGHTS',
        slug: 'catalog01_women_womenaccessories_womenaccessoriessockstights',
      },
    ],
  },
  {
    name: 'CLOTHING',
    slugs: [
      {
        cat: 'DRESSES',
        slug: 'catalog01_women_womenwomenswear_womenwomensweardresses',
      },
      {
        cat: 'PANTS',
        slug: 'catalog01_women_womenwomenswear_womenwomensweartrousers',
      },
      {
        cat: 'CASHMERE',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearknitwear_womenwomenswearknitwearcashmereknitwear',
      },
      {
        cat: 'KNITWEAR',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearknitwear',
      },
      {
        cat: 'TOPS',
        slug: 'catalog01_women_womenwomenswear_womenwomensweartops',
      },
      {
        cat: 'TSHIRTS',
        slug: 'catalog01_women_womenwomenswear_womenwomensweartshirts',
      },
      {
        cat: 'JEANS',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearjeans',
      },
      {
        cat: 'SHIRTS',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearshirts',
      },
      {
        cat: 'COATS',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearcoatsjackets',
      },
      {
        cat: 'BLAZERS',
        slug: 'catalog01_women_womenwomenswear_womenwomenswearsuitsandtailoring',
      },
      {
        cat: 'SKIRTS',
        slug:
          'catalog01_women_womenwomenswear_womenwomenswearskirts,' +
          'catalog01_women_womenwomenswear_womenwomenswearskirts_womenwomenswearskirtsskirts,' +
          'catalog01_women_womenwomenswear_womenwomenswearwwlongskirtsgm',
      },
    ],
  },
];

// Note: the source sends real browser cookies (`cookies=self.cookies`) and
// routes through a local MITM proxy for cookie injection. Per the porting
// guide we drop both — this relies on the base client's proxy/TLS
// impersonation alone, so 403 at runtime is expected until a cookie manager
// exists.
const HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  Referer: 'https://www.cos.com/en-us/women/jewellery',
};

const VIEW_SIZE = 30;

/**
 * COS scraper. Uses COS's internal search API for link discovery and the
 * Next.js `_next/data` JSON endpoint for product detail.
 * Port of the Python `CosScraper`.
 */
export class CosScraper extends FashionScraper {
  private readonly seenImages = new Set<string>();

  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'cos',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.cos.com/en-us/women',
        metadata: {
          name: 'COS',
          description: 'Scrapes COS via the internal search + _next/data APIs',
          tags: ['cos', 'shopping'],
        },
        collectionName: 'cos',
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

  private async getLinks(): Promise<CosLink[]> {
    const links: CosLink[] = [];
    const seen = new Set<string>();
    const baseUrl = 'https://www.cos.com/api/search/products';

    for (const category of CATEGORIES) {
      for (const slugData of category.slugs) {
        const slug = slugData.slug;
        const subCategory = slugData.cat;
        const location = `//catalog01/en_US/categories<{${slug}}/!statuses_us>{on_sale}/total_stock_us>1`;

        let startIndex = 0;

        while (true) {
          const params = new URLSearchParams({
            location,
            marketCode: 'us',
            startIndex: String(startIndex),
            viewSize: String(VIEW_SIZE),
            view: 'lister',
            includeFacets: 'true',
            categoryLayout: 'medium_grid',
            deviceType: 'desktop',
            customerType: 'regular',
          });

          try {
            const data = await this.http.getJson<{
              items?: { uri?: string; categoryUri?: string }[];
              totalItems?: number;
            }>(`${baseUrl}?${params.toString()}`, { headers: HEADERS });
            this.stats.pagesFetched++;

            const items = data.items ?? [];
            if (items.length === 0) {
              if (startIndex === 0) {
                this.logger.warn(
                  `No products found for ${category.name} - ${subCategory ?? 'All'}`,
                );
              }
              break;
            }

            for (const item of items) {
              const uri = item.uri;
              const categoryUri = item.categoryUri;
              if (uri && !seen.has(uri)) {
                seen.add(uri);
                links.push({
                  link: `https://www.cos.com/_next/data/${NEXT_HASH}/en-us/${categoryUri}/product/${uri}.json`,
                  category: category.name,
                  subCategory,
                });
              }
            }

            const totalCount = data.totalItems ?? 0;
            if (startIndex + VIEW_SIZE >= totalCount) {
              break;
            }

            startIndex += VIEW_SIZE;
          } catch (error) {
            this.stats.fetchErrors++;
            this.logger.error(
              `Fetching data for ${category.name} - ${subCategory ?? ''} failed: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            break;
          }
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: CosLink,
  ): Promise<ScrapedProduct | null> {
    let json: Record<string, any>;
    try {
      json = await this.http.getJson<Record<string, any>>(linkData.link, {
        headers: HEADERS,
      });
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
      const productData: Record<string, any> =
        json?.pageProps?.blocks?.[1]?.product;
      if (!productData) {
        return null;
      }

      const originalPrice: number =
        productData.priceBeforeDiscountAsNumber ?? productData.priceAsNumber;
      let discountedPrice: number | null = null;
      if ((productData.discountPercent ?? 0) > 0) {
        discountedPrice = productData.priceAsNumber;
      }

      const productUrl = `https://www.cos.com/en-us/${productData.uri}`;

      const categoryNameList: string[] = productData.categoryName ?? [];
      const extractedSubCategory =
        categoryNameList.length > 1
          ? categoryNameList[1]
          : linkData.subCategory;

      return buildProduct({
        url: productUrl,
        name: productData.name,
        marketplace: 'COS',
        category: linkData.category,
        subCategory: linkData.subCategory ? extractedSubCategory : null,
        subSubCategory:
          linkData.subCategory !== null ? extractedSubCategory : null,
        description: productData.description ?? '',
        brand: productData.brandName ?? 'COS',
        price: Math.trunc(originalPrice * 100),
        discountedPrice:
          discountedPrice !== null ? Math.trunc(discountedPrice * 100) : null,
        images: this.extractImages(productData),
        colors: this.extractColors(productData),
        materials: this.extractMaterials(productData),
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

  private extractImages(
    productData: Record<string, any>,
  ): ScrapedProductImage[] {
    const images: string[] = productData.media?.standard ?? [];
    const result: ScrapedProductImage[] = [];

    images.forEach((image, idx) => {
      if (this.seenImages.has(image)) {
        return;
      }
      this.seenImages.add(image);
      result.push({
        url: image,
        name: `Image ${idx + 1}`,
        isMain: idx === 0,
        order: result.length,
      });
    });

    return result;
  }

  private extractColors(productData: Record<string, any>): string[] {
    const color =
      productData.var_pdp_color_desc ?? productData.variantName ?? '';
    const token = formatEnum(color);
    return token ? [token] : [];
  }

  private extractMaterials(productData: Record<string, any>): string[] {
    let materialsDesc: string = productData.description ?? '';
    const compositionDesc = productData.var_material_composition_desc;

    if (compositionDesc) {
      try {
        const compositionData =
          typeof compositionDesc === 'string'
            ? JSON.parse(compositionDesc)
            : compositionDesc;
        for (const comp of compositionData ?? []) {
          for (const materialInfo of comp.materials ?? []) {
            const materialName = materialInfo.material;
            if (materialName) {
              materialsDesc += ` ${materialName}`;
            }
          }
        }
      } catch {
        // ignore malformed composition JSON, matching the source's silent catch
      }
    }

    return extractMaterialsFromText(materialsDesc);
  }
}
