import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import {
  ScraperConfigEntity,
  ScraperConfigDocument,
  ScraperExecutionEntity,
  ScraperExecutionDocument,
  ScrapedDataEntity,
  ScrapedDataDocument,
} from './schemas';
import { CategoryOrchestrator } from './category-orchestrator';
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
import { ScraperStatus } from './enums';

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(
    @InjectModel(ScraperConfigEntity.name)
    private readonly configModel: Model<ScraperConfigDocument>,

    @InjectModel(ScraperExecutionEntity.name)
    private readonly executionModel: Model<ScraperExecutionDocument>,

    @InjectModel(ScrapedDataEntity.name)
    private readonly dataModel: Model<ScrapedDataDocument>,

    private readonly categoryOrchestrator: CategoryOrchestrator,
  ) {
    this.logger.log('ScrapersService initialized');
  }

  // CRUD Operations for Configurations

  async createConfig(
    dto: CreateScraperConfigDto,
  ): Promise<ScraperConfigResponseDto> {
    this.logger.log(`Creating scraper config: ${dto.scraperId}`);

    const existing = await this.configModel.findOne({
      scraperId: dto.scraperId,
    });
    if (existing) {
      throw new ConflictException(
        `Scraper with ID ${dto.scraperId} already exists`,
      );
    }

    const config = new this.configModel(dto);
    await config.save();

    return this.toConfigResponse(config);
  }

  async findAllConfigs(
    query: QueryScraperConfigDto,
  ): Promise<PaginatedResponseDto<ScraperConfigResponseDto>> {
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

  async findConfigById(id: string): Promise<ScraperConfigResponseDto> {
    const config = await this.configModel.findById(id).lean();
    if (!config) {
      throw new NotFoundException(`Scraper config ${id} not found`);
    }
    return this.toConfigResponse(config);
  }

  async findConfigByScraperId(
    scraperId: string,
  ): Promise<ScraperConfigResponseDto> {
    const config = await this.configModel.findOne({ scraperId }).lean();
    if (!config) {
      throw new NotFoundException(
        `Scraper config with scraperId ${scraperId} not found`,
      );
    }
    return this.toConfigResponse(config);
  }

  async updateConfig(
    id: string,
    dto: UpdateScraperConfigDto,
  ): Promise<ScraperConfigResponseDto> {
    this.logger.log(`Updating scraper config: ${id}`);

    const config = await this.configModel.findById(id);
    if (!config) {
      throw new NotFoundException(`Scraper config ${id} not found`);
    }

    Object.assign(config, dto);
    await config.save();

    return this.toConfigResponse(config);
  }

  async deleteConfig(id: string): Promise<void> {
    this.logger.log(`Deleting scraper config: ${id}`);

    const result = await this.configModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Scraper config ${id} not found`);
    }

    const executionIds = await this.getExecutionIds(id);
    await Promise.all([
      this.executionModel.deleteMany({ configId: id }),
      this.dataModel.deleteMany({
        executionId: { $in: executionIds },
      }),
    ]);

    this.logger.log(`Deleted config ${id} and associated data`);
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

      const scraper =
        await this.categoryOrchestrator.createScraper(scraperConfig);
      const result = await scraper.execute();

      execution.status = ScraperStatus.COMPLETED;
      execution.completedAt = new Date();
      execution.durationMs =
        execution.completedAt.getTime() - execution.startedAt!.getTime();
      execution.result = result;
      execution.itemsScraped = Array.isArray(result.data)
        ? result.data.length
        : 0;

      if (result.data && Array.isArray(result.data)) {
        await this.storeScrapedData(execution, config, result.data);
      }

      config.lastExecutedAt = new Date();
      config.executionCount += 1;
      await config.save();
    } catch (error) {
      execution.status = ScraperStatus.FAILED;
      execution.completedAt = new Date();
      execution.durationMs =
        execution.completedAt.getTime() - execution.startedAt!.getTime();

      const errorObj = error as Error & { code?: string };
      execution.error = {
        message: errorObj.message || 'Unknown error',
        stack: errorObj.stack,
        code: errorObj.code,
      };
      this.logger.error(
        `Scraper execution failed: ${errorObj.message}`,
        errorObj.stack,
      );
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
      this.dataModel.find({ executionId }).skip(skip).limit(limit).lean(),
      this.dataModel.countDocuments({ executionId }),
    ]);

    return {
      data: data.map((item) => item.data),
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

  // Helper methods

  private buildConfigFilter(
    query: QueryScraperConfigDto,
  ): FilterQuery<ScraperConfigDocument> {
    const filter: FilterQuery<ScraperConfigDocument> = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }

    if (query.search) {
      filter.$or = [
        { scraperId: { $regex: query.search, $options: 'i' } },
        { 'metadata.name': { $regex: query.search, $options: 'i' } },
        { 'metadata.description': { $regex: query.search, $options: 'i' } },
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

  private async storeScrapedData(
    execution: ScraperExecutionDocument,
    config: ScraperConfigDocument,
    data: any[],
  ): Promise<void> {
    const documents = data.map((item) => ({
      executionId: execution._id,
      scraperId: config.scraperId,
      category: config.category,
      data: item,
      sourceUrl: config.url,
      scrapedAt: new Date(),
    }));

    await this.dataModel.insertMany(documents);
    this.logger.log(
      `Stored ${documents.length} scraped items for execution ${execution._id}`,
    );
  }

  private async getExecutionIds(configId: string): Promise<string[]> {
    const executions = await this.executionModel
      .find({ configId })
      .select('_id')
      .lean();
    return executions.map((e) => e._id.toString());
  }

  private toConfigResponse(config: any): ScraperConfigResponseDto {
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
