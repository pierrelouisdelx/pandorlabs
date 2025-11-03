import { ChatAnthropic } from '@langchain/anthropic';
import { StructuredToolInterface } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  maxTokens: number;
  timeoutMs: number;
  apiKey: string;
  streaming?: boolean;
}

/**
 * LLM Provider Service
 * Manages multiple LLM providers (OpenAI, Anthropic) with unified interface
 */
@Injectable()
export class LLMProviderService {
  private readonly logger = new Logger(LLMProviderService.name);
  private models: Map<LLMProvider, ChatAnthropic | ChatOpenAI> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeProviders();
  }

  /**
   * Initialize all available LLM providers
   */
  private initializeProviders(): void {
    this.logger.log('Initializing LLM providers...');

    // Initialize Anthropic if enabled
    const anthropicEnabled = this.configService.get<boolean>(
      'ai.anthropic.enabled',
    );
    if (anthropicEnabled) {
      try {
        const anthropicModel = new ChatAnthropic({
          apiKey: this.configService.get<string>('ai.anthropic.apiKey'),
          model: this.configService.get<string>('ai.anthropic.model'),
          maxTokens: this.configService.get<number>('ai.anthropic.maxTokens'),
          temperature: 0.7,
        });
        this.models.set('anthropic', anthropicModel);
        this.logger.log('✓ Anthropic provider initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Anthropic provider', error);
      }
    }

    // Initialize OpenAI if enabled
    const openaiEnabled = this.configService.get<boolean>('ai.openai.enabled');
    if (openaiEnabled) {
      try {
        const openaiModel = new ChatOpenAI({
          apiKey: this.configService.get<string>('ai.openai.apiKey'),
          model: this.configService.get<string>('ai.openai.model'),
          maxTokens: this.configService.get<number>('ai.openai.maxTokens'),
          timeout: this.configService.get<number>('ai.openai.timeoutMs'),
        });
        this.models.set('openai', openaiModel);
        this.logger.log('✓ OpenAI provider initialized');
      } catch (error) {
        this.logger.error('Failed to initialize OpenAI provider', error);
      }
    }

    if (this.models.size === 0) {
      this.logger.warn(
        'No LLM providers are enabled. Check your configuration.',
      );
    }
  }

  /**
   * Get a model instance for the specified provider
   */
  getModel(provider?: LLMProvider): ChatAnthropic | ChatOpenAI {
    const targetProvider = provider || this.getDefaultProvider();

    if (!this.models.has(targetProvider)) {
      throw new Error(
        `LLM provider '${targetProvider}' is not available. Available providers: ${Array.from(this.models.keys()).join(', ')}`,
      );
    }

    return this.models.get(targetProvider)!;
  }

  /**
   * Get model with tools bound for agentic behavior
   */
  getModelWithTools(tools: StructuredToolInterface[], provider?: LLMProvider) {
    const model = this.getModel(provider);
    return model.bindTools(tools);
  }

  /**
   * Get the default provider from configuration
   */
  private getDefaultProvider(): LLMProvider {
    const defaultProvider =
      this.configService.get<string>('ai.defaultProvider');

    if (defaultProvider && this.models.has(defaultProvider as LLMProvider)) {
      return defaultProvider as LLMProvider;
    }

    // Fallback to first available provider
    const availableProviders = Array.from(this.models.keys());
    if (availableProviders.length > 0) {
      this.logger.warn(
        `Default provider not available, using fallback: ${availableProviders[0]}`,
      );
      return availableProviders[0];
    }

    throw new Error('No LLM providers are available');
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.models.keys());
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider: LLMProvider): boolean {
    return this.models.has(provider);
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: LLMProvider): LLMConfig {
    const targetProvider = provider || this.getDefaultProvider();

    if (targetProvider === 'anthropic') {
      return {
        provider: 'anthropic',
        model: this.configService.get<string>('ai.anthropic.model')!,
        maxTokens: this.configService.get<number>('ai.anthropic.maxTokens')!,
        timeoutMs: this.configService.get<number>('ai.anthropic.timeoutMs')!,
        apiKey: this.configService.get<string>('ai.anthropic.apiKey')!,
        streaming: this.configService.get<boolean>(
          'ai.agentic.streamingEnabled',
        ),
      };
    }

    if (targetProvider === 'openai') {
      return {
        provider: 'openai',
        model: this.configService.get<string>('ai.openai.model')!,
        maxTokens: this.configService.get<number>('ai.openai.maxTokens')!,
        timeoutMs: this.configService.get<number>('ai.openai.timeoutMs')!,
        apiKey: this.configService.get<string>('ai.openai.apiKey')!,
        streaming: this.configService.get<boolean>(
          'ai.agentic.streamingEnabled',
        ),
      };
    }

    throw new Error(`Unknown provider: ${targetProvider}`);
  }

  /**
   * Test provider connectivity
   */
  async testProvider(provider: LLMProvider): Promise<boolean> {
    try {
      const model = this.getModel(provider);
      const response = await model.invoke([
        { role: 'user', content: 'Hello, this is a test.' },
      ]);
      return !!response;
    } catch (error) {
      this.logger.error(`Provider test failed for ${provider}:`, error);
      return false;
    }
  }
}
