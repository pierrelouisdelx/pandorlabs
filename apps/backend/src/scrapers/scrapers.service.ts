import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, QueryFilter, SortOrder } from 'mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CategoryOrchestrator } from './category-orchestrator';
import {
  ExecuteScraperDto,
  ExecutionResponseDto,
  PaginatedResponseDto,
  QueryExecutionDto,
  QueryScraperDto,
  ScraperResponseDto,
} from './dto';
import { ScraperStatus } from './enums';
import {
  ScraperConfigDocument,
  ScraperConfigEntity,
  ScraperExecutionDocument,
  ScraperExecutionEntity,
} from './schemas';
import {
  ScraperRequest,
  ScraperRequestDocument,
  ScraperRequestStatus,
} from './schemas/scraper-request.schema';

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(
    @InjectModel(ScraperConfigEntity.name)
    private readonly configModel: Model<ScraperConfigDocument>,

    @InjectModel(ScraperExecutionEntity.name)
    private readonly executionModel: Model<ScraperExecutionDocument>,

    @InjectModel(ScraperRequest.name)
    private readonly scraperRequestModel: Model<ScraperRequestDocument>,

    @InjectConnection()
    private readonly connection: Connection,

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
      const scraper = await this.categoryOrchestrator.getScraper(
        config.scraperId,
      );
      const result = await scraper.execute();

      // Persist the run metadata (per-scraper stats: linksFound, itemsFailed,
      // fetchErrors, …) regardless of outcome, so partial failures are visible
      // on the execution row even when the run is ultimately marked FAILED.
      if (result?.metadata && typeof result.metadata === 'object') {
        execution.metadata = result.metadata as Record<string, any>;
      }

      // `execute()` resolves even when the scrape itself failed — it reports
      // that in `success`, so a rejected promise is not the only failure path.
      // `error` comes back as a bare string from BaseScraper.
      if (result?.success === false) {
        throw new Error(toErrorMessage(result.error));
      }

      execution.status = ScraperStatus.COMPLETED;
      execution.completedAt = new Date();
      execution.durationMs =
        execution.completedAt.getTime() - execution.startedAt!.getTime();
      execution.itemsScraped = result?.metadata?.itemsScraped ?? 0;
    } catch (error) {
      // Persist the failure before surfacing it: an execution row that stays
      // RUNNING forever is indistinguishable from one still in flight.
      execution.status = ScraperStatus.FAILED;
      execution.completedAt = new Date();
      execution.durationMs =
        execution.completedAt.getTime() - execution.startedAt!.getTime();
      execution.error = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      await execution.save();

      this.logger.error(
        `Execution ${execution._id.toString()} failed: ${execution.error.message}`,
      );
      throw new InternalServerErrorException('Failed to execute scraper');
    }

    config.lastExecutedAt = execution.completedAt;
    config.executionCount += 1;
    await Promise.all([execution.save(), config.save()]);

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

  /**
   * The rows a single execution produced.
   *
   * Scraped rows do not carry the execution that wrote them — `saveScrapedData`
   * bulk-inserts them into the scraper's own collection, stamping only
   * `created_at`. So an execution's rows are the ones written inside its
   * window. A run still in flight has no `completedAt` yet, hence the open
   * upper bound.
   */
  async getExecutionData(
    executionId: string,
    query: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const execution = await this.executionModel.findById(executionId).lean();
    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    const config = await this.configModel.findById(execution.configId).lean();
    if (!config?.collectionName) {
      throw new NotFoundException(
        `No data collection for execution ${executionId}`,
      );
    }

    const schema = await this.categoryOrchestrator.getSchemaOnly(
      execution.scraperId,
    );
    let model: Model<any>;
    try {
      model = this.connection.model(config.collectionName);
    } catch {
      // Force the collection name to prevent Mongoose auto-pluralization.
      model = this.connection.model(
        config.collectionName,
        schema,
        config.collectionName,
      );
    }

    // `startedAt` is written when the execution row is created, so it is always
    // present; the guard is only here to keep the filter well-formed.
    const filter: QueryFilter<any> = execution.startedAt
      ? {
          created_at: {
            $gte: execution.startedAt,
            ...(execution.completedAt ? { $lte: execution.completedAt } : {}),
          },
        }
      : {};

    const [data, total] = await Promise.all([
      model
        .find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      model.countDocuments(filter),
    ]);

    return {
      data,
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

  /**
   * Query scraped data from dynamic collection using filters
   * @param scraperId - The scraper ID
   * @param filters - Optional MongoDB query filters
   * @param pagination - Pagination options (default: page=1, limit=5)
   */
  async queryScrapedData(
    scraperId: string,
    filters?: Record<string, any>,
    pagination?: { page?: number; limit?: number },
  ): Promise<{
    success: boolean;
    data?: any[];
    count?: number;
    pagination?: any;
    message?: string;
  }> {
    try {
      // 1. Get scraper config for collectionName
      const config = await this.configModel.findOne({ scraperId }).lean();
      if (!config) {
        return {
          success: false,
          message: `Scraper config not found for: ${scraperId}`,
        };
      }

      // 2. Get schema via CategoryOrchestrator
      const schema = await this.categoryOrchestrator.getSchemaOnly(scraperId);

      // 3. Get/create model for dynamic collection
      const collectionName = config.collectionName;
      let model: Model<any>;
      try {
        model = this.connection.model(collectionName);
      } catch {
        // Force collection name to prevent Mongoose auto-pluralization
        model = this.connection.model(collectionName, schema, collectionName);
      }

      this.logger.log(`Collection: ${collectionName}`);

      // 4. Build query
      const query = filters ? { data: { $elemMatch: filters } } : {};

      this.logger.log(`Query: ${JSON.stringify(query)}`);

      // 5. Apply pagination (default: page=1, limit=5, max=100)
      const page = pagination?.page || 1;
      const limit = Math.min(pagination?.limit || 5, 100);
      const skip = (page - 1) * limit;

      // 6. Execute query with proper filter application
      const [documents, totalDocs] = await Promise.all([
        model.find(query).limit(limit).skip(skip).lean(),
        model.countDocuments(query),
      ]);

      this.logger.log(`Found ${documents.length} documents`);

      // 7. Return results (documents are already the scraped data, no wrapper)
      if (documents.length === 0) {
        return {
          success: false,
          message: `No data available for scraper: ${scraperId}`,
        };
      }

      return {
        success: true,
        data: documents,
        count: documents.length,
        pagination: {
          page,
          limit,
          total: totalDocs,
          totalPages: Math.ceil(totalDocs / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to query scraped data for ${scraperId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
  ): QueryFilter<ScraperConfigDocument> {
    const filter: QueryFilter<ScraperConfigDocument> = {};

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
  ): QueryFilter<ScraperExecutionDocument> {
    const filter: QueryFilter<ScraperExecutionDocument> = {};

    if (query.configId) {
      (filter as { configId?: string }).configId = query.configId;
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

  /**
   * Create a new scraper build request
   * Used when a user needs a scraper that doesn't exist yet
   */
  async createScraperRequest(data: {
    targetUrl: string;
    category: string;
    dataPoints: string[];
    scraperName: string;
    requestedBy?: string;
  }): Promise<any> {
    try {
      this.logger.log(
        `Creating scraper request for: ${data.scraperName} (${data.targetUrl})`,
      );

      const request = await this.scraperRequestModel.create({
        targetUrl: data.targetUrl,
        category: data.category,
        dataPoints: data.dataPoints,
        scraperName: data.scraperName,
        requestedBy: data.requestedBy || 'ai-agent',
        status: ScraperRequestStatus.PENDING,
      });

      const requestId = request._id as any;
      this.logger.log(`Scraper request created with ID: ${requestId}`);

      return {
        id: requestId.toString(),
        targetUrl: request.targetUrl,
        category: request.category,
        dataPoints: request.dataPoints,
        scraperName: request.scraperName,
        status: request.status,
        createdAt: request.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to create scraper request', error);
      throw new InternalServerErrorException(
        'Failed to create scraper build request',
      );
    }
  }

  /**
   * Get all pending scraper requests for admin review
   */
  async getPendingScraperRequests(): Promise<any[]> {
    try {
      const requests = await this.scraperRequestModel
        .find({ status: ScraperRequestStatus.PENDING })
        .sort({ createdAt: -1 })
        .exec();

      return requests.map((req) => {
        const reqId = req._id as any;
        return {
          id: reqId.toString(),
          targetUrl: req.targetUrl,
          category: req.category,
          dataPoints: req.dataPoints,
          scraperName: req.scraperName,
          status: req.status,
          requestedBy: req.requestedBy,
          createdAt: req.createdAt,
        };
      });
    } catch (error) {
      this.logger.error('Failed to get pending scraper requests', error);
      return [];
    }
  }
}

/**
 * `BaseScraper.execute()` reports a soft failure as `error: string`, but a
 * thrown error is an `Error`. Both end up on the execution row, so both have to
 * reduce to something the user can actually read.
 */
function toErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error) return error;
  if (error instanceof Error) return error.message;

  const message = (error as { message?: unknown })?.message;
  if (typeof message === 'string' && message) return message;

  return 'Scraper reported failure';
}
