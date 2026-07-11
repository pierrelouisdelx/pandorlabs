/**
 * Staging Environment Configuration
 * Similar to production but with additional logging and relaxed restrictions
 */
export const stagingConfig = {
  app: {
    port: 3001,
    environment: 'staging',
    cors: {
      enabled: true,
      origin: [
        'https://staging.pandoralabs.app',
        'https://staging-admin.pandoralabs.app',
      ],
    },
  },

  database: {
    mongodb: {
      autoIndex: false,
      autoCreate: false,
      debug: false,
    },
  },

  logging: {
    level: 'info',
    prettyPrint: false,
    fileEnabled: true,
  },

  cache: {
    ttl: 1800, // 30 minutes
  },

  rateLimit: {
    enabled: true,
    ttl: 60,
    max: 200, // More lenient for staging testing
  },

  ai: {
    retry: {
      maxAttempts: 3,
      backoffMs: 1000,
    },
  },
};
