import { env } from './env';

export const databaseConfig = {
  uri: env.MONGO_URI,
  dbName: env.MONGO_DB_NAME,
  options: {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  },
};
