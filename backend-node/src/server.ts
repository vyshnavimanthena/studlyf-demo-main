import http from 'http';
import app from './app';
import { env } from '@config/env';
import { initSentry } from '@config/sentry';
import { logger } from '@logging/logger';
import { connectDatabase, closeDatabase, ensureIndexes } from '@database/index';
import { initializeSchedulers } from '@services/scheduler';

async function bootstrap(): Promise<void> {
  try {
    // Initialize Error Tracking
    initSentry();

    // Connect to Database
    await connectDatabase();
    await ensureIndexes();

    // Initialize Background Cron Schedulers
    initializeSchedulers();

    // Create & Start HTTP Server
    const server = http.createServer(app);
    const PORT = parseInt(env.PORT, 10);

    server.listen(PORT, () => {
      logger.info(
        `🚀 Studlyf Node.js + TypeScript Backend running on port ${PORT} [${env.NODE_ENV}]`,
      );
      logger.info(`REST API Base URL: http://localhost:${PORT}${env.API_PREFIX}`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await closeDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Fatal error during backend application bootstrap');
    process.exit(1);
  }
}

bootstrap();
