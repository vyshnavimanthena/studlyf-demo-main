import cron from 'node-cron';
import { logger } from '@logging/logger';

export function initializeSchedulers(): void {
  logger.info('Initializing background cron schedulers...');
  // Example daily cleanup cron job at midnight
  cron.schedule('0 0 * * *', () => {
    logger.info('[CRON JOB] Running scheduled daily maintenance');
  });
}
