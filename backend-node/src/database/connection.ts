import { MongoClient, Db } from 'mongodb';
import { databaseConfig } from '@config/database';
import { logger } from '@logging/logger';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(databaseConfig.uri, databaseConfig.options);
    await client.connect();
    db = client.db(databaseConfig.dbName);
    logger.info(`Successfully connected to MongoDB database: ${databaseConfig.dbName}`);
    return db;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed gracefully.');
  }
}
