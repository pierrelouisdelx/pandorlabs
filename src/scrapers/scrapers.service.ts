import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import {
  ScraperConfigEntity,
  ScraperConfigDocument,
  ScraperExecutionEntity,
  ScraperExecutionDocument,
} from './schemas';
import { CategoryOrchestrator } from './category-orchestrator';
import {
  QueryScraperDto,
  QueryExecutionDto,
  ExecuteScraperDto,
  ScraperResponseDto,
  ExecutionResponseDto,
  PaginatedResponseDto,
} from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ScraperStatus } from './enums';

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(
    @InjectModel(ScraperConfigEntity.name)
    private readonly configModel: Model<ScraperConfigDocument>,

    @InjectModel(ScraperExecutionEntity.name)
    private readonly executionModel: Model<ScraperExecutionDocument>,

    private readonly categoryOrchestrator: CategoryOrchestrator,
  ) {
    this.logger.log('ScrapersService initialized');
  }

  async findAll(
    query: QueryScraperDto,
  ): Promise<PaginatedResponseDto<ScraperResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const filter = this.buildConfigFilter(query);
    const skip = (page - 1) * limit;
    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortOrder === 'DESC' ? -1 : 1,
    };

    const [data, total] = await Promise.all([
      this.configModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.configModel.countDocuments(filter),
    ]);

    return {
      data: data.map((config) => this.toConfigResponse(config)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(scraperId: string): Promise<ScraperResponseDto> {
    const config = await this.configModel.findOne({ scraperId }).lean();
    if (!config) {
      throw new NotFoundException(
        `Scraper config with scraperId ${scraperId} not found`,
      );
    }
    return this.toConfigResponse(config);
  }

  // Execution Operations
  async executeScraper(dto: ExecuteScraperDto): Promise<ExecutionResponseDto> {
    this.logger.log(`Executing scraper for config: ${dto.configId}`);

    const config = await this.configModel.findById(dto.configId);
    if (!config) {
      throw new NotFoundException(`Config ${dto.configId} not found`);
    }

    if (!config.isActive) {
      throw new BadRequestException(`Config ${dto.configId} is inactive`);
    }

    const execution = new this.executionModel({
      configId: config._id,
      scraperId: config.scraperId,
      status: ScraperStatus.RUNNING,
      startedAt: new Date(),
    });
    await execution.save();

    try {
      const scraperConfig = {
        scraperId: config.scraperId,
        category: config.category,
        url: config.url,
        options: { ...config.options, ...dto.overrideOptions },
        metadata: config.metadata,
      };

      const scraper = await this.categoryOrchestrator.getScraper(
        scraperConfig.scraperId,
      );
      await scraper.execute();
    } catch (error) {
      throw new InternalServerErrorException('Failed to execute scraper');
    }

    await execution.save();
    return this.toExecutionResponse(execution);
  }

  async findAllExecutions(
    query: QueryExecutionDto,
  ): Promise<PaginatedResponseDto<ExecutionResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const filter = this.buildExecutionFilter(query);
    const skip = (page - 1) * limit;
    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortOrder === 'DESC' ? -1 : 1,
    };

    const [data, total] = await Promise.all([
      this.executionModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.executionModel.countDocuments(filter),
    ]);

    return {
      data: data.map((exec) => this.toExecutionResponse(exec)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findExecutionById(id: string): Promise<ExecutionResponseDto> {
    const execution = await this.executionModel.findById(id).lean();
    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }
    return this.toExecutionResponse(execution);
  }

  async getExecutionData(
    executionId: string,
    query: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.executionModel.find({ executionId }).skip(skip).limit(limit).lean(),
      this.executionModel.countDocuments({ executionId }),
    ]);

    return {
      data: data.map((item) => item.result),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // Retrive scraper data from the database
  async getScraperData(scraperId: string): Promise<any> {
    const execution = await this.executionModel.findOne({ scraperId }).lean();
    if (!execution) {
      throw new NotFoundException(
        `Execution with scraperId ${scraperId} not found`,
      );
    }
    return execution;
  }

  getAllSupportedScrapers(): Record<string, string[]> {
    const scrapers = this.categoryOrchestrator.getAllSupportedScrapers();
    const result: Record<string, string[]> = {};
    scrapers.forEach((scraperIds, category) => {
      result[category] = scraperIds;
    });
    return result;
  }

  getCacheStats() {
    return this.categoryOrchestrator.getCacheStats();
  }

  clearCache() {
    this.categoryOrchestrator.clearCache();
  }

  private buildConfigFilter(
    query: QueryScraperDto,
  ): FilterQuery<ScraperConfigDocument> {
    const filter: FilterQuery<ScraperConfigDocument> = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.search) {
      filter.$or = [
        { scraperId: { $regex: query.search, $options: 'i' } },
        { 'metadata.name': { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.tags && query.tags.length > 0) {
      filter['metadata.tags'] = { $in: query.tags };
    }

    return filter;
  }

  private buildExecutionFilter(
    query: QueryExecutionDto,
  ): FilterQuery<ScraperExecutionDocument> {
    const filter: FilterQuery<ScraperExecutionDocument> = {};

    if (query.configId) {
      filter.configId = query.configId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.scraperId) {
      filter.scraperId = query.scraperId;
    }

    return filter;
  }

  private toConfigResponse(config: any): ScraperResponseDto {
    return {
      id: config._id.toString(),
      scraperId: config.scraperId,
      category: config.category,
      url: config.url,
      options: config.options || {},
      metadata: config.metadata || {},
      isActive: config.isActive,
      lastExecutedAt: config.lastExecutedAt,
      executionCount: config.executionCount,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private toExecutionResponse(execution: any): ExecutionResponseDto {
    return {
      id: execution._id.toString(),
      configId: execution.configId.toString(),
      scraperId: execution.scraperId,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      durationMs: execution.durationMs,
      itemsScraped: execution.itemsScraped,
      error: execution.error
        ? {
            message: execution.error.message,
            code: execution.error.code,
          }
        : undefined,
      createdAt: execution.createdAt,
    };
  }
}
