import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AiQueryService } from './ai-query.service';
import { AnalyzeQueryDto } from './dto/analyze-query.dto';
import { AnalysisResultDto } from './dto/analysis-result.dto';

@Controller('ai-query')
export class AiQueryController {
  constructor(private readonly aiQueryService: AiQueryService) {}

  /**
   * Analyze user query and return scraper plan
   * POST /ai-query/analyze
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeQuery(
    @Body() analyzeQueryDto: AnalyzeQueryDto,
  ): Promise<AnalysisResultDto> {
    return await this.aiQueryService.analyzeQuery(analyzeQueryDto);
  }
}
