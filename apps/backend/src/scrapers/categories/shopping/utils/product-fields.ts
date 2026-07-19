/**
 * Product field helpers ported from the Python fynd-scraper.
 *
 * Sources:
 *  - src/utils/format.py        → formatEnum / extractPrice
 *  - src/schemas/product.py     → price + discounted-price normalization
 *  - src/models/color.py        → colorKeywords
 *  - src/models/material.py     → materialKeywords
 *
 * Prices are stored as integer cents, matching the source Postgres schema.
 */

/** Known color keywords, ported verbatim from `color.py`. */
export const colorKeywords: string[] = [
  'black',
  'white',
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'brown',
  'gray',
  'grey',
  'pink',
  'orange',
  'gold',
  'silver',
  'bronze',
  'beige',
  'maroon',
  'navy',
  'teal',
  'turquoise',
  'indigo',
  'violet',
  'lavender',
  'fuchsia',
  'coral',
  'khaki',
  'lime',
  'olive',
  'hazelnut',
  'velvet',
  'bordeaux',
];

/** Known material keywords, ported verbatim from `material.py`. */
export const materialKeywords: string[] = [
  'velvet',
  'leather',
  'canvas',
  'suede',
  'fabric',
  'cotton',
  'wool',
  'silk',
  'polyester',
  'nylon',
  'denim',
  'satin',
  'linen',
  'hemp',
  'rubber',
  'plastic',
  'metal',
  'wood',
  'synthetic',
];

/**
 * Normalize a free-text label into an UPPER_SNAKE enum token.
 * Port of `format_enum` (format.py).
 */
export function formatEnum(text: string | null | undefined): string | null {
  if (text === null || text === undefined) {
    return null;
  }

  let normalized = text
    .replace(/Ñ/g, 'N')
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U');

  normalized = normalized.toUpperCase().replace(/[^a-zA-Z0-9]+/g, '_');
  return normalized.replace(/^_+|_+$/g, '');
}

/**
 * Parse a price string into integer cents. Handles both `.`/`,` decimal and
 * thousands separators. Port of `extract_price` (format.py).
 */
export function extractPrice(text: string): number | null {
  let cleaned = text.replace(/[^\d.,]/g, '');
  if (!cleaned) {
    return null;
  }

  const lastComma = cleaned.lastIndexOf(',');
  const lastPeriod = cleaned.lastIndexOf('.');

  if (lastComma > -1 && lastPeriod > -1) {
    if (lastComma > lastPeriod) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastComma > -1) {
    if (cleaned.length - lastComma - 1 === 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  const value = parseFloat(cleaned);
  if (Number.isNaN(value)) {
    return null;
  }
  return Math.trunc(value * 100);
}

/**
 * Coerce a price value into integer cents.
 * Port of `ProductSchema.validate_price`:
 *   int   → assumed already cents, kept as-is
 *   float → multiplied by 100
 *   string→ parsed via extractPrice
 */
export function normalizePrice(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : Math.trunc(value * 100);
  }
  if (typeof value === 'string') {
    return extractPrice(value);
  }
  return null;
}

/**
 * Apply the source's discount rule: a discounted price that is not actually
 * lower than the price is discarded. Port of
 * `ProductSchema.validate_discounted_price_logic`.
 */
export function resolveDiscount(
  price: number | null,
  discountedPrice: number | null,
): number | null {
  if (price !== null && discountedPrice !== null && discountedPrice >= price) {
    return null;
  }
  return discountedPrice;
}

/** Match material keywords against a blob of text (title/description/composition). */
export function extractMaterialsFromText(
  text: string | null | undefined,
): string[] {
  if (!text) {
    return [];
  }
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const keyword of materialKeywords) {
    if (lower.includes(keyword)) {
      const token = formatEnum(keyword);
      if (token) {
        found.add(token);
      }
    }
  }
  return [...found];
}

/** Match color keywords against a blob of text; fall back to the raw label. */
export function extractColorsFromText(
  text: string | null | undefined,
  { fallbackToRaw = false }: { fallbackToRaw?: boolean } = {},
): string[] {
  if (!text) {
    return [];
  }
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const keyword of colorKeywords) {
    if (lower.includes(keyword)) {
      const token = formatEnum(keyword);
      if (token) {
        found.add(token);
      }
    }
  }
  if (found.size === 0 && fallbackToRaw) {
    const token = formatEnum(text);
    if (token) {
      found.add(token);
    }
  }
  return [...found];
}
