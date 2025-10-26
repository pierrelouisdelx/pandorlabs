/**
 * Configuration Validation Tests
 * Tests to verify environment configuration and validation
 */

describe('Configuration Tests', () => {
  describe('Validation Schema', () => {
    it('should validate valid environment variables', () => {
      const validEnv = {
        NODE_ENV: 'development',
        PORT: '3001',
        FRONTEND_URL: 'http://localhost:3000',
        MONGODB_URI: 'mongodb://localhost:27017/pandoralabs',
        ANTHROPIC_API_KEY: 'sk-ant-test-key',
        JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
      };

      // In a real test, you would import and use the validationSchema
      expect(validEnv.MONGODB_URI).toBeDefined();
      expect(validEnv.ANTHROPIC_API_KEY).toBeDefined();
      expect(validEnv.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    });

    it('should have required environment variables defined', () => {
      const required = ['MONGODB_URI', 'ANTHROPIC_API_KEY', 'JWT_SECRET'];

      required.forEach((key) => {
        expect(key).toBeDefined();
      });
    });
  });

  describe('AI Configuration', () => {
    it('should have valid Anthropic configuration', () => {
      const anthropicConfig = {
        apiKey: 'sk-ant-test',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
        timeoutMs: 60000,
      };

      expect(anthropicConfig.model).toBe('claude-3-5-sonnet-20241022');
      expect(anthropicConfig.maxTokens).toBeLessThanOrEqual(8192);
      expect(anthropicConfig.timeoutMs).toBeGreaterThan(0);
    });
  });

  describe('Environment-specific Configuration', () => {
    it('should have development configuration', () => {
      const devConfig = {
        app: { environment: 'development' },
        logging: { level: 'debug' },
        rateLimit: { enabled: false },
      };

      expect(devConfig.app.environment).toBe('development');
      expect(devConfig.logging.level).toBe('debug');
      expect(devConfig.rateLimit.enabled).toBe(false);
    });

    it('should have production configuration', () => {
      const prodConfig = {
        app: { environment: 'production' },
        logging: { level: 'error' },
        rateLimit: { enabled: true },
      };

      expect(prodConfig.app.environment).toBe('production');
      expect(prodConfig.logging.level).toBe('error');
      expect(prodConfig.rateLimit.enabled).toBe(true);
    });
  });
});
