import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  JWT_SECRET: z.string().default('default_jwt_secret_must_change_in_production_min_32_chars'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  MONGO_URI: z.string().default('mongodb://localhost:27017/studlyf_db'),
  MONGO_DB_NAME: z.string().default('studlyf_db'),

  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('465'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default('Studlyf Notifications'),

  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),

  SENTRY_DSN: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export const env = envSchema.parse(process.env);
