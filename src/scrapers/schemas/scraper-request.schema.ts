import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScraperRequestDocument = ScraperRequest & Document;

export enum ScraperRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Scraper Build Request Schema
 * Tracks requests to build new scrapers when user needs data sources not yet supported
 */
@Schema({ timestamps: true })
export class ScraperRequest {
  @Prop({ required: true })
  targetUrl!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ type: [String], required: true })
  dataPoints!: string[];

  @Prop({ required: true })
  scraperName!: string;

  @Prop({
    type: String,
    enum: Object.values(ScraperRequestStatus),
    default: ScraperRequestStatus.PENDING,
  })
  status!: ScraperRequestStatus;

  @Prop()
  requestedBy?: string;

  @Prop()
  notes?: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  completedAt?: Date;

  // Timestamps (provided by  @Schema({ timestamps: true }))
  createdAt!: Date;
  updatedAt!: Date;
}

export const ScraperRequestSchema =
  SchemaFactory.createForClass(ScraperRequest);
