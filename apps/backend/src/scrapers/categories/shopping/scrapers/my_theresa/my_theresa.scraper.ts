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

interface MyTheresaLink {
  url: string;
  slug: string;
  category: string;
}

const API_URL = 'https://api.mytheresa.com/api';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Safari/537.36',
  Accept: '*/*',
  'Content-Type': 'application/json',
  'Sec-Ch-Ua': '"Chromium";v="131", "Not_A Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"macOS"',
  'X-Store': 'US',
  'X-Country': 'US',
  'X-Section': 'women',
  'Accept-Language': 'en',
  Referer: 'https://www.mytheresa.com/',
};

const CATEGORIES = ['clothing', 'bags', 'shoes', 'accessories', 'jewelry'];

// Trimmed listing query — keeps only the fields this scraper reads (slug + pagination),
// unlike the Python source's exhaustive field set.
const LIST_QUERY = `query XProductListingPageQuery($categories: [String], $colors: [String], $designers: [String], $fta: Boolean, $materials: [String], $page: Int, $patterns: [String], $reductionRange: [String], $saleStatus: SaleStatusEnum, $size: Int, $sizesHarmonized: [String], $slug: String, $sort: String) {
  xProductListingPage(categories: $categories, colors: $colors, designers: $designers, fta: $fta, materials: $materials, page: $page, patterns: $patterns, reductionRange: $reductionRange, saleStatus: $saleStatus, size: $size, sizesHarmonized: $sizesHarmonized, slug: $slug, sort: $sort) {
    pagination {
      currentPage
      itemsPerPage
      totalItems
      totalPages
    }
    products {
      slug
    }
  }
}`;

const DETAIL_QUERY = `query xProductQuery($slug: String!) {
  xProduct(slug: $slug) {
    name
    color
    combinedCategoryName
    description
    designer
    displayImages
    price {
      currencyCode
      currencySymbol
      discount
      original
    }
    variants {
      availability {
        hasStock
      }
    }
  }
}`;

/**
 * MyTheresa scraper. GraphQL API for both listing and detail. Port of the
 * Python `MyTheresaScraper`. Uses `createImpitClient()` directly (inherited
 * from `BaseScraper`) for POST requests since `FashionHttp` only exposes GET.
 */
export class MyTheresaScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'my_theresa',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.mytheresa.com',
        metadata: {
          name: 'Mytheresa',
          description: 'Scrapes Mytheresa via its internal GraphQL API',
          tags: ['my_theresa', 'shopping'],
        },
        collectionName: 'my_theresa',
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

  private async postJson<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const client = this.createImpitClient();
    const response = await client.fetch(API_URL, {
      method: 'POST',
      headers: { ...HEADERS },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${API_URL}`);
    }
    return JSON.parse(await response.text()) as T;
  }

  private async getLinks(): Promise<MyTheresaLink[]> {
    const links: MyTheresaLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let page = 1;
      let maxPage = 3;

      while (page <= maxPage) {
        try {
          const data = await this.postJson<{
            data?: {
              xProductListingPage?: {
                pagination?: { totalPages?: number };
                products?: { slug?: string }[];
              };
            };
          }>(LIST_QUERY, {
            categories: [],
            colors: [],
            designers: [],
            fta: null,
            materials: [],
            page,
            patterns: [],
            reductionRange: [],
            saleStatus: null,
            size: 120,
            sizesHarmonized: [],
            slug: `/${category}`,
            sort: null,
          });
          this.stats.pagesFetched++;

          const listing = data.data?.xProductListingPage;
          const totalPages = listing?.pagination?.totalPages ?? maxPage;
          if (totalPages > maxPage) {
            maxPage = totalPages;
          }

          for (const product of listing?.products ?? []) {
            const slug = product.slug;
            if (!slug) {
              continue;
            }
            const url = slug.startsWith('/')
              ? `https://www.mytheresa.com/us/en/women${slug}`
              : `https://www.mytheresa.com/us/en/women/${slug}`;
            if (!seen.has(url)) {
              seen.add(url);
              links.push({ url, slug, category });
            }
          }
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category} page ${page}: ${
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
    linkData: MyTheresaLink,
  ): Promise<ScrapedProduct | null> {
    let json: { data?: { xProduct?: Record<string, any> } };
    try {
      json = await this.postJson<{ data?: { xProduct?: Record<string, any> } }>(
        DETAIL_QUERY,
        { slug: linkData.slug },
      );
    } catch (error) {
      this.stats.fetchErrors++;
      this.logger.error(
        `Fetch failed for ${linkData.url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }

    try {
      const productData = json.data?.xProduct;
      if (!productData) {
        return null;
      }

      const variants: Record<string, any>[] = productData.variants ?? [];
      const availableVariants = variants.filter(
        (variant) => variant.availability?.hasStock,
      );
      if (availableVariants.length === 0) {
        return null;
      }

      const name: string | undefined = productData.name;
      if (!name) {
        return null;
      }

      const combinedCategoryName: string =
        productData.combinedCategoryName ?? '';
      const combinedCategoryParts = combinedCategoryName
        .split('::')
        .map((part) => part.trim());

      const category = linkData.category;
      const subCategory =
        combinedCategoryParts.length > 1 ? combinedCategoryParts[1] : null;
      const subSubCategory =
        combinedCategoryParts.length > 2 ? combinedCategoryParts[2] : null;

      const description: string | null = productData.description ?? null;
      const brand: string | null = productData.designer ?? null;

      const priceInfo = productData.price ?? {};
      let price: number | null =
        priceInfo.original !== undefined && priceInfo.original !== null
          ? Math.trunc(priceInfo.original)
          : null;
      let discountedPrice: number | null =
        priceInfo.discount !== undefined && priceInfo.discount !== null
          ? Math.trunc(priceInfo.discount)
          : null;
      if (
        discountedPrice !== null &&
        price !== null &&
        discountedPrice >= price
      ) {
        discountedPrice = null;
      }
      const currency: string = priceInfo.currencyCode ?? 'USD';

      return buildProduct({
        url: linkData.url,
        name,
        marketplace: 'MY_THERESA',
        category,
        subCategory,
        subSubCategory,
        description,
        brand,
        price,
        discountedPrice,
        currency,
        images: this.extractImages(productData, name),
        colors: this.extractColors(productData.color ?? ''),
        materials: extractMaterialsFromText(description),
      });
    } catch (error) {
      this.stats.itemsFailed++;
      this.logger.error(
        `Parsing failed for ${linkData.url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private extractImages(
    productData: Record<string, any>,
    name: string,
  ): ScrapedProductImage[] {
    const displayImages: string[] = productData.displayImages ?? [];
    return displayImages.map((url, idx) => ({
      url,
      name: `${name}_image_${idx}`,
      isMain: idx === 0,
      order: idx,
    }));
  }

  private extractColors(color: string): string[] {
    const token = formatEnum(color);
    return token ? [token] : [];
  }
}
