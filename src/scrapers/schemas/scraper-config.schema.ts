import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ScraperCategory } from '../enums';

export type ScraperConfigDocument = ScraperConfigEntity & Document;

@Schema({
  timestamps: true,
  collection: 'scraper_configurations',
})
export class ScraperConfigEntity {
  @Prop({ required: true, unique: true, index: true })
  scraperId!: string;

  @Prop({
    required: true,
    enum: Object.values(ScraperCategory),
    index: true,
  })
  category!: ScraperCategory;

  @Prop({ required: false })
  url?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  options!: Record<string, any>;

  @Prop({
    type: {
      name: String,
      description: String,
      createdBy: String,
      tags: [String],
    },
    default: {},
  })
  metadata!: {
    name?: string;
    description?: string;
    createdBy?: string;
    tags?: string[];
  };

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date })
  lastExecutedAt?: Date;

  @Prop({ default: 0 })
  executionCount!: number;

  @Prop()
  collectionName!: string;
}

export const ScraperConfigSchema =
  SchemaFactory.createForClass(ScraperConfigEntity);

// Indexes for efficient querying
ScraperConfigSchema.index({ category: 1, isActive: 1 });
ScraperConfigSchema.index({ 'metadata.tags': 1 });
ScraperConfigSchema.index({ lastExecutedAt: -1 });
