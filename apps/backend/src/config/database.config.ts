import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wsaas',
    connectionPoolSize: 50,
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10),
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10),
    socketTimeoutMS: parseInt(
      process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000',
      10,
    ),
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000',
      10,
    ),
    // Connection retry settings
    retryAttempts: parseInt(process.env.MONGODB_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.MONGODB_RETRY_DELAY || '2000', 10),
    // Additional connection options
    autoIndex: process.env.NODE_ENV !== 'production',
    autoCreate: process.env.NODE_ENV !== 'production',
  },
}));
