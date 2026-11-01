import { logger } from '@logging/logger';

export class EmailService {
  public async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    logger.info({ to, subject }, '[EMAIL SERVICE PLACEHOLDER] Email dispatch requested');
    return true;
  }
}

export const emailService = new EmailService();
