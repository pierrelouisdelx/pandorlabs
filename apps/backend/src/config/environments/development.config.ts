/**
 * Development Environment Configuration
 * Optimized for local development with debug features enabled
 */
export const developmentConfig = {
  app: {
    port: 3001,
    environment: 'development',
    cors: {
      enabled: true,
      origin: '*',
    },
  },

  database: {
    mongodb: {
      autoIndex: true,
      autoCreate: true,
      debug: true,
    },
  },

  logging: {
    level: 'debug',
    prettyPrint: true,
    fileEnabled: true,
  },

  cache: {
    ttl: 300, // 5 minutes for faster development iteration
  },

  rateLimit: {
    enabled: false, // Disabled for development
  },

  ai: {
    retry: {
      maxAttempts: 2,
      backoffMs: 500,
    },
  },
};
