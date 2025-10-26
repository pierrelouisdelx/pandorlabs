/**
 * Configuration module exports
 * Centralized export point for all configuration files
 */

import appConfig from './app.config';
import databaseConfig from './database.config';

export const configurations = [appConfig, databaseConfig];

export { appConfig, databaseConfig };
