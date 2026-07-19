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

const SLUGS = ['Clothing', 'Shoes', 'Bags', 'Accessories'];

const ALGOLIA_URL =
  'https://6l0oqj41cq-2.algolianet.com/1/indexes/*/queries' +
  '?x-algolia-agent=Algolia for JavaScript (4.4.0); Browser (lite); JS Helper (3.24.1);' +
  ' react (16.8.6); react-instantsearch (6.7.0); react-instantsearch-server (6.7.0)' +
  '&x-algolia-api-key=ee556f77348dacc02278dafa57be6d34&x-algolia-application-id=6L0OQJ41CQ';

const ALGOLIA_HEADERS: Record<string, string> = {
  'content-type': 'application/x-www-form-urlencoded',
  Origin: 'https://www.cettire.com',
  Referer: 'https://www.cettire.com/',
};

const GRAPHQL_URL = 'https://api.cettire.com/graphql';
const GRAPHQL_HEADERS: Record<string, string> = {
  'content-type': 'application/json',
  Origin: 'https://www.cettire.com',
  Referer: 'https://www.cettire.com/',
};

const CATALOG_ITEM_PRODUCT_QUERY =
  'query catalogItemProductQuery($slugOrId: String!, $lang: String, $langVersion: String, $userPrefer: UserPreferInput) {\n  catalogItemProduct(slugOrId: $slugOrId, userPrefer: $userPrefer) {\n    product {\n      _id\n      productId\n      title\n      slug\n      description\n      vendor\n      isLowQuantity\n      isSoldOut\n      isBackorder\n      sku\n      barcode\n      productType\n      vip {\n        level\n        __typename\n      }\n      metafields {\n        description\n        key\n        namespace\n        scope\n        value\n        valueType\n        __typename\n      }\n      pricing {\n        currency {\n          code\n          __typename\n        }\n        displayPrice\n        minPrice\n        maxPrice\n        __typename\n      }\n      shop {\n        currency {\n          code\n          __typename\n        }\n        __typename\n      }\n      primaryImage {\n        URLs {\n          large\n          medium\n          original\n          small\n          thumbnail\n          __typename\n        }\n        priority\n        productId\n        variantId\n        __typename\n      }\n      media {\n        priority\n        productId\n        variantId\n        URLs {\n          thumbnail\n          small\n          medium\n          large\n          original\n          originalWebp\n          mediumWebp\n          largeWebp\n          __typename\n        }\n        __typename\n      }\n      tags {\n        nodes {\n          name\n          slug\n          position\n          metafields {\n            key\n            value\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      variants {\n        _id\n        variantId\n        title\n        optionTitle\n        index\n        sku\n        barcode\n        pricing {\n          compareAtPrice {\n            displayAmount\n            __typename\n          }\n          price\n          currency {\n            code\n            __typename\n          }\n          displayPrice\n          __typename\n        }\n        currencyPrices {\n          price\n          currencyCode\n          compareAtPrice\n          regionCode\n          finalSale\n          __typename\n        }\n        canBackorder\n        inventoryAvailableToSell\n        isBackorder\n        isSoldOut\n        isLowQuantity\n        options {\n          _id\n          variantId\n          title\n          index\n          pricing {\n            compareAtPrice {\n              displayAmount\n              __typename\n            }\n            price\n            currency {\n              code\n              __typename\n            }\n            displayPrice\n            __typename\n          }\n          optionTitle\n          canBackorder\n          inventoryAvailableToSell\n          isBackorder\n          isSoldOut\n          isLowQuantity\n          media {\n            priority\n            productId\n            variantId\n            URLs {\n              thumbnail\n              small\n              medium\n              large\n              original\n              __typename\n            }\n            __typename\n          }\n          metafields {\n            description\n            key\n            namespace\n            scope\n            value\n            valueType\n            __typename\n          }\n          primaryImage {\n            URLs {\n              large\n              medium\n              original\n              small\n              thumbnail\n              __typename\n            }\n            priority\n            productId\n            variantId\n            __typename\n          }\n          __typename\n        }\n        media {\n          priority\n          productId\n          variantId\n          URLs {\n            thumbnail\n            small\n            medium\n            large\n            original\n            __typename\n          }\n          __typename\n        }\n        metafields {\n          description\n          key\n          namespace\n          scope\n          value\n          valueType\n          __typename\n        }\n        primaryImage {\n          URLs {\n            large\n            medium\n            original\n            small\n            thumbnail\n            __typename\n          }\n          priority\n          productId\n          variantId\n          __typename\n        }\n        size\n        color\n        __typename\n      }\n      seoTitle\n      seoDescription\n      seoUrl\n      lang(lang: $lang, langVersion: $langVersion)\n      __typename\n    }\n    __typename\n  }\n}\n';

interface CettireLink {
  category: string;
  link: string;
}

/**
 * Cettire scraper. Uses Cettire's Algolia index for link discovery and their
 * public GraphQL API for product detail. Port of the Python `CettireScraper`.
 */
export class CettireScraper extends FashionScraper {
  constructor(connection?: Connection, proxyService?: ProxyService) {
    super(
      'cettire',
      ScraperCategory.SHOPPING,
      {
        url: 'https://www.cettire.com',
        metadata: {
          name: 'Cettire',
          description: 'Scrapes Cettire via Algolia search + GraphQL API',
          tags: ['cettire', 'shopping', 'luxury'],
        },
        collectionName: 'cettire',
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

  /** POST a JSON-encoded body via the inherited proxied Impit client. */
  private async postJson<T>(
    url: string,
    body: string,
    headers: Record<string, string>,
  ): Promise<T> {
    const client = this.createImpitClient();
    const response = await client.fetch(url, {
      method: 'POST',
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return JSON.parse(await response.text()) as T;
  }

  private async getPageData(
    pageNum: number,
    tag: string,
  ): Promise<{
    results?: { nbPages: number; hits: { handle: string }[] }[];
  }> {
    const query = {
      requests: [
        {
          indexName: 'production_rep_cettire_vip_date_desc',
          params:
            `distinct=1&facetFilters=[["department:women"]]&facets=["Color","Size","department","product_type","tags","vendor"]` +
            `&filters=visibility:YES AND department:women AND tags:${tag} AND (vipLevel: 0 OR vipLevel: null) AND www_usd_price_f > 0` +
            `&highlightPostTag=</ais-highlight-0000000000>&highlightPreTag=<ais-highlight-0000000000>&hitsPerPage=96` +
            `&maxValuesPerFacet=10000&page=${pageNum}&query=`,
        },
      ],
    };
    return this.postJson(ALGOLIA_URL, JSON.stringify(query), ALGOLIA_HEADERS);
  }

  private async getLinks(): Promise<CettireLink[]> {
    const links: CettireLink[] = [];
    const seen = new Set<string>();

    for (const slug of SLUGS) {
      let pageNum = 1;
      let maxPage = 3;

      while (pageNum <= maxPage) {
        try {
          this.logger.log(`Scraping page ${pageNum}/${maxPage} for ${slug}...`);
          const response = await this.getPageData(pageNum, slug.toLowerCase());
          this.stats.pagesFetched++;

          if (response.results && response.results.length > 0) {
            const pageData = response.results[0];
            if (pageData.nbPages > maxPage) {
              maxPage = pageData.nbPages;
            }

            for (const hit of pageData.hits ?? []) {
              if (!seen.has(hit.handle)) {
                seen.add(hit.handle);
                links.push({ category: slug, link: hit.handle });
              }
            }
          } else {
            this.logger.warn(`Warning: No data found for page ${pageNum}`);
          }

          pageNum++;
        } catch (error) {
          this.stats.fetchErrors++;
          this.logger.error(
            `Error scraping page ${pageNum} for ${slug}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          pageNum++;
        }
      }
    }

    return links;
  }

  private async fetchAndParse(
    linkData: CettireLink,
  ): Promise<ScrapedProduct | null> {
    const body = JSON.stringify({
      operationName: 'catalogItemProductQuery',
      variables: {
        slugOrId: linkData.link,
        lang: 'en_US',
        langVersion: '1.0',
        userPrefer: {
          currencyCode: 'USD',
          countryCode: 'US',
          regionCode: 'www',
        },
      },
      query: CATALOG_ITEM_PRODUCT_QUERY,
    });

    let json: Record<string, any>;
    try {
      json = await this.postJson(GRAPHQL_URL, body, GRAPHQL_HEADERS);
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
        json?.data?.catalogItemProduct?.product ?? {};

      if (!productData || Object.keys(productData).length === 0) {
        this.logger.warn(`No product data found for ${linkData.link}`);
        return null;
      }

      const variants: Record<string, any>[] = productData.variants ?? [];
      const availableVariants = variants.filter((v) => !v.isSoldOut);
      if (availableVariants.length === 0) {
        this.logger.debug(`Product ${linkData.link} is out of stock`);
        return null;
      }

      const name: string | undefined = productData.title;
      if (!name) {
        this.logger.warn(`Title is missing for ${linkData.link}`);
        return null;
      }

      const nodes: Record<string, any>[] = productData.tags?.nodes ?? [];
      const subCategory: string | null = productData.productType ?? null;
      const subSubCategory: string | null =
        nodes.length >= 2 ? (nodes[nodes.length - 2]?.name ?? null) : null;

      const description: string | null = productData.description ?? null;
      const brand: string | null = productData.vendor ?? null;

      const variant = availableVariants[0];
      const { price, discountedPrice, currency } = this.parsePrices(variant);

      const url = `https://www.cettire.com/products/${productData.slug}/${variant.variantId}`;

      return buildProduct({
        url,
        name,
        marketplace: 'CETTIRE',
        category: linkData.category,
        subCategory,
        subSubCategory,
        description,
        brand,
        price,
        discountedPrice,
        currency,
        images: this.extractImages(productData),
        colors: this.extractColors(description),
        materials: extractMaterialsFromText(description),
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

  private parsePrices(variant: Record<string, any>): {
    price: number | null;
    discountedPrice: number | null;
    currency: string;
  } {
    const currencyPrices: Record<string, any>[] = variant.currencyPrices ?? [];
    if (currencyPrices.length === 0) {
      return { price: null, discountedPrice: null, currency: 'USD' };
    }

    const priceInfo = currencyPrices[0];
    const priceData: number | undefined = priceInfo.price;
    const compareAtPriceData: number | undefined = priceInfo.compareAtPrice;

    let price: number | null = null;
    let discountedPrice: number | null = null;

    if (
      priceData !== undefined &&
      priceData !== null &&
      compareAtPriceData == null
    ) {
      price = Math.trunc(priceData * 100);
    }
    if (
      (priceData === undefined || priceData === null) &&
      compareAtPriceData != null
    ) {
      price = Math.trunc(compareAtPriceData * 100);
    }
    if (
      priceData !== undefined &&
      priceData !== null &&
      compareAtPriceData != null
    ) {
      price = Math.trunc(priceData * 100);
      discountedPrice = Math.trunc(compareAtPriceData * 100);
    }

    if (
      discountedPrice !== null &&
      price !== null &&
      discountedPrice >= price
    ) {
      discountedPrice = null;
    }

    const currency: string = priceInfo.currencyCode ?? 'USD';

    return { price, discountedPrice, currency };
  }

  private extractImages(
    productData: Record<string, any>,
  ): ScrapedProductImage[] {
    const seen = new Set<string>();
    const images: ScrapedProductImage[] = [];

    const primaryUrl = productData.primaryImage?.URLs?.original;
    if (primaryUrl && !seen.has(primaryUrl)) {
      seen.add(primaryUrl);
      images.push({
        url: primaryUrl,
        name: '',
        isMain: true,
        order: images.length,
      });
    }

    for (const media of productData.media ?? []) {
      const url = media?.URLs?.original;
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push({ url, name: '', isMain: false, order: images.length });
      }
    }

    return images;
  }

  private extractColors(description: string | null): string[] {
    if (!description) {
      return [];
    }
    const parts = description.split('Designer Colour: ');
    if (parts.length <= 1) {
      return [];
    }
    const raw = parts[1].split('<br />')[0];
    const token = formatEnum(raw);
    return token ? [token] : [];
  }
}
