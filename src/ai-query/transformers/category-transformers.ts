import { ScraperCategory } from '@scrapers/enums/scraper-category.enum';
import {
  CategoryData,
  RealEstateData,
  ShoppingData,
  CryptoData,
  LeadGenerationData,
  AiDatasetData,
  SocialMediaData,
} from '../dto/category-data.dto';

/**
 * Main transformer router - delegates to category-specific transformers
 */
export function transformScraperData(
  category: ScraperCategory,
  rawData: any[],
): CategoryData[] {
  switch (category) {
    case ScraperCategory.REAL_ESTATE:
      return transformRealEstateData(rawData);
    case ScraperCategory.SHOPPING:
      return transformShoppingData(rawData);
    case ScraperCategory.CRYPTO:
      return transformCryptoData(rawData);
    case ScraperCategory.LEAD_GENERATION:
      return transformLeadGenerationData(rawData);
    case ScraperCategory.AI_DATASETS:
      return transformAiDatasetData(rawData);
    case ScraperCategory.SOCIAL_MEDIA:
      return transformSocialMediaData(rawData);
    default:
      return [];
  }
}

/**
 * Transform raw auction data to RealEstateData interface
 */
export function transformRealEstateData(rawData: any[]): RealEstateData[] {
  return rawData.map((item) => {
    // Extract images from primary_photo and build array
    const images: string[] = [];
    if (item.primary_photo) {
      images.push(item.primary_photo);
    }

    // Format address from formatted_address array
    const address = Array.isArray(item.formatted_address)
      ? item.formatted_address.join(', ')
      : item.formatted_address || 'Address not available';

    // Extract price from auction or reserve_price
    const price =
      item.auction?.starting_bid ||
      (item.reserve_price ? parseFloat(item.reserve_price) : null);

    // Extract property details from nested structure
    const propertyDetails = item.primary_property?.summary || {};

    return {
      category: ScraperCategory.REAL_ESTATE,
      timestamp: new Date(),
      sourceUrl: item.listing_page_path || null,
      listingId: item.listing_id || item.urn || 'unknown',
      images,
      address,
      price,
      bedrooms: propertyDetails.total_bedrooms || null,
      bathrooms: propertyDetails.total_bathrooms || null,
      squareFeet: propertyDetails.square_footage || null,
      propertyType: propertyDetails.structure_type_code || null,
      listingUrl: item.listing_page_path || null,
    };
  });
}

/**
 * Transform raw product data to ShoppingData interface
 */
export function transformShoppingData(rawData: any[]): ShoppingData[] {
  return rawData.map((item) => {
    return {
      category: ScraperCategory.SHOPPING,
      timestamp: new Date(),
      sourceUrl: item.url || item.link || item.product_url || null,
      productId: item.id || item.product_id || item.sku || 'unknown',
      name: item.title || item.name || item.product_name || 'Unknown Product',
      price:
        item.price ||
        item.amount ||
        item.current_price ||
        (item.price_amount ? parseFloat(item.price_amount) : null),
      image: item.image || item.thumbnail || item.image_url || null,
      url: item.url || item.link || item.product_url || null,
    };
  });
}

/**
 * Transform raw cryptocurrency data to CryptoData interface
 */
export function transformCryptoData(rawData: any[]): CryptoData[] {
  return rawData.map((item) => {
    return {
      category: ScraperCategory.CRYPTO,
      timestamp: new Date(),
      sourceUrl: item.url || item.link || null,
      tokenId: item.id || item.token_id || item.symbol || 'unknown',
      symbol: item.symbol || item.ticker || item.token_symbol || 'N/A',
      name: item.name || item.title || item.token_name || 'Unknown Token',
      price:
        item.price ||
        item.current_price ||
        item.price_usd ||
        (item.quote?.USD?.price ? parseFloat(item.quote.USD.price) : null),
      marketCap:
        item.market_cap ||
        item.marketCap ||
        item.market_cap_usd ||
        (item.quote?.USD?.market_cap
          ? parseFloat(item.quote.USD.market_cap)
          : null),
    };
  });
}

/**
 * Transform raw contact data to LeadGenerationData interface
 */
export function transformLeadGenerationData(
  rawData: any[],
): LeadGenerationData[] {
  return rawData.map((item) => {
    // Handle full name or separate first/last name
    const name =
      item.name ||
      item.full_name ||
      (item.first_name && item.last_name
        ? `${item.first_name} ${item.last_name}`
        : null) ||
      'Unknown Contact';

    return {
      category: ScraperCategory.LEAD_GENERATION,
      timestamp: new Date(),
      sourceUrl: item.url || item.profile_url || null,
      contactId: item.id || item.contact_id || item.lead_id || 'unknown',
      name,
      email: item.email || item.email_address || item.work_email || null,
      company:
        item.company || item.company_name || item.organization || null,
      phone:
        item.phone ||
        item.phone_number ||
        item.mobile ||
        item.work_phone ||
        null,
    };
  });
}

/**
 * Transform raw dataset metadata to AiDatasetData interface
 */
export function transformAiDatasetData(rawData: any[]): AiDatasetData[] {
  return rawData.map((item) => {
    // Handle size in various formats (bytes, MB, GB, etc.)
    let size = item.size || item.file_size || item.dataset_size || null;
    if (typeof size === 'string') {
      // Try to extract numeric value from strings like "1.5 GB"
      const sizeMatch = size.match(/[\d.]+/);
      size = sizeMatch ? parseFloat(sizeMatch[0]) : null;
    }

    return {
      category: ScraperCategory.AI_DATASETS,
      timestamp: new Date(),
      sourceUrl: item.url || item.link || item.dataset_url || null,
      datasetId: item.id || item.dataset_id || item.identifier || 'unknown',
      name: item.name || item.title || item.dataset_name || 'Unknown Dataset',
      format:
        item.format ||
        item.file_format ||
        item.data_format ||
        item.extension ||
        null,
      size,
      license:
        item.license || item.license_type || item.license_name || null,
    };
  });
}

/**
 * Transform raw social media posts to SocialMediaData interface
 */
export function transformSocialMediaData(rawData: any[]): SocialMediaData[] {
  return rawData.map((item) => {
    // Handle engagement metrics (likes, shares, comments, etc.)
    const engagement =
      item.engagement ||
      item.likes ||
      item.like_count ||
      item.interactions ||
      (item.engagement_count ? parseInt(item.engagement_count) : null);

    return {
      category: ScraperCategory.SOCIAL_MEDIA,
      timestamp: new Date(),
      sourceUrl: item.url || item.post_url || item.link || null,
      postId: item.id || item.post_id || item.tweet_id || 'unknown',
      content:
        item.content || item.text || item.body || item.message || 'No content',
      author:
        item.author ||
        item.username ||
        item.user ||
        item.author_name ||
        null,
      engagement,
      url: item.url || item.post_url || item.link || null,
    };
  });
}
