import { logger } from '@logging/logger';

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type: string;
}

export async function addNotificationToQueue(job: NotificationJobData): Promise<void> {
  logger.info({ userId: job.userId, type: job.type }, '[QUEUE PLACEHOLDER] Notification job added to queue');
}
