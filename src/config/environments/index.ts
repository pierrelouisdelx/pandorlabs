/**
 * Environment-specific configuration exports
 */
import { developmentConfig } from './development.config';
import { stagingConfig } from './staging.config';
import { productionConfig } from './production.config';

export { developmentConfig, stagingConfig, productionConfig };

/**
 * Get environment-specific configuration based on NODE_ENV
 */
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};
