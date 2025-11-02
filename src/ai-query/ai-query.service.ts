import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredToolInterface } from '@langchain/core/tools';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

import { AnalysisResultDto } from './dto/analysis-result.dto';
import { AnalyzeQueryDto } from './dto/analyze-query.dto';
import { AgenticResultDto } from './dto/agentic-result.dto';

import { CategoryOrchestrator } from '@scrapers/category-orchestrator';
import { ScrapersService } from '@scrapers/scrapers.service';
import { LLMProviderService, LLMProvider } from './providers/llm-provider.service';
import { createScraperTools } from '@scrapers/ai-tools/scraper-tools';

@Injectable()
export class AiQueryService {
  private readonly logger = new Logger(AiQueryService.name);
  private readonly tools: StructuredToolInterface[];
  private readonly systemPrompt: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly llmProviderService: LLMProviderService,
    private readonly scrapersService: ScrapersService,
    private readonly categoryOrchestrator: CategoryOrchestrator,
  ) {
    // Initialize scraper tools
    this.tools = createScraperTools(
      this.categoryOrchestrator,
      this.scrapersService,
    );

    // Get system prompt from config
    this.systemPrompt =
      this.configService.get<string>('ai.agentic.systemPrompt') || '';

    this.logger.log(`Initialized with ${this.tools.length} tools`);
  }

  /**
   * Process user query using agentic workflow with tools
   */
  async processQuery(
    query: string,
    provider?: LLMProvider,
  ): Promise<AgenticResultDto> {
    const startTime = Date.now();
    const conversationHistory: AgenticResultDto['conversationHistory'] = [];
    const toolExecutions: AgenticResultDto['toolExecutions'] = [];

    try {
      this.logger.log(`Processing query: ${query}`);

      // Get LLM model and bind tools
      const model = this.llmProviderService.getModel(provider);
      const providerConfig = this.llmProviderService.getProviderConfig(
        provider || this.llmProviderService.getAvailableProviders()[0],
      );
      const modelWithTools = model.bindTools(this.tools);

      // Initialize messages with system prompt and user query
      const messages: any[] = [
        new HumanMessage(
          `${this.systemPrompt}\n\nUser query: ${query}`,
        ),
      ];

      let iterations = 0;
      const maxIterations = 5;
      let finalResponse = '';

      // Agentic loop - execute tools until completion
      while (iterations < maxIterations) {
        iterations++;
        this.logger.log(`Iteration ${iterations}/${maxIterations}`);

        // Invoke model with current messages
        const response = await modelWithTools.invoke(messages);
        messages.push(response);

        // Check if there are tool calls
        if (!response.tool_calls || response.tool_calls.length === 0) {
          // No more tool calls - we have the final answer
          finalResponse =
            typeof response.content === 'string'
              ? response.content
              : JSON.stringify(response.content);
          this.logger.log('Agent completed without tool calls');
          break;
        }

        // Execute each tool call
        for (const toolCall of response.tool_calls) {
          this.logger.log(`Executing tool: ${toolCall.name}`);

          try {
            // Find the matching tool
            const tool = this.tools.find((t) => t.name === toolCall.name);
            if (!tool) {
              throw new Error(`Tool not found: ${toolCall.name}`);
            }

            // Execute the tool
            const toolResult = await tool.invoke(toolCall.args);

            // Track the tool execution
            toolExecutions.push({
              toolCallId: toolCall.id || `tool-${toolExecutions.length + 1}`,
              toolName: toolCall.name,
              result:
                typeof toolResult === 'string'
                  ? toolResult
                  : JSON.stringify(toolResult),
            });

            // Add tool result to messages
            messages.push(
              new AIMessage({
                content: '',
                tool_calls: [toolCall],
              }),
            );
            messages.push(
              new HumanMessage({
                content: toolResult,
                name: toolCall.name,
              }),
            );

            this.logger.log(`Tool ${toolCall.name} completed successfully`);
          } catch (toolError) {
            const errorMsg =
              toolError instanceof Error
                ? toolError.message
                : 'Unknown tool error';
            this.logger.error(`Tool execution failed: ${errorMsg}`, toolError);

            // Add error as tool result
            messages.push(
              new HumanMessage({
                content: `Tool execution failed: ${errorMsg}`,
                name: toolCall.name,
              }),
            );
          }
        }

        // Check if we've reached max iterations
        if (iterations >= maxIterations) {
          this.logger.warn('Max iterations reached');
          finalResponse = 'Query processing reached maximum iterations';
          break;
        }
      }

      // Track final conversation
      conversationHistory.push({
        role: 'user',
        content: query,
      });

      conversationHistory.push({
        role: 'assistant',
        content: finalResponse,
      });

      const durationMs = Date.now() - startTime;

      this.logger.log(
        `Query processed successfully in ${durationMs}ms with ${toolExecutions.length} tool calls`,
      );

      return {
        success: true,
        result: finalResponse,
        metadata: {
          iterations,
          totalToolCalls: toolExecutions.length,
          durationMs,
          provider: providerConfig.provider,
          model: providerConfig.model,
        },
        conversationHistory,
        toolExecutions,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Query processing failed: ${errorMessage}`, error);

      return {
        success: false,
        result: '',
        metadata: {
          iterations: 0,
          totalToolCalls: toolExecutions.length,
          durationMs,
          provider: provider || 'unknown',
          model: 'unknown',
        },
        conversationHistory,
        toolExecutions,
        error: errorMessage,
      };
    }
  }

  /**
   * Analyze user query and extract scraping requirements
   * This is a placeholder implementation - replace with actual AI analysis
   */
  async analyzeQuery(dto: AnalyzeQueryDto): Promise<AnalysisResultDto> {
    const { query } = dto;

    this.logger.log(`Analyzing query: ${query}`);

    return {
      targets: [],
      dataPoints: [],
      estimatedTime: '',
      steps: [],
    };
  }
}
