/**
 * Shared normalized shape for every scraped shopping product, plus a builder
 * that applies the same coercions the Python `ProductSchema` did (price → cents,
 * discount sanity, enum-formatting of sub-categories/brand).
 *
 * Storage is one Mongo collection per site, but every collection uses this same
 * shape so the `products/shopping` views can read them uniformly.
 */
import { formatEnum, normalizePrice, resolveDiscount } from './product-fields';

export interface ScrapedProductImage {
  url: string;
  name: string;
  isMain: boolean;
  order: number;
}

export interface ScrapedProduct {
  /** Canonical product URL — unique key within a site's collection. */
  url: string;
  name: string;
  marketplace: string;
  brand: string | null;
  category: string | null;
  subCategory: string | null;
  subSubCategory: string | null;
  description: string | null;
  /** Integer cents. */
  price: number | null;
  /** Integer cents; null when not a genuine discount. */
  discountedPrice: number | null;
  currency: string;
  images: ScrapedProductImage[];
  colors: string[];
  materials: string[];
}

export interface BuildProductInput {
  url: string;
  name: string;
  marketplace: string;
  brand?: string | null;
  category?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null;
  description?: string | null;
  price?: string | number | null;
  discountedPrice?: string | number | null;
  currency?: string;
  images?: ScrapedProductImage[];
  colors?: string[];
  materials?: string[];
}

/** Cap on images kept per product, matching the source's `>= 10` guard. */
export const MAX_PRODUCT_IMAGES = 10;

/**
 * Build a normalized product record, replicating `ProductSchema` semantics.
 * Throws if required fields (`url`, `name`) are missing so callers can count it
 * as a failed item.
 */
export function buildProduct(input: BuildProductInput): ScrapedProduct {
  if (!input.url) {
    throw new Error('Product is missing a url');
  }
  if (!input.name) {
    throw new Error(`Product ${input.url} is missing a name`);
  }

  const price = normalizePrice(input.price ?? null);
  const discountedPrice = resolveDiscount(
    price,
    normalizePrice(input.discountedPrice ?? null),
  );

  return {
    url: input.url,
    name: input.name,
    marketplace: input.marketplace,
    brand: formatEnum(input.brand ?? null),
    category: input.category ? input.category.toUpperCase() : null,
    subCategory: formatEnum(input.subCategory ?? null),
    subSubCategory: formatEnum(input.subSubCategory ?? null),
    description: input.description ?? null,
    price,
    discountedPrice,
    currency: input.currency ?? 'USD',
    images: (input.images ?? []).slice(0, MAX_PRODUCT_IMAGES),
    colors: dedupe(input.colors ?? []),
    materials: dedupe(input.materials ?? []),
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
