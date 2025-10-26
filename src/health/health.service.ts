import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  checkHealth() {
    const dbHealth = this.checkDatabaseHealth();

    return {
      status: dbHealth.status === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
      },
    };
  }

  checkDatabaseHealth() {
    try {
      const state = this.connection.readyState;
      const stateMap: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      // Access connection config for pool settings
      const connectionOptions = (this.connection as any).options as
        | { minPoolSize?: number; maxPoolSize?: number }
        | undefined;

      const poolStats = {
        minPoolSize: connectionOptions?.minPoolSize || 5,
        maxPoolSize: connectionOptions?.maxPoolSize || 50,
      };

      return {
        status: stateMap[state] || 'unknown',
        readyState: state,
        host: this.connection.host,
        name: this.connection.name,
        poolStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
