import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import 'express-async-errors';

import { env } from '@config/env';
import { corsOptions } from '@config/cors';
import { securityHeaders } from '@middleware/securityHeaders.middleware';
import { globalRateLimiter } from '@middleware/rateLimiter.middleware';
import { requestLogger } from '@middleware/requestLogger.middleware';
import { errorHandler } from '@middleware/errorHandler.middleware';
import { v1Routes } from '@api/v1';
import { formatResponse } from '@shared/responses';
import { NotFoundError } from '@shared/errors';

const app: Application = express();

// Security & Core Middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logging & Rate Limiting
app.use(requestLogger);
app.use(globalRateLimiter);

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json(
    formatResponse('Studlyf Backend API status healthy', {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
});

// API Routes Aggregator
app.use(env.API_PREFIX, v1Routes);

// Catch-all 404 Handler
app.use('*', (_req: Request, _res: Response) => {
  throw new NotFoundError('Requested API endpoint does not exist');
});

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
