/**
 * Configuration module exports
 * Centralized export point for all configuration files
 */

import appConfig from './app.config';
import databaseConfig from './database.config';
import aiConfig from './ai.config';

export const configurations = [appConfig, databaseConfig, aiConfig];

export { appConfig, databaseConfig, aiConfig };
export { validationSchema } from './validation.schema';
export * from './environments';
