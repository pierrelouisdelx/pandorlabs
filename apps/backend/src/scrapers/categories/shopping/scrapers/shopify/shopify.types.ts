import { ProductCategory } from '@pandorlabs/types';

/** A category → collection-handles mapping for one Shopify storefront. */
export interface ShopifyStoreCollection {
  main: ProductCategory;
  handles: string[];
}

/**
 * One Shopify storefront. Ported from the fynd-scraper `SHOPIFY_STORES` table.
 * `id` doubles as the scraper id and the Mongo collection name.
 */
export interface ShopifyStore {
  id: string;
  name: string;
  marketplace: string;
  link: string;
  collections: ShopifyStoreCollection[];
}
