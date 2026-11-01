import { logger } from '@logging/logger';
import { getCollection, COLLECTIONS } from './collections';

export async function ensureIndexes(): Promise<void> {
  try {
    logger.info('Verifying database index integrity...');
    const usersCol = getCollection(COLLECTIONS.USERS);
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ user_id: 1 }, { unique: true });

    const eventsCol = getCollection(COLLECTIONS.EVENTS);
    await eventsCol.createIndex({ institution_id: 1, status: 1 });

    const participantsCol = getCollection(COLLECTIONS.PARTICIPANTS);
    await participantsCol.createIndex({ event_id: 1, user_id: 1 }, { unique: true });

    logger.info('Database indexes successfully initialized.');
  } catch (error) {
    logger.warn({ error }, 'Database index verification warning (non-fatal)');
  }
}
