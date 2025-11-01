import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class ScrapedDataEntity<T> {
  @Prop({ type: Date, default: Date.now })
  created_at!: Date;

  @Prop({ type: Date, default: Date.now, index: true })
  updated_at!: Date;

  @Prop({ required: true })
  data!: T[];
}
