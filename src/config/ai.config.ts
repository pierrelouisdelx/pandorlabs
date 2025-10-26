import { registerAs } from '@nestjs/config';

/**
 * AI Services Configuration
 * Manages configuration for multiple AI providers (Anthropic, OpenAI)
 */
export default registerAs('ai', () => ({
  // Anthropic (Claude) Configuration - Primary Provider
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
    timeoutMs: parseInt(process.env.ANTHROPIC_TIMEOUT_MS || '60000', 10),
    enabled: !!process.env.ANTHROPIC_API_KEY,
  },

  // OpenAI Configuration - Optional Secondary Provider
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
    timeoutMs: parseInt(process.env.OPENAI_TIMEOUT_MS || '60000', 10),
    enabled: !!process.env.OPENAI_API_KEY,
  },

  // Default Provider Configuration
  defaultProvider: 'anthropic',

  // Retry Configuration
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
    maxBackoffMs: 10000,
  },

  // Cache Configuration
  cache: {
    enabled: true,
    ttlSeconds: 3600,
    maxSize: 100,
  },
}));
