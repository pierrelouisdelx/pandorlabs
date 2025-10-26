import * as Joi from 'joi';

/**
 * Environment validation schema using Joi
 * Ensures all required environment variables are present and valid
 */
export const validationSchema = Joi.object({
  // ====================================
  // Application Configuration
  // ====================================
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development')
    .description('Application environment'),

  PORT: Joi.number().port().default(3001).description('Application port'),

  FRONTEND_URL: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .description('Frontend application URL'),

  // ====================================
  // Database Configuration
  // ====================================
  MONGODB_URI: Joi.string()
    .uri()
    .required()
    .description('MongoDB connection string'),

  MONGODB_MIN_POOL_SIZE: Joi.number()
    .integer()
    .min(1)
    .default(5)
    .description('Minimum MongoDB connection pool size'),

  MONGODB_MAX_POOL_SIZE: Joi.number()
    .integer()
    .min(1)
    .default(50)
    .description('Maximum MongoDB connection pool size'),

  MONGODB_SOCKET_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .default(45000)
    .description('MongoDB socket timeout in milliseconds'),

  MONGODB_SERVER_SELECTION_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .default(5000)
    .description('MongoDB server selection timeout in milliseconds'),

  MONGODB_RETRY_ATTEMPTS: Joi.number()
    .integer()
    .min(0)
    .default(3)
    .description('Number of MongoDB connection retry attempts'),

  MONGODB_RETRY_DELAY: Joi.number()
    .integer()
    .min(0)
    .default(2000)
    .description('Delay between MongoDB retry attempts in milliseconds'),

  // ====================================
  // AI Services Configuration
  // ====================================
  ANTHROPIC_API_KEY: Joi.string()
    .required()
    .description('Anthropic (Claude) API key'),

  ANTHROPIC_MODEL: Joi.string()
    .default('claude-3-5-sonnet-20241022')
    .description('Anthropic model to use'),

  ANTHROPIC_MAX_TOKENS: Joi.number()
    .integer()
    .min(1)
    .max(8192)
    .default(4096)
    .description('Maximum tokens for Anthropic API requests'),

  ANTHROPIC_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .default(60000)
    .description('Anthropic API request timeout in milliseconds'),

  OPENAI_API_KEY: Joi.string()
    .optional()
    .description('OpenAI API key (optional)'),

  OPENAI_MODEL: Joi.string()
    .default('gpt-4-turbo-preview')
    .description('OpenAI model to use'),

  OPENAI_MAX_TOKENS: Joi.number()
    .integer()
    .min(1)
    .max(128000)
    .default(4096)
    .description('Maximum tokens for OpenAI API requests'),

  OPENAI_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .default(60000)
    .description('OpenAI API request timeout in milliseconds'),

  // ====================================
  // Redis Configuration
  // ====================================
  REDIS_HOST: Joi.string()
    .default('localhost')
    .description('Redis server host'),

  REDIS_PORT: Joi.number()
    .port()
    .default(6379)
    .description('Redis server port'),

  REDIS_PASSWORD: Joi.string()
    .allow('')
    .optional()
    .description('Redis server password'),

  REDIS_DB: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .default(0)
    .description('Redis database number'),

  REDIS_TTL: Joi.number()
    .integer()
    .min(0)
    .default(3600)
    .description('Default cache TTL in seconds'),

  // ====================================
  // Authentication & Security
  // ====================================
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT signing secret (minimum 32 characters)'),

  JWT_EXPIRATION: Joi.string()
    .default('7d')
    .description('JWT access token expiration time'),

  JWT_REFRESH_EXPIRATION: Joi.string()
    .default('30d')
    .description('JWT refresh token expiration time'),

  // ====================================
  // Rate Limiting
  // ====================================
  RATE_LIMIT_TTL: Joi.number()
    .integer()
    .min(1)
    .default(60)
    .description('Rate limit time window in seconds'),

  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .min(1)
    .default(100)
    .description('Maximum requests per time window'),

  // ====================================
  // Logging
  // ====================================
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('debug')
    .description('Application log level'),

  LOG_FILE_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable file logging'),

  LOG_FILE_PATH: Joi.string()
    .default('./logs')
    .description('Path for log files'),
});
