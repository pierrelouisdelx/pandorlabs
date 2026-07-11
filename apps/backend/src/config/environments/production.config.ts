/**
 * Production Environment Configuration
 * Optimized for security, performance, and reliability
 */
export const productionConfig = {
  app: {
    port: 3001,
    environment: 'production',
    cors: {
      enabled: true,
      origin: [
        'https://pandoralabs.app',
        'https://www.pandoralabs.app',
        'https://admin.pandoralabs.app',
      ],
      credentials: true,
    },
  },

  database: {
    mongodb: {
      autoIndex: false, // Indexes should be created manually in production
      autoCreate: false, // Collections should be created manually in production
      debug: false, // No debug logging in production
    },
  },

  logging: {
    level: 'error', // Only log errors in production
    prettyPrint: false,
    fileEnabled: true,
  },

  cache: {
    ttl: 3600, // 1 hour
  },

  rateLimit: {
    enabled: true,
    ttl: 60,
    max: 100, // Strict rate limiting in production
  },

  ai: {
    retry: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 10000,
    },
    cache: {
      enabled: true,
      ttlSeconds: 3600,
    },
  },

  security: {
    helmet: {
      enabled: true,
    },
    compression: {
      enabled: true,
    },
  },
};
