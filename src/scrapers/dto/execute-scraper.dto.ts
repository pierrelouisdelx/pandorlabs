import { IsMongoId, IsOptional, IsObject } from 'class-validator';

export class ExecuteScraperDto {
  @IsMongoId()
  configId!: string;

  @IsOptional()
  @IsObject()
  overrideOptions?: Record<string, any>;
}
