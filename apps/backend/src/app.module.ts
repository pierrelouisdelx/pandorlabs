import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiQueryModule } from './ai-query/ai-query.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { configurations, validationSchema } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configurations,
      // Env lives at the monorepo root so one file serves both apps. Paths are
      // resolved from cwd, which is apps/backend. A local .env still wins.
      envFilePath: ['.env', '../../.env'],
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<{
          uri: string;
          minPoolSize: number;
          maxPoolSize: number;
          socketTimeoutMS: number;
          serverSelectionTimeoutMS: number;
          retryAttempts: number;
          retryDelay: number;
          autoIndex: boolean;
          autoCreate: boolean;
        }>('database.mongodb');

        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }

        return {
          uri: dbConfig.uri,
          minPoolSize: dbConfig.minPoolSize,
          maxPoolSize: dbConfig.maxPoolSize,
          socketTimeoutMS: dbConfig.socketTimeoutMS,
          serverSelectionTimeoutMS: dbConfig.serverSelectionTimeoutMS,
          retryAttempts: dbConfig.retryAttempts,
          retryDelay: dbConfig.retryDelay,
          autoIndex: dbConfig.autoIndex,
          autoCreate: dbConfig.autoCreate,
          connectionFactory: (connection: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            connection.on('connected', () => {
              console.log('MongoDB connected successfully');
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            connection.on('error', (error: Error) => {
              console.error('MongoDB connection error:', error);
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            connection.on('disconnected', () => {
              console.log('MongoDB disconnected');
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    HealthModule,
    AiQueryModule,
    ScrapersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
