import { ScraperCategory } from '../enums';

export class ScraperResponseDto {
  id!: string;
  scraperId!: string;
  category!: ScraperCategory;
  url?: string;
  options!: Record<string, any>;
  metadata!: {
    name?: string;
    description?: string;
    createdBy?: string;
    tags?: string[];
  };
  isActive!: boolean;
  lastExecutedAt?: Date;
  executionCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
