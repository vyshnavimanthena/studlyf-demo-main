# BACKEND_MIGRATION_ACTION_PLAN.md
# Studlyf — FastAPI → Node.js + TypeScript Migration Execution Guide

> **Document Status:** Production-Grade Execution Plan  
> **Generated:** 2026-08-01  
> **Audience:** Engineering team executing the migration  
> **Companion Document:** [BACKEND_MIGRATION_REFERENCE.md](file:///C:/Users/sai%20pallavi/OneDrive/Desktop/stud/studlyfv2/docs/BACKEND_MIGRATION_REFERENCE.md)

---

## Table of Contents

1. [Migration Strategy](#section-1-migration-strategy)
2. [Exact Order of Migration](#section-2-exact-order-of-migration)
3. [Team Responsibilities](#section-3-team-responsibilities)
4. [Definition of Done](#section-4-definition-of-done)
5. [Testing Strategy](#section-5-testing-strategy)
6. [Rollback Plan](#section-6-rollback-plan)
7. [Deployment Strategy](#section-7-deployment-strategy)
8. [Coding Standards](#section-8-coding-standards)
9. [Things the Team MUST NOT DO](#section-9-things-the-team-must-not-do)
10. [Migration Checklist](#section-10-migration-checklist)

---

## Section 1: Migration Strategy

### 1.1 Recommended Approach: **Parallel Backend with Incremental Cutover**

> [!IMPORTANT]
> We recommend running **both backends in parallel** during migration, with a **reverse proxy (nginx)** routing traffic to either system based on path prefix. This is the safest approach for a production application with active users.

### 1.2 Why This Approach

| Alternative | Risk | Why Rejected |
|------------|------|--------------|
| **Big Bang** | 🔴 CRITICAL | One-shot deployment. If anything fails, everything breaks. Unacceptable for a production system with active users. |
| **Blue-Green** | 🟡 HIGH | Requires full feature parity before any deployment. Delays value delivery by months. |
| **Incremental (Strangler Fig)** | ✅ SELECTED | Routes are migrated one module at a time. Old endpoints remain active until the new one is verified. Zero downtime. Instant rollback per module. |

### 1.3 How It Works

```
                          ┌──────────────────────┐
                          │   nginx / API Gateway │
                          │   (route-level proxy) │
                          └──────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
   │   Node.js API   │   │   FastAPI API   │   │   Node.js API   │
   │  (migrated)     │   │  (legacy)       │   │  (migrated)     │
   │                 │   │                 │   │                 │
   │ /api/auth/*     │   │ /api/career/*   │   │ /api/events/*   │
   │ /api/users/*    │   │ /api/admin/*    │   │ /api/teams/*    │
   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
            │                     │                      │
            └─────────────────────┼──────────────────────┘
                                  │
                          ┌───────▼───────┐
                          │   MongoDB     │
                          │   (shared)    │
                          └───────────────┘
```

**Key Principles:**
1. Both backends share the **same MongoDB database** — no data migration needed
2. The reverse proxy routes each URL prefix to the appropriate backend
3. Frontend code does **not change** — same API contracts, same URLs
4. Each module is migrated, tested, and cut over independently
5. If a module fails, revert the proxy rule — instant rollback

### 1.4 Migration Phases

```
Phase 0: Setup (Week 1)
    → Project scaffolding, CI/CD, staging environment
    
Phase 1: Foundation (Week 1)
    → Auth, Config, Database, Middleware
    
Phase 2: Core Features (Week 2)
    → Users, Events, Opportunities, Teams, Submissions
    
Phase 3: Advanced Features (Week 2)
    → Institution Dashboard, Judging, Certificates, Leaderboard
    
Phase 4: AI & Specialty (Week 2)
    → Career, Interview, Assessment, Company Simulator
    
Phase 5: Admin & Support (Week 3)
    → Admin Panel, Notifications, Community, SDL
    
Phase 6: Cutover (Week 3)
    → Final testing, performance validation, full switchover
```

---

## Section 2: Exact Order of Migration

### Phase 0: Infrastructure Setup

```
Step 0.1: Project Initialization
    → npx create, TypeScript config, ESLint, Prettier
    → Express/Fastify setup with folder structure from Section 15 of Reference Doc

Step 0.2: CI/CD Pipeline
    → GitHub Actions: lint → build → test → deploy (staging)
    → Docker multi-stage build

Step 0.3: Database Connection
    → MongoDB native driver connection manager
    → Collection registry (mirror db.py's 80+ collections)
    → Index definitions (mirror ensure_indexes)

Step 0.4: Configuration
    → Zod-validated environment config
    → Mirror all env vars from Reference Doc Section 8
```

### Phase 1: Authentication (CRITICAL PATH)

> [!CAUTION]
> Authentication MUST be migrated first and verified exhaustively before any other module. A broken auth system renders the entire platform unusable.

```
Step 1.1: JWT Utilities
    Dependencies: config module
    ├── create_access_token → createAccessToken (jsonwebtoken)
    ├── decode_access_token → decodeAccessToken (jsonwebtoken)
    ├── verify_password → verifyPassword (bcryptjs)
    ├── get_password_hash → hashPassword (bcryptjs)
    └── CRITICAL: Use SAME JWT_SECRET, SAME ALGORITHM (HS256)
    
Step 1.2: Auth Middleware
    Dependencies: Step 1.1
    ├── get_current_user → authMiddleware
    ├── require_role → roleGuard
    ├── get_auth_user → institutionAuthMiddleware
    ├── get_auth_user_optional → optionalAuth
    ├── admin_required → superAdminGuard
    └── assert_institution_scope → institutionScopeGuard

Step 1.3: Auth Endpoints
    Dependencies: Step 1.2
    ├── POST /api/auth/signup
    ├── POST /api/auth/login (+ httpOnly cookie)
    ├── POST /api/auth/verify-email
    ├── POST /api/auth/resend-verification
    ├── POST /api/auth/forgot-password
    ├── POST /api/auth/reset-password
    ├── GET  /api/auth/me
    └── POST /api/v1/auth/promote-to-institution

Step 1.4: Verification
    ├── Existing tokens from FastAPI work with Node.js
    ├── Existing bcrypt hashes verify correctly
    ├── Login → Token → /me roundtrip works
    ├── Cookie-based auth fallback works
    └── Rate limiting on auth endpoints
```

### Phase 2: Users & Profiles

```
Step 2.1: User Profile Endpoints
    Dependencies: Phase 1
    ├── GET /api/user/{user_id}/profile
    ├── GET /api/user/{user_id}
    ├── POST /api/user/{user_id}/update-profile
    ├── DELETE /api/user/{user_id}/profile/skill/{idx}
    ├── DELETE /api/user/{user_id}/profile/project/{idx}
    ├── DELETE /api/user/{user_id}/profile/certification/{idx}
    ├── DELETE /api/user/{user_id}/profile/achievement/{idx}
    ├── DELETE /api/user/{user_id}/profile/education/{idx}
    ├── DELETE /api/user/{user_id}/profile/experience/{idx}
    ├── GET /api/user/{user_id}/badges
    ├── GET /api/user/{user_id}/dashboard-stats
    ├── PATCH /api/users/{user_id}/role
    └── POST /api/user/{user_id}/upload-resume
```

### Phase 3: Opportunities

```
Step 3.1: Opportunity CRUD
    Dependencies: Phase 1, Phase 2
    ├── POST /api/opportunities
    ├── GET /api/opportunities
    ├── GET /api/opportunities/{id}
    ├── PUT /api/opportunities/{id}
    ├── DELETE /api/opportunities/{id}
    ├── POST /api/opportunities/{id}/apply
    ├── GET /api/opportunities/my-applications
    ├── GET /api/opportunities/{id}/applications
    ├── POST /api/opportunities/{id}/review
    ├── GET /api/opportunities/{id}/reviews
    ├── POST /api/opportunities/{id}/save
    ├── DELETE /api/opportunities/{id}/save
    ├── GET /api/opportunities/saved
    └── GET /api/opportunities/overview

Step 3.2: Supporting Services
    ├── opportunity_service.ts (CRUD + business logic)
    ├── opportunity_notification_service.ts (email on apply)
    └── subscription_service.ts (plan quota validation)
```

### Phase 4: Events & Registration

```
Step 4.1: Event CRUD
    Dependencies: Phase 1
    ├── POST /api/v1/events/
    ├── GET /api/v1/events/
    ├── GET /api/v1/events/{id}
    ├── PUT /api/v1/events/{id}
    ├── DELETE /api/v1/events/{id}
    └── PATCH /api/v1/events/{id}/status

Step 4.2: Registration System
    Dependencies: Step 4.1
    ├── POST /api/v1/registration/events/{id}/register
    ├── GET /api/v1/registration/events/{id}/check
    ├── GET /api/v1/registration/events/{id}/team-info
    └── Full stage submission workflow

Step 4.3: Stage Management
    Dependencies: Step 4.1
    ├── Stage CRUD endpoints
    ├── Stage access control (stage_access_control.py → stages.guard.ts)
    ├── Stage navigation endpoints
    └── Stage sync endpoints
```

### Phase 5: Teams

```
Step 5.1: Team Management
    Dependencies: Phase 4
    ├── POST /api/teams/create
    ├── POST /api/teams/{id}/join (invite code)
    ├── GET /api/teams/{id}
    ├── GET /api/teams/event/{event_id}
    ├── PATCH /api/teams/{id}/members
    ├── Team formation routes
    └── Team join request routes (/api/v1/teams/requests/*)
```

### Phase 6: Submissions & Judging

```
Step 6.1: Submissions
    Dependencies: Phase 4, Phase 5
    ├── Submission CRUD (/api/submissions/*)
    ├── Dynamic submission service (file uploads + GridFS)
    ├── Hackathon submissions (/api/hackathons/*)
    └── Submission file I/O

Step 6.2: Judging System
    Dependencies: Step 6.1
    ├── Judge invitation + acceptance
    ├── Judge portal (/api/judge-portal/*)
    ├── Evaluation routes (/api/evaluation/*)
    ├── Hackathon judging (/api/judging/*)
    ├── Evaluation criteria management
    └── Score service
```

### Phase 7: Leaderboard & Certificates

```
Step 7.1: Leaderboard
    Dependencies: Phase 6
    ├── Leaderboard calculation service
    ├── Leaderboard routes
    └── PDF export

Step 7.2: Certificates
    Dependencies: Phase 4, Phase 6
    ├── Certificate generation (HTML → PDF)
    ├── Certificate issuance routes
    ├── Certificate verification routes
    ├── Achievement registry
    ├── Eligibility rules
    └── QR code generation
```

### Phase 8: Institution Dashboard

> [!WARNING]
> This is the largest single module (378KB, 150+ endpoints). It should be broken into sub-tasks.

```
Step 8.1: Institution Profile
    Dependencies: Phase 1
    ├── Profile CRUD
    └── Branding/media

Step 8.2: Institution Events Management
    Dependencies: Phase 4, Phase 6
    ├── Event detail view
    ├── Participant management
    ├── Team management
    ├── Submission review
    └── Judge management

Step 8.3: Institution Analytics
    Dependencies: Step 8.2
    ├── Timeline analytics
    ├── Department breakdown
    ├── Score distribution
    ├── Submission distribution
    └── Export (PDF, summary)

Step 8.4: Institution Communication
    Dependencies: Step 8.2
    ├── Email templates
    ├── Bulk notifications
    ├── Send reminders
    └── FAQs management

Step 8.5: Institution Quizzes
    Dependencies: Step 8.2
    ├── Quiz CRUD
    ├── Quiz submission
    ├── Quiz results
    ├── Shortlisting
    └── Coding attempt evaluation
```

### Phase 9: Email System

```
Step 9.1: Email Service
    Dependencies: Phase 1
    ├── SMTP connection (nodemailer)
    ├── Send email function
    ├── Template rendering (all 15+ templates)
    ├── Email queue (background worker)
    └── Delivery logging

Step 9.2: Notification System
    Dependencies: Step 9.1
    ├── In-app notification CRUD
    ├── Notification routes
    ├── Platform notification service
    ├── Reminder scheduler (node-cron)
    └── Communication service
```

### Phase 10: AI & Career Features

```
Step 10.1: Groq AI Integration
    Dependencies: Phase 1
    ├── groq-sdk setup
    ├── Prompt templates (mirror all prompts exactly)
    └── JSON response parsing with fallbacks

Step 10.2: Career Endpoints
    Dependencies: Step 10.1
    ├── POST /api/career/analyze
    ├── POST /api/career/explain
    ├── POST /api/career/path-details
    ├── POST /api/career/identity
    ├── POST /api/career/explore-paths
    ├── POST /api/career/roadmap
    ├── POST /api/career/certifications
    ├── POST /api/career/insight-details
    └── Career taxonomy data (static → config file)

Step 10.3: Mock Interview
    Dependencies: Step 10.1
    ├── POST /api/interview/setup
    ├── POST /api/interview/chat
    ├── POST /api/interview/voice-analysis
    └── GET /api/interview/report

Step 10.4: Other AI Features
    Dependencies: Step 10.1
    ├── POST /api/resume/review
    ├── POST /api/assessment/generate
    ├── POST /api/analyze-github
    ├── POST /api/generate-summary/
    └── POST /generate-resume/
```

### Phase 11: Courses & LMS

```
Step 11.1: Course Management
    Dependencies: Phase 1
    ├── Course CRUD
    ├── Module/Theory/Video/Quiz/Project content
    ├── Progress tracking
    ├── Quiz submission + scoring
    ├── Project submission
    └── Certificate generation (course-level)

Step 11.2: Enrollment & Cart
    Dependencies: Step 11.1
    ├── Cart CRUD
    ├── Checkout flow
    ├── Enrollment management
    └── User courses view
```

### Phase 12: Supporting Features

```
Step 12.1: SDL (System Deconstruction Lab)
    Dependencies: Phase 1
    ├── Project CRUD
    ├── Task management
    ├── Comments
    ├── Join requests
    └── Admin SDL management

Step 12.2: Community
    Dependencies: Phase 1
    ├── Post CRUD
    ├── Voting
    ├── Comments
    ├── Top builders
    └── Saved posts

Step 12.3: Admin Panel
    Dependencies: Phase 1
    ├── Platform stats
    ├── Student management
    ├── Course management
    ├── Assessment history
    ├── Mentor/Company management
    ├── Payment/Audit logs
    └── Resume management

Step 12.4: StudOTT
    Dependencies: Phase 1
    └── Video catalog CRUD

Step 12.5: Ads
    Dependencies: Phase 1
    └── Ad management CRUD

Step 12.6: Company Simulator
    Dependencies: Step 10.1
    └── Company prep modules

Step 12.7: SSR Pages
    Dependencies: Phase 4
    ├── /portal/{event_id}
    ├── /card/{event_id}
    └── /admin page

Step 12.8: Gamification
    Dependencies: Phase 1
    ├── Badge system
    ├── XP tracking
    └── Achievement checks

Step 12.9: Search
    Dependencies: Phase 1
    └── GET /api/search
```

### Phase 13: Cutover

```
Step 13.1: Full Integration Testing
Step 13.2: Performance Benchmarking
Step 13.3: Security Audit
Step 13.4: Load Testing
Step 13.5: Gradual Traffic Shift (10% → 50% → 100%)
Step 13.6: Retire FastAPI Backend
```

---

## Section 3: Team Responsibilities

### 3.1 Recommended Work Split

#### Backend Team A — Auth & Core (2-3 engineers)
| Responsibility | Duration |
|---------------|----------|
| Auth system (Phase 1) | Week 3-4 |
| User profiles (Phase 2) | Week 5 |
| Teams (Phase 5) | Week 7-8 |
| Email system (Phase 9) | Week 11-12 |
| Admin panel (Phase 12.3) | Week 18 |

#### Backend Team B — Events & Features (2-3 engineers)
| Responsibility | Duration |
|---------------|----------|
| Events & Registration (Phase 4) | Week 5-7 |
| Submissions & Judging (Phase 6) | Week 8-10 |
| Leaderboard & Certificates (Phase 7) | Week 10-11 |
| Institution Dashboard (Phase 8) | Week 12-16 |

#### Backend Team C — AI & Specialty (1-2 engineers)
| Responsibility | Duration |
|---------------|----------|
| Opportunities (Phase 3) | Week 5-6 |
| AI Integration (Phase 10) | Week 15-17 |
| Courses/LMS (Phase 11) | Week 13-14 |
| SDL, Community, StudOTT (Phase 12) | Week 18-19 |

#### Frontend Team (1-2 engineers)
| Responsibility | Duration |
|---------------|----------|
| Verify API contract compatibility | Throughout |
| Update apiConfig.ts if base URL changes | Week 20 |
| Fix any response format discrepancies | Throughout |
| Integration testing per module cutover | Throughout |

#### QA Team (1-2 engineers)
| Responsibility | Duration |
|---------------|----------|
| Write API contract tests (per module) | Week 1-19 |
| Regression testing after each cutover | Throughout |
| Performance comparison benchmarks | Week 18-20 |
| Security testing | Week 19-20 |

#### DevOps (1 engineer)
| Responsibility | Duration |
|---------------|----------|
| CI/CD pipeline setup | Week 1-2 |
| Docker + staging environment | Week 1-2 |
| nginx proxy configuration | Week 3 |
| Monitoring (Sentry, logging) | Week 3 |
| Production deployment | Week 20 |

### 3.2 Communication Protocol

- **Daily standups** during active migration phases
- **Module demo** after each phase completion
- **Sign-off checklist** before each module cutover
- **Shared Slack channel** for migration issues
- **API contract document** (BACKEND_MIGRATION_REFERENCE.md) as single source of truth

---

## Section 4: Definition of Done

### 4.1 Per-Module Definition of Done

A module is considered **migration-complete** when ALL of the following are true:

| # | Criterion | How to Verify |
|---|-----------|--------------|
| 1 | **API Parity** | Every endpoint from the Reference Doc exists in the new backend with identical routes, methods, and query parameters |
| 2 | **Request Compatibility** | Identical request body schemas accepted (same field names, types, optional/required) |
| 3 | **Response Compatibility** | Identical response JSON structure (same field names, types, nesting) |
| 4 | **Error Response Parity** | Same HTTP status codes and error detail messages for all error cases |
| 5 | **Auth Compatibility** | Same auth requirements (which endpoints need auth, which roles are allowed) |
| 6 | **Database Compatibility** | Same collections read/written, same document structure, same indexes respected |
| 7 | **Unit Tests Pass** | ≥80% code coverage for service layer |
| 8 | **Integration Tests Pass** | API contract tests verify request/response shapes |
| 9 | **Frontend Compatibility** | Frontend pages that use this module work without changes |
| 10 | **Performance Parity** | Response times ≤ FastAPI response times (p95) |
| 11 | **Error Handling** | No stack traces in responses, structured error format |
| 12 | **Logging** | Structured JSON logs for all operations |
| 13 | **Security** | No new vulnerabilities introduced |

### 4.2 Auth Module — Specific DoD

- [ ] Existing JWT tokens from FastAPI decode correctly in Node.js
- [ ] Existing bcrypt hashes verify correctly with `bcryptjs`
- [ ] Login returns identical response structure
- [ ] httpOnly cookie is set with identical parameters
- [ ] Password reset flow works end-to-end
- [ ] Email verification flow works end-to-end
- [ ] Rate limiting enforced on auth endpoints
- [ ] Frontend `AuthContext.tsx` works without changes

### 4.3 Overall Migration — Definition of Done

- [ ] All FastAPI endpoints have Node.js equivalents
- [ ] Frontend works entirely against the new backend
- [ ] All background jobs (reminders, email queue, cert generation) running
- [ ] Monitoring/alerting operational
- [ ] FastAPI backend fully decomissioned
- [ ] Documentation updated

---

## Section 5: Testing Strategy

### 5.1 Testing Pyramid

```
                    ┌──────────────┐
                    │   E2E Tests  │  ← Frontend + Backend integration
                    │  (Cypress)   │
                    ├──────────────┤
                    │  Integration │  ← API contract tests (Supertest)
                    │    Tests     │
                    ├──────────────┤
                    │  Unit Tests  │  ← Service + utility logic (Jest)
                    │  (Jest)      │
                    └──────────────┘
```

### 5.2 Test Types

#### Unit Tests (Jest)
- **Target**: Services, utilities, middleware, validators
- **Coverage Goal**: ≥80%
- **Key Areas**:
  - JWT creation and verification
  - Password hashing and verification
  - Role-based access control logic
  - Score calculation logic
  - Leaderboard ranking algorithm
  - Email template rendering
  - File validation logic
  - Rate limiter logic

#### Integration Tests (Supertest)
- **Target**: API endpoints end-to-end (HTTP request → response)
- **Coverage**: Every endpoint from the Reference Document
- **Approach**:
  ```typescript
  // Contract test example
  describe('POST /api/auth/login', () => {
    it('should return access_token and user object', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'Test123!' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('token_type', 'bearer');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('user_id');
      expect(res.body.user).toHaveProperty('role');
    });
  });
  ```

#### API Contract Tests
- **Purpose**: Verify that Node.js responses are byte-for-byte compatible with FastAPI responses
- **Method**: Record actual FastAPI responses → replay against Node.js → compare structures
- **Tool**: Custom comparator or `jest-json-schema`

#### Security Tests
- [ ] JWT with expired token returns 401
- [ ] JWT with invalid signature returns 401
- [ ] Missing auth header returns 401
- [ ] Wrong role returns 403
- [ ] SQL injection (MongoDB injection) vectors rejected
- [ ] Path traversal in file uploads rejected
- [ ] Rate limiting enforced
- [ ] No stack traces in error responses
- [ ] CORS headers correct
- [ ] Security headers present in production

#### Performance Tests
- **Tool**: `autocannon` or `k6`
- **Benchmark**: Compare p50, p95, p99 response times against FastAPI baseline
- **Key endpoints to benchmark**:
  - `POST /api/auth/login` (bcrypt is CPU-intensive)
  - `GET /api/v1/institution/events/{id}/participants` (large result sets)
  - `GET /api/v1/institution/leaderboard/{id}` (aggregation pipeline)
  - `POST /api/career/analyze` (AI latency)

#### Frontend Compatibility Tests
- **Method**: Run the existing React frontend against the new Node.js backend
- **Scope**: Navigate every page, perform every major action
- **Focus areas**:
  - Login/signup flow
  - Institution dashboard (most complex)
  - Event registration + stage submission
  - Judge evaluation flow
  - Career onboarding (AI features)
  - File uploads (resume, images)

### 5.3 Test Data Strategy

- Use a **dedicated test MongoDB database** (not production)
- Seed test data that mirrors production data shapes
- Clean up after each test suite
- Never use production credentials in tests

---

## Section 6: Rollback Plan

### 6.1 Per-Module Rollback (During Incremental Migration)

Since the migration uses a **reverse proxy routing strategy**, rollback is instant:

```
Rollback Steps (per module):
1. Update nginx/proxy config to route the module's paths back to FastAPI
2. Reload proxy (zero downtime)
3. Verify FastAPI endpoints responding
4. Investigate and fix the Node.js issue
5. Re-attempt cutover after fix
```

**Time to rollback: < 60 seconds**

### 6.2 Full Rollback (Post-Complete Migration)

If the fully migrated Node.js backend must be rolled back to FastAPI:

```
Full Rollback Steps:
1. Ensure FastAPI backend is still deployable (keep Docker image)
2. Route ALL traffic back to FastAPI via proxy
3. Verify FastAPI health checks
4. Announce maintenance window if needed
```

> [!IMPORTANT]
> **During migration, KEEP the FastAPI backend deployed and runnable at all times.** Do NOT decomission it until at least 2 weeks of stable production operation on Node.js.

### 6.3 Data Safety

- **MongoDB is shared** — no data migration, no data rollback needed
- **JWT tokens are compatible** — users stay logged in through rollback
- **File uploads** — both backends use the same `/uploads/` directory and GridFS bucket

### 6.4 Rollback Decision Criteria

Trigger rollback if ANY of the following occur:
- Error rate increases by >5% compared to FastAPI baseline
- p95 response time doubles compared to baseline
- Authentication failures spike
- Email delivery rate drops
- Any data corruption detected
- 500-error rate >1% sustained for 10 minutes

---

## Section 7: Deployment Strategy

### 7.1 Environments

| Environment | Purpose | URL | Deploy Trigger |
|------------|---------|-----|---------------|
| **Local Dev** | Development | `http://localhost:3000` | Manual |
| **Staging** | Integration testing | `https://staging-api.studlyf.in` | PR merge to `staging` |
| **Production** | Live traffic | `https://api.studlyf.in` | Manual approval after staging verification |

### 7.2 CI/CD Pipeline

```yaml
# Simplified pipeline
name: Node.js Backend CI/CD

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  lint:
    - ESLint + Prettier check
    
  build:
    - TypeScript compilation
    - No type errors
    
  test:
    - Unit tests (Jest)
    - Integration tests (Supertest + test MongoDB)
    - Coverage report (≥80%)
    
  deploy-staging:
    - Docker build
    - Deploy to staging
    - Run smoke tests
    
  deploy-production:
    - Manual approval gate
    - Docker build
    - Blue-green deploy
    - Health check verification
    - Rollback on failure
```

### 7.3 Docker Strategy

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 8000
CMD ["node", "dist/server.js"]
```

### 7.4 Zero-Downtime Deployment

1. **Health Check Endpoint**: `GET /health` must return 200 before accepting traffic
2. **Graceful Shutdown**: Handle `SIGTERM` — finish in-flight requests, close DB connections
3. **Rolling Deploy**: Deploy new instances before removing old ones
4. **Connection Draining**: Allow 30 seconds for existing connections to complete

### 7.5 Database

- **No migrations needed** — MongoDB is schema-less
- Same connection string used by both backends
- Ensure indexes are created on Node.js backend startup (mirror `ensure_indexes`)
- **No schema changes during migration**

### 7.6 Proxy Configuration for Dual-Backend

```nginx
# nginx config for incremental migration
upstream fastapi {
    server fastapi-backend:8000;
}

upstream nodejs {
    server nodejs-backend:8000;
}

server {
    listen 80;
    
    # Migrated routes → Node.js
    location /api/auth/ {
        proxy_pass http://nodejs;
    }
    
    location /api/user/ {
        proxy_pass http://nodejs;
    }
    
    # Not-yet-migrated routes → FastAPI
    location /api/ {
        proxy_pass http://fastapi;
    }
    
    # Update as modules are migrated...
}
```

---

## Section 8: Coding Standards

### 8.1 TypeScript Standards

| Rule | Standard |
|------|----------|
| **Strict mode** | `"strict": true` in tsconfig.json |
| **No `any`** | Avoid `any` type — use `unknown` or proper types |
| **Explicit return types** | All public functions must have explicit return types |
| **Interface over type** | Prefer `interface` for object shapes, `type` for unions/intersections |
| **Enum handling** | Use `const` objects with `as const` instead of TypeScript enums |
| **Null handling** | Use strict null checks, avoid `!` non-null assertion |
| **Async/await** | Always use async/await, never raw Promises (unless combining) |

### 8.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Files** | kebab-case | `auth.controller.ts` |
| **Classes** | PascalCase | `AuthService` |
| **Functions** | camelCase | `createAccessToken()` |
| **Interfaces** | PascalCase, no prefix | `User`, `EventStage` |
| **DTOs** | PascalCase + Dto suffix | `LoginRequestDto`, `LoginResponseDto` |
| **Constants** | UPPER_SNAKE_CASE | `JWT_ALGORITHM` |
| **Env vars** | UPPER_SNAKE_CASE | `MONGO_URL` |
| **Route files** | `{module}.routes.ts` | `auth.routes.ts` |
| **Test files** | `{module}.{type}.test.ts` | `auth.service.test.ts` |
| **Middleware** | `{name}.middleware.ts` | `auth.middleware.ts` |

### 8.3 Folder Structure Rules

1. **One module per feature area** — never mix unrelated features
2. **Each module contains**: controller, service, routes, dto, repository (if needed)
3. **Shared code** goes in `/shared/` — never cross-import between modules
4. **Database operations** belong in repositories or services, never in controllers
5. **Business logic** belongs in services, never in controllers or routes

### 8.4 Validation Pattern

```typescript
// Use Zod for ALL request validation
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().transform(s => s.trim().toLowerCase()),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// In route handler
router.post('/login', validate(loginSchema), authController.login);
```

### 8.5 Error Handling Pattern

```typescript
// Controller pattern — always delegate to service, catch errors uniformly
async login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error); // Let global error handler format the response
  }
}

// Service throws AppError subclasses
async login(data: LoginRequest) {
  const user = await usersRepo.findByEmail(data.email);
  if (!user) throw new UnauthorizedError('Invalid email or password');
  // ...
}
```

### 8.6 Logging Standards

```typescript
// Use structured JSON logging
const logger = pino({ level: config.LOG_LEVEL });

// Log format
logger.info({ userId, action: 'LOGIN_SUCCESS' }, 'User logged in');
logger.error({ error: err.message, stack: err.stack }, 'Database query failed');
logger.warn({ email, attempt: count }, 'Rate limit approaching');

// NEVER log:
// - Passwords or tokens
// - Full request bodies with sensitive data
// - Stack traces in production responses
```

### 8.7 Configuration Rules

- ALL config values come from environment variables
- ALL env vars validated at startup with Zod
- App MUST fail fast if required env vars are missing
- Secrets MUST NOT have defaults
- Non-secrets SHOULD have sensible defaults

### 8.8 Documentation Standards

- Every public function MUST have JSDoc comments
- Every route MUST specify its auth requirements
- Every service method MUST document its side effects
- README.md MUST contain setup instructions
- API changes MUST update this migration reference document

---

## Section 9: Things the Team MUST NOT DO

> [!CAUTION]
> Violations of these rules will cause production incidents, data corruption, or breaking changes. Every team member must read and acknowledge this list.

### 9.1 API Contract Rules

- [ ] ❌ **Do NOT change API routes** — Every route must match exactly (`/api/auth/login`, not `/auth/login`)
- [ ] ❌ **Do NOT change request body field names** — `email` stays `email`, not `emailAddress`
- [ ] ❌ **Do NOT change response field names** — `access_token` stays `access_token`, not `accessToken`
- [ ] ❌ **Do NOT change response nesting** — `{ user: { role: "student" } }` stays nested
- [ ] ❌ **Do NOT change HTTP status codes** — 401 stays 401, 403 stays 403
- [ ] ❌ **Do NOT change error message formats** — Frontend relies on `detail` field
- [ ] ❌ **Do NOT rename URL path parameters** — `{user_id}` stays `{user_id}`, not `{userId}`
- [ ] ❌ **Do NOT change query parameter names** — `?status=active` stays as-is

### 9.2 Authentication Rules

- [ ] ❌ **Do NOT change JWT secret or algorithm** — Existing tokens must work
- [ ] ❌ **Do NOT change JWT payload structure** — `sub`, `user_id`, `role` keys must match
- [ ] ❌ **Do NOT change cookie name or attributes** — `token` cookie with same parameters
- [ ] ❌ **Do NOT change password hashing** — bcrypt with same rounds/format
- [ ] ❌ **Do NOT break the legacy plaintext password auto-migration**

### 9.3 Database Rules

- [ ] ❌ **Do NOT modify the database schema during migration**
- [ ] ❌ **Do NOT rename collections**
- [ ] ❌ **Do NOT change field names in documents**
- [ ] ❌ **Do NOT drop or modify existing indexes**
- [ ] ❌ **Do NOT use a different database for the new backend**
- [ ] ❌ **Do NOT add ORM/ODM schema validation that rejects existing documents**

### 9.4 Architecture Rules

- [ ] ❌ **Do NOT mix business logic into controllers** — Controllers only handle HTTP
- [ ] ❌ **Do NOT put database queries in route handlers** — Use repositories/services
- [ ] ❌ **Do NOT expose stack traces in responses** — Use global error handler
- [ ] ❌ **Do NOT hardcode secrets** — Everything from environment
- [ ] ❌ **Do NOT skip input validation** — Validate all inputs with Zod schemas
- [ ] ❌ **Do NOT use `any` type** — Defeats the purpose of TypeScript migration

### 9.5 Process Rules

- [ ] ❌ **Do NOT deploy to production without staging verification**
- [ ] ❌ **Do NOT cut over a module without passing all contract tests**
- [ ] ❌ **Do NOT decomission FastAPI until 2 weeks of stable Node.js production**
- [ ] ❌ **Do NOT skip code review** — All migration PRs need 2 reviewers
- [ ] ❌ **Do NOT introduce new features during migration** — Feature freeze
- [ ] ❌ **Do NOT modify frontend code** unless absolutely necessary for compatibility
- [ ] ❌ **Do NOT change the frontend routing strategy** (hash-based routing)

### 9.6 Security Rules

- [ ] ❌ **Do NOT log passwords, tokens, or secrets**
- [ ] ❌ **Do NOT return database `_id` as ObjectId** — Always convert to string
- [ ] ❌ **Do NOT trust user input** — Validate and sanitize everything
- [ ] ❌ **Do NOT disable CORS in production**
- [ ] ❌ **Do NOT commit `.env` files**
- [ ] ❌ **Do NOT store secrets in code**

---

## Section 10: Migration Checklist

### 10.1 Planning Phase

- [ ] All team members have read BACKEND_MIGRATION_REFERENCE.md
- [ ] All team members have read this action plan
- [ ] Technology stack decided (Express vs Fastify)
- [ ] CI/CD pipeline designed
- [ ] Staging environment provisioned
- [ ] Test MongoDB database provisioned
- [ ] Monitoring tools configured
- [ ] Communication channels established
- [ ] Feature freeze announced to product team
- [ ] Migration timeline approved by stakeholders

### 10.2 Development Phase — Per Module

- [ ] Service layer implemented with full business logic
- [ ] Controller layer with HTTP handling
- [ ] Route definitions matching exact FastAPI routes
- [ ] Request validation schemas (Zod)
- [ ] Response DTOs matching FastAPI response shapes
- [ ] Error handling with correct status codes
- [ ] Auth middleware applied to correct endpoints
- [ ] Unit tests written (≥80% coverage)
- [ ] Integration tests (API contract tests) written
- [ ] Code reviewed by 2+ engineers
- [ ] Deployed to staging
- [ ] Staging verified

### 10.3 Testing Phase — Per Module

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] API contract comparison (FastAPI vs Node.js) passes
- [ ] Frontend pages using this module work correctly
- [ ] Auth flows work (login, protected routes, role checks)
- [ ] Error cases return correct status codes and messages
- [ ] File uploads work (if applicable)
- [ ] Email sending works (if applicable)
- [ ] AI features return valid responses (if applicable)
- [ ] Performance benchmarks acceptable

### 10.4 Security Phase

- [ ] No stack traces in error responses
- [ ] JWT validation handles all edge cases
- [ ] Rate limiting active on auth endpoints
- [ ] CORS configured correctly
- [ ] Security headers present
- [ ] Input validation on all endpoints
- [ ] File upload validation (type, size, name)
- [ ] No secrets in code or logs
- [ ] Dependency audit (npm audit)
- [ ] OWASP Top 10 review

### 10.5 Performance Phase

- [ ] p50 response time ≤ FastAPI baseline
- [ ] p95 response time ≤ 1.5x FastAPI baseline
- [ ] p99 response time ≤ 2x FastAPI baseline
- [ ] Database query performance verified (explain plans)
- [ ] Memory usage under load is stable
- [ ] No memory leaks in long-running process
- [ ] Connection pooling configured
- [ ] Graceful shutdown handles in-flight requests

### 10.6 Deployment Phase

- [ ] Docker image builds successfully
- [ ] Health check endpoint responds
- [ ] Staging deployment verified
- [ ] Proxy configuration updated for module cutover
- [ ] Canary deployment (10% traffic) for 1 hour
- [ ] Error rate monitoring during canary
- [ ] Full traffic cutover
- [ ] Rollback plan tested and ready

### 10.7 Monitoring Phase

- [ ] Sentry error tracking active
- [ ] Structured logging operational
- [ ] Dashboard metrics visible (response times, error rates)
- [ ] Alert rules configured (error rate, latency, downtime)
- [ ] On-call rotation established for migration period
- [ ] Database connection monitoring
- [ ] Memory and CPU utilization monitoring

### 10.8 Post-Migration Verification

- [ ] All frontend pages functional
- [ ] All background jobs running (reminders, email queue, cert generation)
- [ ] Email delivery working
- [ ] File uploads working
- [ ] AI features responding
- [ ] Payment integration working
- [ ] Certificate generation working
- [ ] Search functionality working
- [ ] SSR pages rendering correctly
- [ ] Mobile responsiveness unchanged
- [ ] SEO pages functional
- [ ] No increase in user-reported bugs
- [ ] FastAPI backend can still be rolled back to (for 2 weeks)
- [ ] Documentation updated
- [ ] Team retro completed

---

## Appendix A: Key File Mapping (FastAPI → Node.js)

| FastAPI File | Node.js Equivalent | Notes |
|-------------|-------------------|-------|
| `main.py` | Split into 20+ module controllers | Break the monolith |
| `integration_routes.py` | `modules/institutions/**` (10+ files) | Break into sub-modules |
| `db.py` | `database/connection.ts` + `database/collections.ts` | Mirror collection registry |
| `auth_utils.py` | `modules/auth/auth.service.ts` | JWT + bcrypt |
| `auth_institution.py` | `middleware/auth.middleware.ts` | Institution auth |
| `routes/auth.py` | `middleware/auth.middleware.ts` | Merge into unified middleware |
| `domain_models.py` | `shared/types/*.ts` | TypeScript interfaces |
| `rate_limiter.py` | `middleware/rateLimiter.middleware.ts` | express-rate-limit |
| `stage_access_control.py` | `modules/events/stages/stages.guard.ts` | Stage access validation |
| `services/email_service.py` | `services/email/email.service.ts` | nodemailer |
| `services/email_template_service.py` | `services/email/email.templates.ts` | Template strings / Handlebars |
| `notification_service.py` | `modules/notifications/notifications.service.ts` | Notification logic |
| `services/career_taxonomy.py` | `shared/constants/career-taxonomy.ts` or DB | Static data |

## Appendix B: NPM Dependencies to Install

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "mongodb": "^6.0.0",
    "nodemailer": "^6.9.0",
    "groq-sdk": "^0.5.0",
    "multer": "^1.4.5",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0",
    "pino": "^8.15.0",
    "pino-pretty": "^10.2.0",
    "express-rate-limit": "^7.0.0",
    "rate-limit-redis": "^4.0.0",
    "ioredis": "^5.3.0",
    "node-cron": "^3.0.0",
    "qrcode": "^1.5.0",
    "puppeteer": "^21.0.0",
    "razorpay": "^2.9.0",
    "@sentry/node": "^7.0.0",
    "uuid": "^9.0.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/multer": "^1.4.0",
    "@types/node-cron": "^3.0.0",
    "@types/nodemailer": "^6.4.0",
    "@types/qrcode": "^1.5.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.0",
    "tsx": "^4.0.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

> **End of BACKEND_MIGRATION_ACTION_PLAN.md**
>
> This document is the execution guide for the engineering team. Combined with the Reference Document, a new backend engineer should be able to join the migration effort and contribute productively within their first day.
