import * as cheerio from 'cheerio';
import {
  colorKeywords,
  extractMaterialsFromText,
  formatEnum,
} from '../../utils/product-fields';
import {
  buildProduct,
  MAX_PRODUCT_IMAGES,
  ScrapedProduct,
  ScrapedProductImage,
} from '../../utils/product';

/** Raw shape of a product entry from `/collections/{handle}/products.json`. */
export interface ShopifyRawProduct {
  title?: string;
  handle?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  options?: { name?: string; values?: string[] }[];
  variants?: {
    available?: boolean;
    price?: string;
    compare_at_price?: string | null;
    price_currency?: string;
  }[];
  images?: { src?: string; alt?: string }[];
}

/** Strip HTML to plain text (port of BeautifulSoup `get_text`). */
function htmlToText(html: string | undefined): string {
  if (!html) {
    return '';
  }
  return cheerio.load(html).text().trim();
}

/** Port of `_extract_colors_static`: options named colour/color + tags. */
function extractColors(product: ShopifyRawProduct): string[] {
  const colors = new Set<string>();

  for (const option of product.options ?? []) {
    if (['colour', 'color'].includes((option.name ?? '').toLowerCase())) {
      for (const value of option.values ?? []) {
        const token = formatEnum(value);
        if (token) {
          colors.add(token);
        }
      }
    }
  }

  for (const tag of product.tags ?? []) {
    if (typeof tag !== 'string') {
      continue;
    }
    if (tag.startsWith('ColGrp~')) {
      const token = formatEnum(tag.replace('ColGrp~', '').trim());
      if (token) {
        colors.add(token);
      }
    }
    const lower = tag.toLowerCase();
    for (const keyword of colorKeywords) {
      if (lower.includes(keyword.toLowerCase())) {
        const token = formatEnum(keyword);
        if (token) {
          colors.add(token);
        }
      }
    }
  }

  return [...colors];
}

/** Port of `_extract_materials_static`: body_html text + title. */
function extractMaterials(product: ShopifyRawProduct): string[] {
  const bodyText = htmlToText(product.body_html);
  const found = new Set<string>([
    ...extractMaterialsFromText(bodyText),
    ...extractMaterialsFromText(product.title ?? ''),
  ]);
  return [...found];
}

/** Port of `_extract_images_static`: images[].src, first is main, cap 10. */
function extractImages(product: ShopifyRawProduct): ScrapedProductImage[] {
  const images: ScrapedProductImage[] = [];
  const seen = new Set<string>();

  (product.images ?? []).forEach((image, idx) => {
    if (images.length >= MAX_PRODUCT_IMAGES) {
      return;
    }
    const url = image.src ?? '';
    if (url && !seen.has(url)) {
      seen.add(url);
      images.push({
        url,
        name: image.alt ?? '',
        isMain: idx === 0,
        order: images.length,
      });
    }
  });

  return images;
}

/**
 * Parse one raw Shopify product into a normalized product, or `null` when it
 * should be skipped (no title/handle, or no available variants).
 * Port of `ShopifyScraper.parse_product_static`.
 */
export function parseShopifyProduct(
  product: ShopifyRawProduct,
  ctx: { marketplace: string; websiteLink: string; category: string },
): ScrapedProduct | null {
  const { title, handle } = product;
  if (!title || !handle) {
    return null;
  }

  const availableVariants = (product.variants ?? []).filter((v) => v.available);
  if (availableVariants.length === 0) {
    return null;
  }

  const productUrl = `${ctx.websiteLink}/products/${handle}`;
  const firstVariant = availableVariants[0];

  return buildProduct({
    url: productUrl,
    name: title,
    marketplace: ctx.marketplace,
    category: ctx.category,
    subCategory: product.product_type ?? null,
    description: htmlToText(product.body_html) || null,
    brand: product.vendor ?? null,
    price: firstVariant.price ?? null,
    discountedPrice: firstVariant.compare_at_price ?? null,
    currency: firstVariant.price_currency ?? 'USD',
    colors: extractColors(product),
    materials: extractMaterials(product),
    images: extractImages(product),
  });
}
