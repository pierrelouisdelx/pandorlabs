import { ScraperCategory } from '@scrapers/enums/scraper-category.enum';

/**
 * Base interface for all category-specific scraper data
 */
export interface BaseScraperData {
  category: ScraperCategory;
  timestamp: Date;
  sourceUrl?: string;
}

/**
 * Real Estate category data - Core essentials for frontend display
 */
export interface RealEstateData extends BaseScraperData {
  category: ScraperCategory.REAL_ESTATE;
  listingId: string;
  images: string[];
  address: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  propertyType: string | null;
  listingUrl: string | null;
}

/**
 * Shopping category data - Placeholder for future implementation
 */
export interface ShoppingData extends BaseScraperData {
  category: ScraperCategory.SHOPPING;
  productId: string;
  name: string;
  price: number | null;
  image: string | null;
  url: string | null;
}

/**
 * Crypto category data - Placeholder for future implementation
 */
export interface CryptoData extends BaseScraperData {
  category: ScraperCategory.CRYPTO;
  tokenId: string;
  symbol: string;
  name: string;
  price: number | null;
  marketCap: number | null;
}

/**
 * Lead Generation category data - Placeholder for future implementation
 */
export interface LeadGenerationData extends BaseScraperData {
  category: ScraperCategory.LEAD_GENERATION;
  contactId: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
}

/**
 * AI Datasets category data - Placeholder for future implementation
 */
export interface AiDatasetData extends BaseScraperData {
  category: ScraperCategory.AI_DATASETS;
  datasetId: string;
  name: string;
  format: string | null;
  size: number | null;
  license: string | null;
}

/**
 * Social Media category data - Placeholder for future implementation
 */
export interface SocialMediaData extends BaseScraperData {
  category: ScraperCategory.SOCIAL_MEDIA;
  postId: string;
  content: string;
  author: string | null;
  engagement: number | null;
  url: string | null;
}

/**
 * Discriminated union of all category data types for type-safe handling
 */
export type CategoryData =
  | RealEstateData
  | ShoppingData
  | CryptoData
  | LeadGenerationData
  | AiDatasetData
  | SocialMediaData;
