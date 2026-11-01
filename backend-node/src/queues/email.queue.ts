import { logger } from '@logging/logger';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

export async function addEmailToQueue(job: EmailJobData): Promise<void> {
  logger.info({ to: job.to, subject: job.subject }, '[QUEUE PLACEHOLDER] Email job added to queue');
}
