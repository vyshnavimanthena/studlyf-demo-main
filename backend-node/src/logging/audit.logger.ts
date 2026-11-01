import { logger } from './logger';

export interface AuditLogData {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export function logAudit(data: AuditLogData): void {
  logger.info(
    {
      audit: true,
      ...data,
      timestamp: new Date().toISOString(),
    },
    `AUDIT LOG: ${data.action} by ${data.actorId}`,
  );
}
