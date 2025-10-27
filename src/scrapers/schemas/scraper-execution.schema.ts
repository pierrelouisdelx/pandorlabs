import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ScraperStatus } from '../enums';

export type ScraperExecutionDocument = ScraperExecutionEntity & Document;

@Schema({ timestamps: true, collection: 'scraper_executions' })
export class ScraperExecutionEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'ScraperConfigEntity',
    index: true,
  })
  configId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  scraperId!: string;

  @Prop({
    required: true,
    enum: Object.values(ScraperStatus),
    default: ScraperStatus.IDLE,
    index: true,
  })
  status!: ScraperStatus;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop()
  durationMs?: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  result?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };

  @Prop({ default: 0 })
  itemsScraped!: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, any>;
}

export const ScraperExecutionSchema = SchemaFactory.createForClass(
  ScraperExecutionEntity,
);

ScraperExecutionSchema.index({ scraperId: 1, createdAt: -1 });
ScraperExecutionSchema.index({ status: 1, createdAt: -1 });
ScraperExecutionSchema.index({ configId: 1, status: 1 });
