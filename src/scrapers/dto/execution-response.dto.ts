import { ScraperStatus } from '../enums';

export class ExecutionResponseDto {
  id!: string;
  configId!: string;
  scraperId!: string;
  status!: ScraperStatus;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  itemsScraped!: number;
  error?: {
    message: string;
    code?: string;
  };
  createdAt!: Date;
}
