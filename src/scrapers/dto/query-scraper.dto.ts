import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ScraperCategory } from '../enums';

export class QueryScraperDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ScraperCategory)
  category?: ScraperCategory;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  tags?: string[];
}
