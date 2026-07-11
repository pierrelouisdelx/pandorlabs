import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ScrapersService } from './scrapers.service';
import {
  QueryScraperDto,
  QueryExecutionDto,
  ExecuteScraperDto,
  ScraperResponseDto,
  ExecutionResponseDto,
  PaginatedResponseDto,
} from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('scrapers')
@UseInterceptors(ClassSerializerInterceptor)
export class ScrapersController {
  constructor(private readonly scrapersService: ScrapersService) {}

  @Get('all')
  async findAll(
    @Query() query: QueryScraperDto,
  ): Promise<PaginatedResponseDto<ScraperResponseDto>> {
    return this.scrapersService.findAll(query);
  }

  @Get('configs/:id')
  async findById(@Param('id') id: string): Promise<ScraperResponseDto> {
    return this.scrapersService.findById(id);
  }

  @Post('execute')
  @HttpCode(HttpStatus.ACCEPTED)
  async executeScraper(
    @Body() dto: ExecuteScraperDto,
  ): Promise<ExecutionResponseDto> {
    return this.scrapersService.executeScraper(dto);
  }

  @Get('executions')
  async findAllExecutions(
    @Query() query: QueryExecutionDto,
  ): Promise<PaginatedResponseDto<ExecutionResponseDto>> {
    return this.scrapersService.findAllExecutions(query);
  }

  @Get('executions/:id')
  async findExecutionById(
    @Param('id') id: string,
  ): Promise<ExecutionResponseDto> {
    return this.scrapersService.findExecutionById(id);
  }

  @Get('executions/:id/data')
  async getExecutionData(
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.scrapersService.getExecutionData(id, query);
  }

  @Get('supported')
  getSupportedScrapers() {
    return this.scrapersService.getAllSupportedScrapers();
  }

  @Get('cache/stats')
  getCacheStats() {
    return this.scrapersService.getCacheStats();
  }

  @Post('cache/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCache() {
    this.scrapersService.clearCache();
  }
}
