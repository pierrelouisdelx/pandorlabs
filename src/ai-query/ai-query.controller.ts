import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AiQueryService } from './ai-query.service';
import { AgenticResultDto, ProcessQueryDto } from './dto';

@Controller('ai-query')
export class AiQueryController {
  constructor(private readonly aiQueryService: AiQueryService) {}

  /**
   * Process user query and return scraper plan
   * POST /ai-query/process
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processQuery(
    @Body() processQueryDto: ProcessQueryDto,
  ): Promise<AgenticResultDto> {
    return await this.aiQueryService.processQuery(processQueryDto.query);
  }
}
