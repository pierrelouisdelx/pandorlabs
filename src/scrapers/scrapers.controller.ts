import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  CreateScraperConfigDto,
  UpdateScraperConfigDto,
  QueryScraperConfigDto,
  QueryExecutionDto,
  ExecuteScraperDto,
  ScraperConfigResponseDto,
  ExecutionResponseDto,
  PaginatedResponseDto,
} from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('scrapers')
@UseInterceptors(ClassSerializerInterceptor)
export class ScrapersController {
  constructor(private readonly scrapersService: ScrapersService) {}

  @Post('configs')
  @HttpCode(HttpStatus.CREATED)
  async createConfig(
    @Body() dto: CreateScraperConfigDto,
  ): Promise<ScraperConfigResponseDto> {
    return this.scrapersService.createConfig(dto);
  }

  @Get('configs')
  async findAllConfigs(
    @Query() query: QueryScraperConfigDto,
  ): Promise<PaginatedResponseDto<ScraperConfigResponseDto>> {
    return this.scrapersService.findAllConfigs(query);
  }

  @Get('configs/:id')
  async findConfigById(
    @Param('id') id: string,
  ): Promise<ScraperConfigResponseDto> {
    return this.scrapersService.findConfigById(id);
  }

  @Put('configs/:id')
  async updateConfig(
    @Param('id') id: string,
    @Body() dto: UpdateScraperConfigDto,
  ): Promise<ScraperConfigResponseDto> {
    return this.scrapersService.updateConfig(id, dto);
  }

  @Delete('configs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfig(@Param('id') id: string): Promise<void> {
    return this.scrapersService.deleteConfig(id);
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
