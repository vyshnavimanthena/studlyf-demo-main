import { logger } from '@logging/logger';

export interface AIJobData {
  prompt: string;
  taskType: string;
}

export async function addAIJobToQueue(job: AIJobData): Promise<void> {
  logger.info({ taskType: job.taskType }, '[QUEUE PLACEHOLDER] AI task job added to queue');
}
