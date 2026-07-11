import { IsOptional, IsEnum, IsMongoId, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ScraperStatus } from '../enums';

export class QueryExecutionDto extends PaginationDto {
  @IsOptional()
  @IsMongoId()
  configId?: string;

  @IsOptional()
  @IsEnum(ScraperStatus)
  status?: ScraperStatus;

  @IsOptional()
  @IsString()
  scraperId?: string;
}
