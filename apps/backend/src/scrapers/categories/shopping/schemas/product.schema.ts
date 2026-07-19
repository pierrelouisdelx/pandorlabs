import { Schema as MongooseSchema } from 'mongoose';

/**
 * Shared Mongoose schema for scraped shopping products.
 *
 * Every site scraper stores into its own collection (per the storage decision)
 * but reuses this identical shape via `createProductSchema()`. Extends the
 * timestamp contract of `ScrapedDataEntity` (created_at/updated_at added by
 * `BaseScraper.saveScrapedData`).
 */
export function createProductSchema(): MongooseSchema {
  const imageSchema = new MongooseSchema(
    {
      url: { type: String, required: true },
      name: { type: String, default: '' },
      isMain: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    },
    { _id: false },
  );

  const schema = new MongooseSchema(
    {
      url: { type: String, required: true, index: true },
      name: { type: String, required: true },
      marketplace: { type: String, required: true, index: true },
      brand: { type: String, default: null },
      category: { type: String, default: null, index: true },
      subCategory: { type: String, default: null },
      subSubCategory: { type: String, default: null },
      description: { type: String, default: null },
      price: { type: Number, default: null },
      discountedPrice: { type: Number, default: null },
      currency: { type: String, default: 'USD' },
      images: { type: [imageSchema], default: [] },
      colors: { type: [String], default: [] },
      materials: { type: [String], default: [] },
    },
    { timestamps: true },
  );

  return schema;
}
