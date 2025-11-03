import { Prop, Schema } from '@nestjs/mongoose';

/**
 * Base schema for scraped data entities
 * Each scraped item is stored as a separate document with timestamps
 * Scrapers should extend this schema and add their specific data fields
 */
@Schema({ timestamps: true })
export class ScrapedDataEntity {
  @Prop({ type: Date, default: Date.now })
  created_at!: Date;

  @Prop({ type: Date, default: Date.now, index: true })
  updated_at!: Date;

  // Note: Scrapers extending this schema should add their specific data fields
  // This base class provides timestamp management for all scraped data
}
