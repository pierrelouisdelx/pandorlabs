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
  extractPrice,
  formatEnum,
  materialKeywords,
} from '../../utils/product-fields';

interface ModaOperandiLink {
  url: string; // variant id
  category: string;
}

const GRAPHQL_URL = 'https://search.modaoperandi.com/graphql';

const HEADERS = {
  host: 'search.modaoperandi.com',
  referer: 'https://www.modaoperandi.com/',
  'content-type': 'application/json',
  'client-country-code': 'US',
  origin: 'https://www.modaoperandi.com',
};

const CATEGORIES = ['clothing', 'shoes', 'bags', 'jewelry', 'accessories'];

const LIST_QUERY = `query ProductListPageCategoryQuery($after: String!, $categoryPath: String, $countryCode: String, $section: String!, $slug: String!) {
  categoryResult: product_listing(
    input: {category_path: $categoryPath, country_code: $countryCode}
    slug: $slug
    section: $section
  ) {
    variants(after: $after) {
      edges {
        node {
          id: id
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`;

// Minimal detail query: only the fields this scraper actually reads, unlike the
// Python source's huge fragment-laden query (kept functionally equivalent).
const DETAIL_QUERY = `query ProductDetailPageQuery($variantId: String!, $countryCode: String) {
  variant(id: $variantId) {
    id
    name
    designerName: designer_name
    designerSlug: designer_slug
    productSlug: slug
    category
    subcategory
    description
    descriptionText: description_text
    detailBullets: detail_bullets
    masterVariant: master_variants_data {
      color
      primaryImage: primary_image_urls {
        large
      }
      alternateImages: alternate_image_urls {
        large
      }
      prices(country_code: $countryCode) {
        currentPrice: current_price {
          price
        }
        originalPrice: original_price {
          price
        }
      }
    }
  }
}`;

/**
 * Moda Operandi scraper. GraphQL API for both listing and detail. Port of the
 * Python `ModaOperandiScraper`. Uses `createImpitClient()` directly (inherited
 * from `BaseScraper`) for POST requests since `FashionHttp` only exposes GET.
 */
export class ModaOperandiScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'modaoperandi',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.modaoperandi.com',
        metadata: {
          name: 'Moda Operandi',
          description: 'Scrapes Moda Operandi via its internal GraphQL API',
          tags: ['modaoperandi', 'shopping'],
        },
        collectionName: 'modaoperandi',
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
    operationName: string,
  ): Promise<T> {
    const client = this.createImpitClient();
    const response = await client.fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { ...HEADERS },
      body: JSON.stringify({ operationName, variables, query }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${GRAPHQL_URL}`);
    }
    return JSON.parse(await response.text()) as T;
  }

  private async getLinks(): Promise<ModaOperandiLink[]> {
    const links: ModaOperandiLink[] = [];
    const seen = new Set<string>();

    for (const category of CATEGORIES) {
      let after = '';
      let hasNextPage = true;

      while (hasNextPage) {
        try {
          const data = await this.postJson<{
            data?: {
              categoryResult?: {
                variants?: {
                  edges?: { node?: { id?: string } }[];
                  pageInfo?: { hasNextPage?: boolean; endCursor?: string };
                };
              };
            };
          }>(
            LIST_QUERY,
            {
              after,
              categoryPath: `women/${category}`,
              countryCode: 'US',
              section: 'shop',
              slug: `women/${category}`,
            },
            'ProductListPageCategoryQuery',
          );
          this.stats.pagesFetched++;

          const edges = data.data?.categoryResult?.variants?.edges ?? [];
          if (edges.length === 0) {
            break;
          }

          for (const edge of edges) {
            const variantId = edge.node?.id;
            if (variantId && !seen.has(variantId)) {
              seen.add(variantId);
              links.push({ url: variantId, category });
            }
          }

          const pageInfo = data.data?.categoryResult?.variants?.pageInfo;
          after = pageInfo?.endCursor ?? '';
          hasNextPage = Boolean(pageInfo?.hasNextPage);
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Failed to get links for ${category}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: ModaOperandiLink,
  ): Promise<ScrapedProduct | null> {
    let json: { data?: { variant?: Record<string, any> } };
    try {
      json = await this.postJson<{ data?: { variant?: Record<string, any> } }>(
        DETAIL_QUERY,
        { variantId: linkData.url, countryCode: 'US' },
        'ProductDetailPageQuery',
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
      const variantData = json.data?.variant;
      if (!variantData) {
        return null;
      }
      const masterVariant = variantData.masterVariant ?? {};

      const designerSlug: string = variantData.designerSlug ?? '';
      const productSlug: string = variantData.productSlug ?? '';
      const url =
        designerSlug && productSlug
          ? `https://www.modaoperandi.com/women/p/${designerSlug}/${productSlug}/${linkData.url}`
          : '';
      if (!url) {
        return null;
      }

      const name: string = variantData.name ?? '';
      const brand: string = variantData.designerName ?? '';
      const descriptionText: string = variantData.descriptionText ?? '';
      const descriptionHtml: string = variantData.description ?? '';
      const description = descriptionText
        ? descriptionText
        : descriptionHtml
          ? cheerio.load(descriptionHtml).text()
          : '';

      const category = formatEnum(linkData.category);
      const categories: string[] = variantData.category ?? [];
      const subcategories: string[] = variantData.subcategory ?? [];

      let subCategory: string | null =
        categories.length > 0 ? formatEnum(categories[0]) : '';
      let subSubCategory: string | null =
        subcategories.length > 0 ? formatEnum(subcategories[0]) : '';
      if (category === subCategory) {
        subCategory = subSubCategory;
        subSubCategory = null;
      }

      const prices = masterVariant.prices ?? {};
      const currentPrice = prices.currentPrice?.price;
      const originalPrice = prices.originalPrice?.price;

      let price: number | null = null;
      let discountedPrice: number | null = null;

      if (currentPrice !== undefined && currentPrice !== null) {
        price = extractPrice(String(currentPrice));
      }
      if (
        originalPrice !== undefined &&
        originalPrice !== null &&
        currentPrice !== undefined &&
        currentPrice !== null &&
        extractPrice(String(originalPrice)) !==
          extractPrice(String(currentPrice))
      ) {
        discountedPrice = extractPrice(String(currentPrice));
        price = extractPrice(String(originalPrice));
      }

      return buildProduct({
        url,
        name,
        marketplace: 'MODA_OPERANDI',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand: formatEnum(brand),
        price,
        discountedPrice,
        images: this.extractImages(masterVariant),
        colors: this.extractColors(masterVariant),
        materials: this.extractMaterials(variantData.detailBullets ?? ''),
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
    masterVariant: Record<string, any>,
  ): ScrapedProductImage[] {
    const images: ScrapedProductImage[] = [];

    const primaryImage = masterVariant.primaryImage;
    if (primaryImage?.large) {
      images.push({
        url: primaryImage.large,
        name: 'primary',
        isMain: true,
        order: images.length,
      });
    }

    const alternateImages: Record<string, any>[] =
      masterVariant.alternateImages ?? [];
    alternateImages.forEach((image, idx) => {
      if (image.large) {
        images.push({
          url: image.large,
          name: `alternate_${idx + 1}`,
          isMain: false,
          order: images.length,
        });
      }
    });

    return images;
  }

  private extractColors(masterVariant: Record<string, any>): string[] {
    const colorName: string = masterVariant.color ?? '';
    if (!colorName) {
      return [];
    }
    const token = formatEnum(colorName);
    return token ? [token] : [];
  }

  private extractMaterials(detailBullets: string): string[] {
    if (!detailBullets) {
      return [];
    }
    const text = cheerio.load(detailBullets).text().toLowerCase();
    const found = new Set<string>();
    for (const keyword of materialKeywords) {
      if (text.includes(keyword)) {
        const token = formatEnum(keyword);
        if (token) {
          found.add(token);
        }
      }
    }
    return [...found];
  }
}
