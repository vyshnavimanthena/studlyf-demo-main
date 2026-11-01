# Studlyf Node.js + TypeScript Backend Foundation

Enterprise-grade, modular Node.js + TypeScript backend architecture for the Studlyf platform migration.

## Architecture Overview
- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.6+ (Strict Mode)
- **Framework:** Express.js
- **Database:** MongoDB Native Driver (v6) + GridFS
- **Caching & Queues:** Redis (ioredis) & In-memory fallback
- **Logger:** Pino
- **Validation:** Zod
- **Documentation:** Markdown architecture & contract specs in `src/docs/`

## Directory Structure
```text
src/
├── api/            # API router aggregators (v1)
├── config/         # Central configuration and environment schemas
├── database/       # MongoDB connection, GridFS, collection registry, indexes
├── logging/        # Pino logger, request, and audit loggers
├── middleware/     # Auth, Role guards, Rate limiter, Error handler, Security
├── modules/        # Domain modules (20 domain sub-folders)
├── services/       # AI, Email, PDF, Storage, Scheduler services
├── queues/         # Email, Notification, and AI background queues
├── cache/          # Memory & Redis cache drivers
├── shared/         # Common types, errors, utilities, responses, validators
├── docs/           # Architecture, API contracts, coding guidelines
└── tests/          # Unit, integration, and e2e test suites
```

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
cp .env.example .env
npm run dev
```

### Typechecking & Linting
```bash
npm run typecheck
npm run lint
```
