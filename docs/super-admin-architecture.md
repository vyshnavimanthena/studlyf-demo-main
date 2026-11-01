# Studlyf Platform — Super Admin Architecture & Governance Design

---

## PART 1: SYSTEM FOUNDATION

### 1.1 Existing Role Hierarchy

```
super_admin (1)          ← Full platform governance (internal team)
    │
    ├── admin            ← Legacy role, equivalent to super_admin in scope
    │
    ├── institution      ← Institution dashboard (manage own events, users)
    │   ├── creates events, manages judges, reviews submissions
    │   └── scoped to own institution_id in all operations
    │
    ├── judge            ← Evaluation panel (scoped to assigned events)
    │   ├── views allocated submissions, scores, remarks
    │   └── no institution or student data visibility
    │
    ├── student          ← Competition participant
    │   ├── registers for events, submits work, tracks progress
    │   └── sees only own data and public events
    │
    ├── mentor           ← Course/learning mentor
    │   └── guides students, reviews projects
    │
    └── hiring_partner   ← Recruiter/company partner
        └── posts jobs, reviews candidate applications
```

### 1.2 Current Auth Architecture

| Layer | Technology | Details |
|-------|-----------|---------|
| Token | JWT (HS256) | 24h expiry, payload: `user_id, role, email, exp` |
| Password | bcrypt (12 rounds) | Direct bcrypt, no passlib |
| Middleware | FastAPI Depends | Three systems: basic JWT, hydrated user, optional auth |
| DB Sessions | MongoDB (Motor async) | 65 collections, lazy connection singleton |
| Rate Limiting | slowapi | Configurable limits per route |
| Admin Bypass | `_is_admin()` | Returns true for `admin`/`super_admin`, skips institution scope checks |

### 1.3 Platform Architecture Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React 19 + Vite)                    │
│                                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │  Student  │  │  Institution  │  │  Judge   │  │   Super Admin    │    │
│  │ Dashboard │  │   Dashboard   │  │  Portal  │  │    Dashboard     │    │
│  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └────────┬─────────┘    │
│       │               │               │                  │              │
│       └───────────────┴───────────────┴──────────────────┘              │
│                              │                                           │
│                     AuthContext (JWT in localStorage)                    │
│                              │                                           │
│                     API Client (authHeaders())                           │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │ HTTP/HTTPS
┌──────────────────────────────┼───────────────────────────────────────────┐
│                    BACKEND (FastAPI + Uvicorn)                           │
│                              │                                           │
│  ┌─────────┐  ┌──────────┐  └──────┬──────┐  ┌───────────┐             │
│  │  Auth   │  │  Routes  │         │       │  │ Middleware │             │
│  │  Utils  │  │   (34+)  │   CORS + Rate   │  │ Depends() │             │
│  └─────────┘  └────┬─────┘         │       │  └───────────┘             │
│                    │               │       │                             │
│                    └───────────────┼───────┘                             │
│                                    │                                     │
│  ┌─────────────────────────────────┼─────────────────────────────────┐  │
│  │                            MongoDB (Motor)                        │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────────┐   │  │
│  │  │  users  │ │institutions│ │ events │ │scores  │ │audit_logs │   │  │
│  │  │  (65+)  │ │           │ │        │ │        │ │           │   │  │
│  │  └─────────┘ └──────────┘ └────────┘ └────────┘ └───────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     External Services                             │  │
│  │  Gmail SMTP │ Groq AI │ Firebase │ Razorpay │ Render │ Vercel   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Current Access Control Matrix

| Resource | super_admin | admin | institution | judge | student | mentor | hiring_partner |
|----------|-------------|-------|-------------|-------|---------|--------|----------------|
| All users | FULL | FULL | NONE | NONE | NONE | NONE | NONE |
| Own profile | FULL | FULL | FULL | FULL | FULL | FULL | FULL |
| Institutions | FULL | FULL | OWN | NONE | NONE | NONE | NONE |
| All events | FULL | FULL | OWN_EVENTS | ASSIGNED | NONE | NONE | NONE |
| Public events | READ | READ | READ | READ | READ | READ | READ |
| Own registrations | FULL | FULL | FULL | NONE | OWN | NONE | NONE |
| Submissions (any) | FULL | FULL | OWN_EVENT | ASSIGNED | OWN | NONE | NONE |
| Scores (any) | FULL | FULL | OWN_EVENT | OWN | OWN | NONE | NONE |
| Judges | FULL | FULL | OWN | VIEW | NONE | NONE | NONE |
| Audit logs | FULL | FULL | NONE | NONE | NONE | NONE | NONE |
| System settings | MISSING | MISSING | NONE | NONE | NONE | NONE | NONE |
| Payments | READ | READ | OWN | NONE | OWN | NONE | NONE |

### 1.5 What the Super Admin Currently CANNOT Do (Critical Gaps)

| Capability | Impact | Priority |
|-----------|--------|----------|
| Institution approval workflow | Anyone can sign up as institution — no vetting | CRITICAL |
| Force-block/suspend users | No way to stop abuse | CRITICAL |
| Platform-wide moderation | No content review before publishing | CRITICAL |
| Feature flag system | Can't disable broken features in production | HIGH |
| Maintenance mode | Can't block access during updates | HIGH |
| Cross-institution analytics | No platform-level growth metrics | HIGH |
| Fraud detection | No automated suspicious activity alerts | HIGH |
| User impersonation/support | Can't debug user issues directly | HIGH |
| Role management UI | Can't change user roles without DB access | HIGH |
| System-wide notifications | Can't broadcast to all users | MEDIUM |
| Email template management | Templates only per-institution, no platform defaults | MEDIUM |
| API key management | No control over integrations | MEDIUM |
| Backup/recovery controls | No UI for DB backup triggers | MEDIUM |
| Compliance controls | No GDPR/data export tools | MEDIUM |
| Dispute resolution workflow | No structure for handling appeals | MEDIUM |

### 1.6 Database Entity Relationships (Super Admin Context)

```
users ──────────┬─── has_role ───── super_admin/admin/institution/judge/student/mentor/hiring_partner
                ├─── belongs_to ─── institution (if institution role)
                ├─── created_by ─── audit_logs
                └─── blocked_by ─── suspension_records (NEW)

institutions ───┬─── owns ──────── events (1:N)
                ├─── employs ───── judges (1:N)
                ├─── verified_by ─ super_admin (M:1)
                └─── approved_by ─ institution_verification (NEW)

events ─────────┬─── belongs_to ── institution (M:1)
                ├─── has ───────── stages (1:N)
                ├─── has ───────── participants (1:N)
                ├─── has ───────── teams (1:N)
                ├─── has ───────── submissions (1:N)
                ├─── has ───────── scores (1:N)
                ├─── has ───────── leaderboard (1:1)
                ├─── modified_by ─ super_admin (audit trail)
                └─── lifecycle ─── draft→published→live→closed→evaluation→results→ended→archived

suspension_records (NEW) ──┬─── targets ── users/institutions (polymorphic)
                           ├─── issued_by ─ super_admin
                           └─── resolved_by ─ super_admin (on appeal)

audit_logs ────┬─── actor ──── user
               ├─── target ─── polymorphic (user/institution/event/submission)
               └─── action ─── create/update/delete/block/unblock/suspend/approve/reject

platform_config (NEW) ──┬─── key-value feature flags
                        ├─── maintenance mode
                        └─── global settings

appeals (NEW) ──────────┬─── filed_by ── user/institution
                        ├─── reviewed_by ── super_admin
                        └─── references ── suspension_record

fraud_alerts (NEW) ─────┬─── triggered_by ── automated detection rules
                        ├─── reviewed_by ── super_admin
                        └─── references ── user/institution/event
```

---

## PART 2: SUPER ADMIN SYSTEM — MODULES

### MODULE 1: Dashboard (Global Command Center)

**Purpose**: Real-time pulse of the entire platform — key metrics, alerts, recent activity.

**Widgets**:
- **Platform KPIs**: Total users (students/institutions/judges), active events today, submissions this week, growth rate (MoM)
- **Revenue/Subscription**: MRR, active paid institutions, churn rate, invoice status
- **Alerts Feed**: Recent fraud flags, pending appeals, failed email deliveries, server errors (last 24h)
- **System Health**: API response times, MongoDB connection pool, queue depth (email_queue), error rates
- **Recent Activity Timeline**: New institution signups, user blocks, event publications, role changes
- **Geographic Distribution**: Map of users/institutions by region (from college data)
- **Growth Chart**: 30-day user signup trend, event creation trend, submission volume trend

**Backend Requirements**:
- `GET /api/admin/dashboard/stats` — aggregate platform stats (cached, 5-min TTL)
- `GET /api/admin/dashboard/alerts` — active alerts with severity levels
- `GET /api/admin/dashboard/activity` — recent platform-wide activity (paginated)
- `GET /api/admin/dashboard/health` — system health check (aggregated from services)

**Database Queries**:
```javascript
// Active users count
db.users.countDocuments({ status: 'active', role: 'student' })
// Institutions created this month
db.institutions.countDocuments({ created_at: { $gte: startOfMonth } })
// Pending verifications
db.institutions.countDocuments({ verification_status: 'pending' })
// Events live today
db.events.countDocuments({ status: 'LIVE', start_date: { $lte: today }, end_date: { $gte: today } })
// Email queue depth
db.email_queue.countDocuments({ status: 'pending' })
// Recent audit trail
db.audit_logs.find().sort({ timestamp: -1 }).limit(20)
```

**UI Components**: KPI cards, line/bar charts (Chart.js/Recharts), activity feed list, alert banners, mini-map, health status badges (green/yellow/red).

**Edge Cases**: Cache invalidation on rapid changes, graceful degradation when MongoDB is slow, timezone handling for "today" calculations.

---

### MODULE 2: Institution Management

**Purpose**: Full lifecycle management of all institutions on the platform.

**Features**:
- **List all institutions** — search by name, email, domain, status. Filter by verification status, plan tier, date range.
- **Institution detail view** — profile info, events created, total participants across events, judge count, submission volume, revenue contributed.
- **Verification workflow** — review institution signup, approve/reject with reason, request additional documents.
- **Edit institution** — super admin can update any field (name, email, domain, logo).
- **Suspend/Block** — block institution with reason, duration (temporary/permanent), auto-disable all their events.
- **Impersonate** — login as institution admin for support/debugging (audit-logged).
- **Data export** — export all institution data as CSV/JSON.
- **Plan management** — assign/change subscription plan, track billing history.
- **Activity log** — per-institution audit trail (all admin actions, event changes, user management).

**Workflows**:

```
Institution Signup → PENDING_VERIFICATION
    ├── Verify → VERIFIED → Active
    ├── Reject → REJECTED (with reason, can reapply)
    └── Request Docs → AWAITING_DOCS → Verify or Reject

Active Institution
    ├── Suspend (with reason) → SUSPENDED
    │   └── Reinstate → ACTIVE
    └── Terminate → TERMINATED (permanent)
```

**Backend Requirements**:
- `GET /api/admin/institutions` — paginated list, filters
- `GET /api/admin/institutions/{id}` — full detail
- `PATCH /api/admin/institutions/{id}/verify` — approve/reject with reason
- `PATCH /api/admin/institutions/{id}/status` — suspend/activate/terminate
- `GET /api/admin/institutions/{id}/events` — all events for this institution
- `GET /api/admin/institutions/{id}/activity` — audit trail scoped to institution
- `POST /api/admin/institutions/{id}/impersonate` — generate impersonation token (5-min expiry)
- `GET /api/admin/institutions/{id}/export` — download institution data

**Database Entities**:
```javascript
// New fields for institutions collection
{
  _id: ObjectId,
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended' | 'terminated',
  verification_notes: String,              // admin notes on verification
  verified_by: ObjectId,                   // super_admin who verified
  verified_at: DateTime,
  suspension: {
    is_suspended: Boolean,
    reason: String,
    suspended_by: ObjectId,
    suspended_at: DateTime,
    duration: 'temporary' | 'permanent',
    lift_at: DateTime | null,             // auto-unblock date
  },
  plan: {
    tier: 'free' | 'basic' | 'pro' | 'enterprise',
    valid_until: DateTime,
    subscription_id: String,
  },
  stats: {
    total_events: Number,
    total_participants: Number,
    total_judges: Number,
    last_active: DateTime,
  }
}
```

**Security Controls**:
- Impersonation tokens auto-expire (5 min), logged to audit
- Suspend action cascade: auto-disables all LIVE events for that institution
- Only super_admin can modify institution verification status
- All status changes require a `reason` field (mandatory for audit)
- Re-activation triggers review of all previously suspended events

**UI Components**: DataTable with search/filter, detail slide-over panel, status badge, action dropdown, confirmation dialogs, impersonation warning banner, activity timeline.

**Edge Cases**:
- Institution with active events cannot be deleted, only suspended
- Suspended institution's participants should be notified
- Rejected institutions should not be able to create new signup with same email
- Impersonation must show a prominent "You are acting as..." banner

---

### MODULE 3: User Management (Students & All Roles)

**Purpose**: Complete user lifecycle management across all roles.

**Features**:
- **Universal user list** — all users across all roles, search by name/email/role/status
- **User detail** — profile, registrations, submissions, certificates, activity history, login history
- **Role management** — change user role (student → institution, etc.), with audit trail
- **Block/Suspend** — block user with reason, duration, auto-cascade (disable active registrations)
- **Unblock** — lift suspension, optionally notify user via email
- **Impersonate** — login as user for support (audit-logged, 5-min expiry)
- **Force password reset** — trigger password reset email for user
- **View as user** — see what the user sees (read-only preview of their dashboard)
- **Bulk actions** — block/unblock multiple users, export user data, send bulk notification
- **Login history** — IP addresses, devices, failed attempts, geo-location

**Workflows**:

```
User Reports Issue → Super Admin Views Profile
    ├── Suspend Account → Reason & Duration → User Notified
    ├── Force Reset Password → Email Sent → User Must Change
    ├── Change Role → Confirmation → Audit Logged → User Notified
    └── Impersonate → 5-min Token → Session Logged

User Appeals → Super Admin Reviews
    ├── Accept Appeal → Unblock → User Notified
    └── Reject Appeal → Reason Given → User Notified
```

**Backend Requirements**:
- `GET /api/admin/users` — paginated list with filters (role, status, date range)
- `GET /api/admin/users/{id}` — full user detail with stats
- `PATCH /api/admin/users/{id}/role` — change user role
- `PATCH /api/admin/users/{id}/status` — block/unblock with reason
- `POST /api/admin/users/{id}/impersonate` — generate impersonation token
- `POST /api/admin/users/{id}/force-reset` — trigger password reset
- `GET /api/admin/users/{id}/activity` — user activity timeline
- `GET /api/admin/users/{id}/login-history` — login attempts
- `POST /api/admin/users/bulk-action` — bulk status change
- `POST /api/admin/users/{id}/notify` — send direct notification

**Database Entities**:
```javascript
// New fields for users collection
{
  _id: ObjectId,
  status: 'active' | 'suspended' | 'deactivated',
  suspension: {
    is_suspended: Boolean,
    reason: String,
    suspended_by: ObjectId,
    suspended_at: DateTime,
    duration: 'temporary' | 'permanent',
    lift_at: DateTime | null,
    appeal: {
      filed_at: DateTime,
      message: String,
      status: 'pending' | 'approved' | 'rejected',
      resolved_by: ObjectId | null,
      resolved_at: DateTime | null,
      resolution_note: String,
    }
  },
  login_history: [
    {
      ip: String,
      user_agent: String,
      device: String,
      location: String,
      timestamp: DateTime,
      success: Boolean,
      fail_reason: String | null,
    }
  ],
  flags: [String],              // automated flags (multiple_accounts, suspicious_activity, etc.)
  verified: Boolean,
  notes: String,                // super admin internal notes
}
```

**Security Controls**:
- Role changes require confirmation with reason
- Blocking a user auto-cancels their active registrations and ongoing assessments
- Impersonation sessions are clearly marked in UI with "Stop Impersonating" button
- Unblock requires checking if the user's appeal/issue is resolved
- Bulk actions are logged per-user, not as a single audit entry

---

### MODULE 4: Event Governance

**Purpose**: Cross-institution event monitoring, moderation, and enforcement.

**Features**:
- **Global event list** — all events across all institutions, search/filter by status, institution, type, date
- **Event detail** — full event data, participants, submissions, scores, leaderboard
- **Force status change** — override event lifecycle status (force close submissions, force results)
- **Moderate content** — edit/remove inappropriate event descriptions, titles, or assets
- **Cancel event** — force-cancel an event with reason, notify all participants
- **Feature event** — promote events to platform-wide featured list
- **Event audit** — full modification history for any event
- **Clone event** — super admin can clone an event for debugging/templates
- **Cross-institution search** — search submissions, participants across all events
- **Integrity validation** — detect score anomalies, unusual submission patterns
- **Deadline enforcement override** — extend/shorten deadlines for specific events

**Workflows**:

```
Event Reported → Super Admin Reviews
    ├── Warn Institution → Written Notice
    ├── Edit Content → Remove Inappropriate Material
    ├── Cancel Event → Reason Required → All Participants Notified
    └── No Action Needed → Dismiss Report

Event Lifecycle Intervention:
    Institution Requests Deadline Extension → Super Admin Reviews
        ├── Approve → Update Event Timeline → Audit Logged
        └── Reject → Reason Given
```

**Backend Requirements**:
- `GET /api/admin/events` — global event list with filters
- `GET /api/admin/events/{id}` — full event detail
- `PATCH /api/admin/events/{id}/status` — force lifecycle transition
- `PATCH /api/admin/events/{id}/moderate` — edit event content (moderation)
- `PATCH /api/admin/events/{id}/deadline` — override deadlines
- `POST /api/admin/events/{id}/cancel` — cancel with reason notification
- `POST /api/admin/events/{id}/feature` — toggle featured status
- `GET /api/admin/events/{id}/audit` — event modification history
- `GET /api/admin/events/{id}/integrity` — integrity check scores

**Database Entities**: No new entities — extends existing `events` collection with:
```javascript
{
  // Existing fields plus:
  moderated: Boolean,
  moderated_by: ObjectId,
  moderated_at: DateTime,
  moderation_notes: String,
  featured: Boolean,
  featured_at: DateTime,
  force_overrides: {
    deadline_extended: DateTime | null,
    status_override: String | null,
    override_by: ObjectId,
    override_reason: String,
  },
  flags: [String],          // 'inappropriate_content', 'fraudulent', 'rule_violation'
}
```

**Security Controls**:
- Force status change must respect forward-only lifecycle (no going back without reason)
- Cancelling an event triggers notification cascade to ALL participants
- Content moderation only hides/shows fields, doesn't delete from DB
- Featured events have a duration limit (auto-unfeature after event ends)
- Deadline extension is logged with before/after values

---

### MODULE 5: Judge Oversight

**Purpose**: Monitor and manage all judges across the platform.

**Features**:
- **Global judge list** — all judges, their assigned events, completion rates
- **Judge detail** — profile, score history, average score, completion %, events judged
- **Score integrity** — detect outlier scoring (consistently too high/low, no variance)
- **Unassign judge** — remove judge from event, reassign submissions
- **Disable judge** — suspend judge account, notify affected institutions
- **Judge performance analytics** — average time to judge, score distribution, reliability metrics
- **Bias detection** — flag judges who score their own institution higher
- **Conflict of interest** — detect judges assigned to events where they have students registered

**Backend Requirements**:
- `GET /api/admin/judges` — global judge list with stats
- `GET /api/admin/judges/{id}` — judge detail with performance metrics
- `GET /api/admin/judges/{id}/scores` — score distribution analysis
- `PATCH /api/admin/judges/{id}/disable` — suspend judge
- `POST /api/admin/judges/{id}/unassign/{event_id}` — remove from event
- `GET /api/admin/judges/bias-detection` — automated bias reports
- `GET /api/admin/judges/anomalies` — scoring anomalies

**Security Controls**:
- Disabling a judge notifies all institutions that have them assigned
- Score data is never deleted, only flagged
- Bias reports are generated asynchronously
- Judge suspension should trigger re-evaluation of their scored submissions if flagged

---

### MODULE 6: Submission & Score Integrity

**Purpose**: Detect fraud, plagiarism, and anomalies in submissions and scoring.

**Features**:
- **Global submission view** — search submissions across all events, institutions
- **Score distribution analytics** — histograms, outlier detection, grade inflation flags
- **Submission audit** — full submission history (who submitted when, edits, IPs)
- **Flag suspicious submissions** — manual flagging by super admin
- **Bulk re-evaluation trigger** — force re-score of flagged submissions
- **Plagiarism dashboard** — (future scope) automated similarity detection
- **Score override** — super admin can adjust scores with audit trail (but marked as "admin adjusted")
- **Export raw data** — download submission/scores for external analysis

**Backend Requirements**:
- `GET /api/admin/submissions` — global search with filters
- `GET /api/admin/submissions/{id}` — full submission detail with versions
- `GET /api/admin/submissions/anomalies` — automated anomaly detection
- `PATCH /api/admin/submissions/{id}/score` — override score (marked as admin)
- `POST /api/admin/submissions/{id}/flag` — flag submission for review
- `GET /api/admin/submissions/{id}/audit` — submission modification history
- `POST /api/admin/submissions/export` — bulk data export

**Database Entities**:
```javascript
// New: score_overrides collection
{
  submission_id: ObjectId,
  original_score: Number,
  new_score: Number,
  reason: String,
  overridden_by: ObjectId,
  overridden_at: DateTime,
  event_id: ObjectId,
  institution_id: ObjectId,
}

// New: submission_flags collection
{
  submission_id: ObjectId,
  flag_type: 'plagiarism' | 'suspicious' | 'policy_violation' | 'admin_review',
  flagged_by: ObjectId,
  flagged_at: DateTime,
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed',
  notes: String,
  resolved_by: ObjectId | null,
  resolved_at: DateTime | null,
}
```

---

### MODULE 7: Platform Moderation

**Purpose**: Content review and enforcement across all user-generated content.

**Features**:
- **Content queue** — unmoderated content across events, opportunities, blogs, comments
- **Reported content** — user-flagged content with reason, reporter info
- **Quick actions** — approve, reject, edit, remove, flag for review
- **Content types** — event descriptions, opportunity posts, blog comments, user profiles, team names
- **Auto-moderation rules** — keyword blacklist, URL filtering, profanity detection
- **Moderation history** — per-content audit trail
- **Bulk moderation** — batch approve/reject for trusted institutions
- **Appeal handling** — users can appeal content removal

**Workflows**:

```
Content Created → Auto-Moderation Check
    ├── Passes → Auto-Approved (trusted sources)
    ├── Flags Keywords → PENDING_REVIEW → Super Admin Reviews
    │   ├── Approve → Published
    │   └── Reject → Removed + Notify Creator
    └── Violates Policy → Auto-Rejected

User Reports Content → Moderation Queue
    Super Admin Reviews:
        ├── Remove Content → Notify Creator + Reporter
        ├── Dismiss Report → Notify Reporter
        └── Warn Creator → Warning Issued
```

**Backend Requirements**:
- `GET /api/admin/moderation/queue` — unmoderated content
- `GET /api/admin/moderation/reports` — user-reported content
- `PATCH /api/admin/moderation/{id}/approve` — approve content
- `PATCH /api/admin/moderation/{id}/reject` — reject with reason
- `PATCH /api/admin/moderation/{id}/edit` — edit content before approval
- `POST /api/admin/moderation/rules` — manage auto-moderation rules
- `GET /api/admin/moderation/history` — moderation action history
- `POST /api/admin/moderation/bulk` — batch actions

**Database Entities**:
```javascript
// New: moderation_queue collection
{
  content_type: 'event_description' | 'opportunity' | 'blog' | 'comment' | 'profile' | 'team_name',
  content_id: ObjectId,
  content_snippet: String,          // first 200 chars
  author_id: ObjectId,
  author_role: String,
  status: 'pending' | 'approved' | 'rejected' | 'flagged',
  auto_moderation_result: {
    passed: Boolean,
    flags: [String],                // 'profanity', 'url', 'blacklist'
    confidence: Number,
  },
  moderated_by: ObjectId | null,
  moderated_at: DateTime | null,
  moderation_notes: String,
  reports: [
    {
      reporter_id: ObjectId,
      reason: String,
      reported_at: DateTime,
    }
  ],
}
```

---

### MODULE 8: Analytics & Intelligence

**Purpose**: Platform-wide data insights for strategic decision making.

**Features**:
- **User Growth** — signups per day/week/month, churn rate, active users, retention cohorts
- **Institution Growth** — new institutions, verification funnel (signed up → verified → active)
- **Event Performance** — events created vs completed, average participants per event, submission rate
- **Engagement Metrics** — DAU/MAU, session duration, page views, feature adoption
- **Revenue Analytics** — MRR, ARPU, conversion by plan tier, churn by institution
- **Geographic Distribution** — users/institutions by region, college tier distribution
- **Content Analytics** — most viewed events, popular categories, search trends
- **System Performance** — API latency p50/p95/p99, error rate, queue depths, DB query times
- **Export** — all reports downloadable as CSV/PDF
- **Custom Date Ranges** — compare periods (MoM, YoY)

**Backend Requirements**:
- `GET /api/admin/analytics/overview` — summary KPIs
- `GET /api/admin/analytics/users` — user analytics with time series
- `GET /api/admin/analytics/events` — event performance analytics
- `GET /api/admin/analytics/engagement` — DAU/MAU, session metrics
- `GET /api/admin/analytics/revenue` — revenue breakdown
- `GET /api/admin/analytics/geography` — geographic distribution
- `GET /api/admin/analytics/system` — system performance metrics
- `POST /api/admin/analytics/export` — generate report
- `GET /api/admin/analytics/reports` — saved report list

**Caching Strategy**: 
- Real-time dashboards: 5-min cache
- Historical analytics: materialized aggregation pipeline (daily rollups)
- Export reports: generated async, stored as PDF, notified when ready

---

### MODULE 9: Fraud Detection System

**Purpose**: Automated detection of suspicious activity across the platform.

**Features**:
- **Rule engine** — configurable detection rules:
  - Multiple accounts from same IP
  - Same institution creating events and student accounts
  - Score manipulation (sudden spikes, identical scores across submissions)
  - Registration farming (same user registering for 50+ events in 1 hour)
  - Copy-paste submissions (identical submission content)
  - Login anomalies (unusual geo, multiple failed attempts)
- **Alert dashboard** — real-time fraud alerts with severity, timestamp, evidence
- **Case management** — assign alert to super admin, track investigation, resolve
- **Auto-actions** — configurable: auto-flag, auto-suspend, auto-notify
- **Whitelist** — allowlist for trusted IPs/institutions to reduce false positives
- **Rule configuration** — enable/disable rules, adjust thresholds
- **Alert history** — resolved cases, false positives, actions taken

**Detection Rules (MVP)**:

| Rule | Trigger | Action |
|------|---------|--------|
| Rapid registration | >20 events in 1 hour | Flag user |
| Duplicate accounts | Same email hash, different emails | Flag user |
| Score anomaly | >3 std deviations from mean | Flag submission |
| Bulk submission | Same content across 5+ submissions | Flag all |
| Login anomaly | Different geo within 1 hour | Flag + email verify |
| Institution self-scoring | Judge from institution A scoring institution A students | Flag judge |
| API abuse | >1000 requests/minute | Rate limit then suspend |

**Backend Requirements**:
- `GET /api/admin/fraud/alerts` — active alerts
- `GET /api/admin/fraud/alerts/{id}` — alert detail with evidence
- `PATCH /api/admin/fraud/alerts/{id}` — resolve/dismiss with notes
- `GET /api/admin/fraud/rules` — list detection rules
- `PATCH /api/admin/fraud/rules/{id}` — enable/disable/adjust threshold
- `POST /api/admin/fraud/whitelist` — manage allowlist
- `GET /api/admin/fraud/history` — past alerts with resolution

**Database Entities**:
```javascript
// New: fraud_alerts collection
{
  alert_type: 'rapid_registration' | 'duplicate_account' | 'score_anomaly' | 'bulk_submission' | 'login_anomaly' | 'self_scoring' | 'api_abuse',
  severity: 'low' | 'medium' | 'high' | 'critical',
  status: 'open' | 'investigating' | 'resolved' | 'false_positive',
  target_type: 'user' | 'institution' | 'submission' | 'judge',
  target_id: ObjectId,
  evidence: {
    ip_addresses: [String],
    timestamps: [DateTime],
    details: Mixed,           // rule-specific evidence data
    supporting_docs: [String], // reference IDs to related entities
  },
  rule_id: ObjectId,
  auto_action: 'none' | 'flag' | 'suspend' | 'notify',
  assigned_to: ObjectId | null,
  assigned_at: DateTime | null,
  resolved_by: ObjectId | null,
  resolved_at: DateTime | null,
  resolution_notes: String,
  created_at: DateTime,
  expires_at: DateTime | null,   // auto-dismiss after X days if no action
}

// New: fraud_rules collection
{
  rule_name: String,
  rule_type: String,
  enabled: Boolean,
  threshold: Number,
  cooldown_minutes: Number,     // prevent alert spam
  auto_action: 'none' | 'flag' | 'suspend' | 'notify',
  severity: 'low' | 'medium' | 'high' | 'critical',
  created_at: DateTime,
  updated_at: DateTime,
}
```

---

### MODULE 10: Audit Log System

**Purpose**: Immutable record of every admin action for security, compliance, and debugging.

**Features**:
- **Action recording** — every admin action logged with: who, what, when, target, before/after state
- **Search & filter** — by actor, target, action type, date range, resource type
- **Timeline view** — chronological activity for a specific user/institution/event
- **Diff viewer** — see before/after state changes for edits
- **Export** — download audit logs as CSV for compliance
- **Retention policy** — configurable TTL (90 days default, 1 year for critical actions)
- **Real-time streaming** — WebSocket feed for live audit events (admin dashboard widget)
- **Tamper detection** — hash chain for critical logs (optional, HMAC-signed entries)

**Backend Requirements**:
- `POST /api/admin/audit/log` — internal API to write logs (used by other modules)
- `GET /api/admin/audit/logs` — searchable, filterable audit log list
- `GET /api/admin/audit/logs/{id}` — single log detail with diff
- `GET /api/admin/audit/logs/export` — CSV export
- `GET /api/admin/audit/stats` — audit volume statistics

**Database Schema**:
```javascript
{
  _id: ObjectId,
  timestamp: DateTime,              // indexed, sorted
  actor_id: ObjectId,
  actor_role: String,
  actor_email: String,
  
  action: 'create' | 'update' | 'delete' | 'block' | 'unblock' | 'suspend' | 'approve' | 'reject' | 'impersonate' | 'login' | 'export' | 'override',
  
  resource_type: 'user' | 'institution' | 'event' | 'submission' | 'judge' | 'opportunity' | 'certificate' | 'payment' | 'config' | 'role',
  resource_id: ObjectId,
  resource_description: String,     // human-readable summary
  
  changes: {                        // for update actions
    before: Mixed,                  // partial snapshot
    after: Mixed,                   // partial snapshot
  },
  
  metadata: {
    ip_address: String,
    user_agent: String,
    session_id: String,
    request_id: String,            // trace across microservices
  },
  
  reason: String,                   // mandatory for sensitive actions
  severity: 'info' | 'warning' | 'critical',
  
  signature: String | null,         // HMAC for tamper detection (future)
  
  ttl_expiry: DateTime,             // TTL index for auto-cleanup
}
```

**Indexes**: `(timestamp, -1)`, `(actor_id, timestamp)`, `(resource_type, resource_id)`, `(action, timestamp)`, TTL on `ttl_expiry`.

---

### MODULE 11: Dispute Resolution & Appeals

**Purpose**: Structured workflow for handling user appeals, complaints, and disputes.

**Features**:
- **Appeal intake** — users file appeals against blocks/suspensions/content removal
- **Case creation** — appeals auto-create cases with severity
- **Case detail** — full context: user history, evidence, related events, previous actions
- **Resolution workflow** — investigate, escalate, resolve, dismiss
- **Communication** — send messages to appellant, add internal notes
- **Escalation matrix** — automatic escalation to senior admin if not resolved in X hours
- **SLAs** — configurable resolution time targets per severity
- **Template responses** — reusable resolution messages
- **Case statistics** — volume, resolution rate, average time, common categories

**Workflows**:

```
User Files Appeal → Case Created:
    Status: OPEN → Severity Assessment
        ├── Low → Super Admin Reviews → Resolved/Dismissed
        ├── Medium → Investigation → Evidence Review → Decision
        └── High → Immediate Escalation → Senior Review → Decision
    
    Resolution:
        ├── Appeal Accepted → Action Reversed (unblock, restore content) → User Notified
        ├── Appeal Partially Accepted → Modified Action → User Notified
        └── Appeal Rejected → Reason Given → Case Closed (can re-appeal after 30 days)
```

**Backend Requirements**:
- `POST /api/admin/disputes/appeal` — file an appeal (public endpoint)
- `GET /api/admin/disputes` — list all cases
- `GET /api/admin/disputes/{id}` — case detail
- `PATCH /api/admin/disputes/{id}/status` — update case status
- `POST /api/admin/disputes/{id}/message` — add message to case
- `POST /api/admin/disputes/{id}/resolve` — resolve with outcome
- `GET /api/admin/disputes/stats` — case statistics
- `GET /api/admin/disputes/escalations` — pending escalations

**Database Entities**:
```javascript
// New: disputes collection
{
  _id: ObjectId,
  appellant_id: ObjectId,
  appellant_role: String,
  appellant_email: String,
  
  dispute_type: 'suspension' | 'content_removal' | 'score_dispute' | 'account_issue' | 'other',
  subject: String,
  description: String,
  evidence: [String],               // attachment URLs
  related_entity_type: String | null,
  related_entity_id: ObjectId | null,
  
  severity: 'low' | 'medium' | 'high',
  status: 'open' | 'investigating' | 'escalated' | 'resolved' | 'dismissed',
  
  assigned_to: ObjectId | null,
  assigned_at: DateTime | null,
  sla_deadline: DateTime,
  
  messages: [
    {
      author_id: ObjectId,
      author_role: String,
      content: String,
      is_internal: Boolean,         // super admin only notes
      attachments: [String],
      created_at: DateTime,
    }
  ],
  
  resolution: {
    outcome: 'accepted' | 'partial' | 'rejected',
    action_taken: String,
    note: String,
    resolved_by: ObjectId,
    resolved_at: DateTime,
  },
  
  escalated_to: ObjectId | null,
  escalated_at: DateTime | null,
  escalation_reason: String,
  
  created_at: DateTime,
  updated_at: DateTime,
}
```

---

### MODULE 12: Notification Control Center

**Purpose**: Centralized management of all platform communications.

**Features**:
- **Broadcast notifications** — send to all users, all institutions, all judges, or role-specific
- **Targeted campaigns** — filter by role, event participation, institution, date joined
- **Templates** — manage push notification templates
- **Email templates** — HTML email template editor (Drag & drop or raw HTML)
- **Schedule** — schedule notifications for future delivery
- **Delivery analytics** — sent count, opened %, clicked %, failed, bounced
- **WebSocket broadcast** — real-time live notification push
- **Rate limiting** — prevent notification spam (max X per user per day)
- **Digest mode** — aggregate non-urgent notifications into daily/weekly digest

**Backend Requirements**:
- `GET /api/admin/notifications/templates` — list notification templates
- `POST /api/admin/notifications/templates` — create/update template
- `POST /api/admin/notifications/broadcast` — send to filtered audience
- `POST /api/admin/notifications/schedule` — schedule future notification
- `GET /api/admin/notifications/delivery` — delivery stats
- `GET /api/admin/notifications/history` — past broadcast history
- `GET /api/admin/notifications/templates/{id}` — preview template
- `GET /api/admin/notifications/stats` — aggregate notification metrics

**Database Entities**:
```javascript
// New: notification_templates collection
{
  name: String,
  type: 'push' | 'email' | 'in_app',
  category: 'system' | 'event' | 'account' | 'marketing',
  subject: String,                    // for email
  body: String,                       // template with {{placeholders}}
  variables: [String],                // expected placeholder vars
  created_by: ObjectId,
  created_at: DateTime,
  updated_at: DateTime,
}

// New: notification_broadcasts collection
{
  audience_filter: {
    roles: [String],
    institution_ids: [ObjectId],
    event_ids: [ObjectId],
    date_joined_before: DateTime | null,
    date_joined_after: DateTime | null,
  },
  channels: ['push', 'email', 'in_app'],
  template_id: ObjectId,
  custom_message: String,
  scheduled_for: DateTime | null,
  sent_at: DateTime | null,
  sent_by: ObjectId,
  
  delivery_stats: {
    total_targeted: Number,
    delivered: Number,
    failed: Number,
    opened: Number,
    clicked: Number,
  },
  
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed',
  created_at: DateTime,
}
```

---

### MODULE 13: Platform Health & Performance

**Purpose**: Monitor system health, performance, and reliability.

**Features**:
- **Service status** — API server, MongoDB, email queue, background workers, external APIs
- **API performance** — request volume, latency p50/p95/p99, error rate by endpoint
- **Email queue monitoring** — queue depth, processing rate, failure rate, retry count
- **Error tracking** — recent 500 errors, stack traces, frequency
- **Database performance** — query count, slow queries (if MongoDB profiler enabled), connection pool
- **Uptime tracking** — 24h/7d/30d uptime, last restart
- **Resource usage** — memory, CPU, disk (if server monitoring available)
- **Alert configuration** — set thresholds for service degradation alerts
- **Incident log** — track downtime, root cause, resolution

**Backend Requirements**:
- `GET /api/admin/health/services` — service status check
- `GET /api/admin/health/performance` — API performance metrics
- `GET /api/admin/health/errors` — recent error log
- `GET /api/admin/health/email-queue` — email queue status
- `GET /api/admin/health/database` — DB performance metrics
- `GET /api/admin/health/uptime` — uptime statistics
- `POST /api/admin/health/alerts` — configure alert thresholds

**Security Controls**:
- Health endpoints return only aggregated metrics, no PII
- Auto-scaling recommendations based on usage trends
- Health status cached (30s) to avoid thundering herd

---

### MODULE 14: Security Monitoring

**Purpose**: Detect and respond to security threats.

**Features**:
- **Login monitoring** — failed login attempts, unusual geo patterns, brute force detection
- **API abuse monitoring** — rate limit violations by user/IP, suspicious request patterns
- **Token management** — view active sessions, revoke tokens, force logout all sessions
- **IP blocklist** — block IPs or IP ranges, with reason and duration
- **User agent analysis** — detect unusual user agents, bot activity
- **Suspicious email changes** — flag email changes followed by password change
- **Data access monitoring** — detect unusual data export/download patterns
- **Security score** — per-user security score based on behavior patterns

**Backend Requirements**:
- `GET /api/admin/security/login-attempts` — failed login log
- `GET /api/admin/security/rate-limits` — rate limit violations
- `GET /api/admin/security/tokens` — active sessions
- `POST /api/admin/security/revoke-token/{id}` — revoke specific session
- `POST /api/admin/security/force-logout/{user_id}` — revoke all user sessions
- `GET /api/admin/security/ip-blocklist` — blocked IPs
- `POST /api/admin/security/ip-blocklist` — add IP to blocklist
- `GET /api/admin/security/threats` — active threat list

**Database Entities**:
```javascript
// New: security_events collection
{
  event_type: 'failed_login' | 'rate_limit' | 'suspicious_ip' | 'email_change' | 'bulk_export' | 'token_revoked',
  severity: 'info' | 'warning' | 'critical',
  user_id: ObjectId | null,
  ip_address: String,
  user_agent: String,
  geo: {
    country: String,
    city: String,
  },
  details: Mixed,
  blocked: Boolean,
  created_at: DateTime,
}

// New: ip_blocklist collection
{
  ip: String,
  ip_range: String | null,         // CIDR notation
  reason: String,
  blocked_by: ObjectId,
  blocked_at: DateTime,
  expires_at: DateTime | null,
  is_active: Boolean,
}
```

---

### MODULE 15: Role & Permission Engine

**Purpose**: Manage user roles and fine-grained permissions.

**Features**:
- **Role list** — all defined roles with descriptions
- **Create custom roles** — define new roles with specific permissions
- **Permission matrix** — checkboxes for each permission per role
- **User-role assignment** — assign/remove roles for individual users
- **Bulk role assignment** — assign roles by filters (e.g., all users from an institution)
- **Permission audit** — who changed what permissions and when
- **Role hierarchy** — configure inheritance (e.g., institution_admin inherits from base_user)
- **Scope limits** — set limits per role (max events, max submissions, etc.)

**Permission Definitions**:

| Permission Code | Description |
|----------------|-------------|
| `users.read` | View user list |
| `users.create` | Create users |
| `users.update` | Edit user profiles |
| `users.delete` | Delete users |
| `users.block` | Suspend/block users |
| `users.impersonate` | Login as user |
| `institutions.read` | View institutions |
| `institutions.create` | Create institutions |
| `institutions.update` | Edit institutions |
| `institutions.verify` | Verify institution signups |
| `institutions.block` | Suspend institutions |
| `events.read` | View all events |
| `events.update` | Edit any event |
| `events.cancel` | Force-cancel events |
| `events.moderate` | Moderate event content |
| `submissions.read` | View all submissions |
| `submissions.score` | Override scores |
| `judges.manage` | Assign/unassign judges |
| `judges.disable` | Suspend judges |
| `analytics.read` | View analytics |
| `analytics.export` | Export data |
| `logs.read` | View audit logs |
| `settings.update` | Change platform settings |
| `notifications.broadcast` | Send broadcast notifications |
| `roles.manage` | Create/edit roles |
| `fraud.manage` | Manage fraud alerts |
| `disputes.manage` | Handle disputes |

**Backend Requirements**:
- `GET /api/admin/roles` — list all roles
- `POST /api/admin/roles` — create custom role
- `PATCH /api/admin/roles/{id}` — update role permissions
- `PATCH /api/admin/users/{id}/roles` — assign roles to user
- `GET /api/admin/permissions` — list all permissions
- `GET /api/admin/users/{id}/effective-permissions` — calculate user's effective permissions

**Database Entities**:
```javascript
// New: roles collection
{
  name: String,                     // unique slug
  display_name: String,
  description: String,
  is_system_role: Boolean,          // cannot be deleted
  permissions: [String],            // array of permission codes
  inherits_from: [ObjectId],        // role hierarchy
  scope_limits: {
    max_events: Number | null,
    max_judges: Number | null,
    max_students: Number | null,
  },
  created_by: ObjectId,
  created_at: DateTime,
  updated_at: DateTime,
}
```

---

### MODULE 16: Platform Configuration

**Purpose**: Centralized platform-wide settings and feature controls.

**Features**:
- **Feature toggles** — enable/disable features globally:
  - `registration_open` — allow new user signups
  - `institution_signup_open` — allow new institution signups
  - `event_creation_enabled` — allow institutions to create events
  - `judge_registration_enabled` — allow judge signups
  - `submissions_enabled` — allow submissions globally
  - `live_chat_enabled` — toggle live chat
  - `ai_features_enabled` — toggle AI features
  - `gamification_enabled` — toggle badges/leaderboards
- **Maintenance mode** — disable all user-facing functionality, show maintenance page
- **System limits** — max file upload size, max event duration, max team size, etc.
- **Rate limiting configuration** — global and per-endpoint rate limits
- **Email settings** — SMTP configuration, daily send limits
- **Security settings** — password policy (min length, complexity), session timeout
- **Integration keys** — manage API keys for third-party services
- **Storage settings** — file storage limits, allowed file types
- **Localization** — default language, timezone, date format, currency

**Backend Requirements**:
- `GET /api/admin/settings` — get all settings (grouped by category)
- `PATCH /api/admin/settings` — update settings
- `GET /api/admin/settings/{key}` — get specific setting
- `PATCH /api/admin/settings/{key}` — update specific setting
- `POST /api/admin/settings/maintenance` — toggle maintenance mode
- `GET /api/admin/settings/history` — setting change history

**Database Entities**:
```javascript
// New: platform_config collection
{
  _id: ObjectId,
  category: 'general' | 'security' | 'features' | 'email' | 'limits' | 'integrations' | 'localization',
  key: String,                      // unique slug
  value: Mixed,                     // can be string, number, boolean, object
  type: 'string' | 'number' | 'boolean' | 'json',
  description: String,
  is_public: Boolean,               // exposed to public endpoints
  updated_by: ObjectId,
  updated_at: DateTime,
}
```

---

### MODULE 17: Certificate Oversight

**Purpose**: Monitor and manage certificate generation across the platform.

**Features**:
- **Certificate templates** — view all certificate templates across institutions
- **Bulk generation** — trigger certificate generation for any event
- **Revoke certificate** — revoke a certificate with reason (mark as invalid)
- **Verification log** — see who verified which certificate and when
- **Template quality review** — flag templates that don't meet platform standards
- **Generation status** — monitor async cert generation jobs (success/failure/pending)

**Backend Requirements**:
- `GET /api/admin/certificates/templates` — all templates
- `GET /api/admin/certificates` — all generated certificates
- `POST /api/admin/certificates/revoke/{id}` — revoke certificate
- `GET /api/admin/certificates/jobs` — generation job status
- `GET /api/admin/certificates/verification-log` — verification attempts

---

### MODULE 18: Content Management System

**Purpose**: Manage platform-wide content (homepage, blogs, landing pages).

**Features**:
- **Homepage editor** — manage featured events, banners, announcements
- **Blog management** — approve/reject/feature blog posts
- **Landing page sections** — manage "About", "How it Works", "Pricing" content
- **Media library** — manage uploaded images, logos, documents
- **SEO management** — meta titles, descriptions for public pages
- **Announcements bar** — create dismissible announcement bars (maintenance, new features)

**Backend Requirements**:
- `GET /api/admin/cms/homepage` — homepage configuration
- `PATCH /api/admin/cms/homepage` — update homepage sections
- `GET /api/admin/cms/blogs` — blog management with moderation status
- `PATCH /api/admin/cms/blogs/{id}` — approve/reject/feature blog
- `POST /api/admin/cms/announcements` — create announcement
- `DELETE /api/admin/cms/announcements/{id}` — remove announcement

---

### MODULE 19: Payment & Subscription Management

**Purpose**: Handle platform monetization, billing, and subscriptions.

**Features**:
- **All transactions** — view all Razorpay payment transactions
- **Subscription plans** — define/manage plan tiers (free, basic, pro, enterprise)
- **Invoice management** — generate/email invoices
- **Refund processing** — initiate refunds through Razorpay
- **Institution billing** — per-institution billing history, payment method
- **Usage-based billing** — track usage (events created, participants) for overage billing
- **Discount codes** — create/manage promotional discount codes
- **Revenue reports** — MRR, ARPU, churn, LTV, revenue by plan
- **Failed payment handling** — grace period, notification, downgrade

**Backend Requirements**:
- `GET /api/admin/payments` — all transactions with filters
- `GET /api/admin/payments/{id}` — transaction detail
- `POST /api/admin/payments/{id}/refund` — process refund
- `GET /api/admin/payments/plans` — subscription plans
- `POST /api/admin/payments/plans` — create/edit plan
- `GET /api/admin/payments/invoices` — invoice history
- `POST /api/admin/payments/invoices/{id}/send` — email invoice
- `GET /api/admin/payments/revenue` — revenue analytics
- `POST /api/admin/payments/discounts` — create discount code
- `PATCH /api/admin/institutions/{id}/plan` — change institution plan

---

### MODULE 20: API & Integration Management

**Purpose**: Manage platform APIs, third-party integrations, and webhooks.

**Features**:
- **API keys** — generate/revoke API keys for integrations
- **Webhook management** — configure outgoing webhooks (events triggered → POST to URL)
- **Integration status** — status of all external service connections (email, payment, AI, storage)
- **Rate limit management** — configure rate limits per API key
- **API documentation** — built-in Swagger/ReDoc link
- **Usage analytics** — requests per API key, endpoints called, error rates
- **Webhook logs** — delivery status, retry history, payload replay

**Backend Requirements**:
- `GET /api/admin/integrations/api-keys` — list API keys
- `POST /api/admin/integrations/api-keys` — generate key
- `DELETE /api/admin/integrations/api-keys/{id}` — revoke key
- `GET /api/admin/integrations/webhooks` — list webhooks
- `POST /api/admin/integrations/webhooks` — create webhook
- `PATCH /api/admin/integrations/webhooks/{id}` — update webhook
- `GET /api/admin/integrations/webhooks/{id}/logs` — webhook delivery log
- `GET /api/admin/integrations/status` — service connection status
- `GET /api/admin/integrations/usage` — API usage analytics

**Database Entities**:
```javascript
// New: api_keys collection
{
  key_hash: String,                 // store hash, not plain key
  key_prefix: String,               // first 8 chars for identification
  name: String,
  institution_id: ObjectId | null,  // null for platform-level keys
  permissions: [String],            // scoped permissions
  rate_limit: Number,               // requests per minute
  last_used_at: DateTime | null,
  created_by: ObjectId,
  created_at: DateTime,
  expires_at: DateTime | null,
  is_active: Boolean,
}
```

---

### MODULE 21: Backup & Recovery

**Purpose**: Database backup management and disaster recovery controls.

**Features**:
- **Manual backup trigger** — trigger MongoDB dump
- **Backup schedule** — configure automatic backup frequency
- **Backup list** — view available backups with size, date, status
- **Restore point** — select a backup to restore (with confirmation)
- **Export collections** — download individual collection exports
- **Backup status** — last backup time, next scheduled backup, success/failure
- **Retention policy** — configure how long to keep backups

**Backend Requirements**:
- `POST /api/admin/backup/trigger` — start manual backup
- `GET /api/admin/backup/list` — available backups
- `POST /api/admin/backup/restore/{id}` — restore from backup
- `GET /api/admin/backup/schedule` — get schedule config
- `PATCH /api/admin/backup/schedule` — update backup schedule
- `GET /api/admin/backup/status` — backup service status

**Security Controls**:
- Restore requires two-person approval (requester + approver)
- Backup files are encrypted at rest
- Restore to production requires confirmation by typing "RESTORE"
- All backup/restore actions logged to audit

---

### MODULE 22: Data Compliance & Privacy

**Purpose**: GDPR compliance, data privacy, and user data management.

**Features**:
- **Data export** — export all data for a specific user (GDPR right to access)
- **Account deletion** — full user data deletion (GDPR right to be forgotten) with cascade
- **Data retention** — configure retention periods for different data types
- **Consent management** — view/manage user consent records
- **Privacy audit** — who accessed what PII and when
- **Cookie consent** — configure cookie banner
- **Data classification** — mark sensitive fields in DB schema
- **Deletion queue** — queued deletion requests with review before execution
- **Anonymization** — replace PII with anonymous data instead of hard delete (optional)

**Workflows**:

```
User Requests Data Deletion → Super Admin Reviews
    ├── Verify Identity → Confirm Deletion Scope → Execute
    │   ├── Full Deletion → Remove/Cascade → Confirm → Log
    │   └── Partial Anonymization → Replace PII → Confirm → Log
    └── Reject → Reason Given → User Notified

User Requests Data Export → Super Admin Triggers
    └── Generate → Notify User → Secure Download Link (24h expiry)
```

**Backend Requirements**:
- `POST /api/admin/privacy/export/{user_id}` — generate user data export
- `POST /api/admin/privacy/delete/{user_id}` — initiate deletion workflow
- `GET /api/admin/privacy/deletion-queue` — pending deletion requests
- `PATCH /api/admin/privacy/deletion-queue/{id}` — approve/reject deletion
- `GET /api/admin/privacy/consent-records` — user consent history
- `GET /api/admin/privacy/audit` — PII access audit log
- `GET /api/admin/privacy/retention` — retention policy config
- `PATCH /api/admin/privacy/retention` — update retention policies

---

### MODULE 23: Leaderboard Integrity

**Purpose**: Validate and audit leaderboard calculations for fairness.

**Features**:
- **Leaderboard snapshots** — capture leaderboard at specific times (for audit)
- **Score recalculation** — trigger re-calculation of leaderboard for any event
- **Anomaly detection** — flag suspicious ranking changes (jumped 50 places in 1 minute)
- **Manual adjustment** — add/remove points with reason and audit trail
- **Tie-breaking rules** — configure tie-breakers (earliest submission wins, etc.)
- **Leaderboard freeze** — freeze leaderboard at a specific time (for results announcement)
- **Export leaderboard** — download as CSV/PDF

**Backend Requirements**:
- `GET /api/admin/leaderboard/{event_id}` — current leaderboard
- `POST /api/admin/leaderboard/{event_id}/recalculate` — force recalc
- `POST /api/admin/leaderboard/{event_id}/snapshot` — capture snapshot
- `GET /api/admin/leaderboard/{event_id}/snapshots` — list snapshots
- `POST /api/admin/leaderboard/{event_id}/adjust` — manual score adjustment
- `POST /api/admin/leaderboard/{event_id}/freeze` — freeze leaderboard
- `GET /api/admin/leaderboard/anomalies` — detect ranking anomalies

---

### MODULE 24: Activity Heatmaps & Usage Analytics

**Purpose**: Visualize platform activity patterns for operational insights.

**Features**:
- **User activity heatmap** — daily active users mapped on a calendar grid (GitHub-style)
- **Hourly activity distribution** — platform usage by hour of day
- **Event creation patterns** — when institutions create events (day of week, time of day)
- **Submission patterns** — submission volume by hour (detect last-minute rushes)
- **Geographic heatmap** — user/institution density by city/state/country
- **Page view heatmap** — most visited pages/routes
- **Feature adoption** — which features are used most, adoption rate over time
- **Drop-off analysis** — where users drop off in funnel (signup → register → submit)

**Backend Requirements**:
- `GET /api/admin/analytics/heatmaps/users` — user activity heatmap data
- `GET /api/admin/analytics/heatmaps/hourly` — hourly distribution
- `GET /api/admin/analytics/heatmaps/geographic` — geo distribution
- `GET /api/admin/analytics/heatmaps/pages` — page view data
- `GET /api/admin/analytics/funnel` — conversion funnel data
- `GET /api/admin/analytics/feature-adoption` — feature usage stats

---

### MODULE 25: Event Lifecycle Automation

**Purpose**: Create and manage automation rules for event lifecycle.

**Features**:
- **Auto-reminder rules** — send reminders X days before deadline
- **Auto-status transitions** — automatically move events through lifecycle
- **Conditional actions** — if >80% submissions received, auto-close submissions
- **Auto-certificate generation** — generate certificates when event ends
- **Auto-result publishing** — auto-publish results after all judges score
- **Notification triggers** — configurable triggers (new registration, submission received)
- **Rule templates** — pre-built automation templates
- **Rule scheduling** — cron-based rule execution

**Backend Requirements**:
- `GET /api/admin/automation/rules` — list automation rules
- `POST /api/admin/automation/rules` — create rule
- `PATCH /api/admin/automation/rules/{id}` — update/modify rule
- `POST /api/admin/automation/rules/test` — test rule against sample data
- `GET /api/admin/automation/logs` — rule execution history

---

### MODULE 26: Platform Search & Global Query

**Purpose**: Unified search across all platform entities.

**Features**:
- **Global search** — search users, institutions, events, submissions, opportunities from one input
- **Cross-entity results** — grouped by type (Users, Institutions, Events, etc.)
- **Advanced filters** — date range, status, role, entity type
- **Saved searches** — save frequently used search filters
- **Export results** — export search results as CSV
- **Search analytics** — what super admins search for most (for UI optimization)
- **Full-text search** — MongoDB text search or external search engine (Elasticsearch future scope)

**Backend Requirements**:
- `GET /api/admin/search?q=keyword&type=all&status=&role=` — unified search
- `GET /api/admin/search/saved` — saved search filters
- `POST /api/admin/search/saved` — save search
- `GET /api/admin/search/analytics` — search usage analytics

---

### MODULE 27: Support & Helpdesk Integration

**Purpose**: Connect super admin dashboard to support ticket system.

**Features**:
- **Ticket list** — all support tickets from users/institutions
- **Ticket detail** — conversation history, related entities, status
- **Respond** — reply to tickets directly from admin panel
- **Ticket routing** — assign tickets to specific admin
- **Status workflow** — open → assigned → in_progress → resolved → closed
- **SLA tracking** — time to first response, time to resolution
- **Canned responses** — pre-written response templates
- **Ticket analytics** — volume trends, common categories, CSAT scores
- **Escalation** — flag complex tickets for senior review

**Integration Options**:
- Internal lightweight ticket system (MongoDB-based)
- External integration with Freshdesk, Zendesk, or Intercom

---

### MODULE 28: Super Admin Activity & Session Management

**Purpose**: Self-monitoring for super admin accounts (who did what, security).

**Features**:
- **Admin session list** — all active super admin sessions across the platform
- **Force logout other admins** — revoke another super admin's sessions (for security incidents)
- **Admin activity log** — what every super admin did, filtered by admin
- **Audit export** — export admin actions for compliance review
- **Two-factor auth** — enforce 2FA for all super admin accounts
- **Login alerts** — email notification when a super admin logs in from new device/IP
- **Session timeout** — configurable idle timeout for admin sessions (15 min default)
- **IP restriction** — limit super admin login to specific IP ranges (optional)

---

### MODULE 29: Onboarding & Tutorial System

**Purpose**: Guide new institutions and users through platform features.

**Features**:
- **Institution onboarding checklist** — track institution setup progress (profile, first event, add judges)
- **User onboarding analytics** — see where users drop off in onboarding
- **Tutorial content** — create/edit in-app walkthroughs
- **Sample event templates** — pre-built event templates for new institutions
- **Quick-start guides** — video/image guides for common tasks
- **Onboarding completion rate** — % of institutions that complete onboarding within 7 days

---

### MODULE 30: Reporting Engine

**Purpose**: Generate comprehensive platform reports for stakeholders.

**Features**:
- **Pre-built reports**:
  - Monthly platform health report
  - Institution performance report
  - User growth & retention report
  - Event success metrics report
  - Fraud & security report
  - Revenue & subscription report
- **Custom report builder** — select metrics, date range, grouping
- **Scheduled reports** — auto-generate and email reports on schedule (daily/weekly/monthly)
- **Report templates** — save custom report configurations for reuse
- **Export formats** — PDF, CSV, Excel, JSON
- **Email distribution** — send reports to distribution list
- **Report history** — previously generated reports with download links

---

## PART 3: FRONTEND NAVIGATION & UI STRUCTURE

### Navigation Structure

```
Super Admin Dashboard
├── Overview                    (Dashboard, KPIs, Alerts)
├── Governance
│   ├── Institutions            (List, Detail, Verification, Suspend)
│   ├── Users                   (List, Detail, Block, Role Change)
│   ├── Events                  (Global List, Detail, Force Actions)
│   ├── Judges                  (List, Performance, Bias Detection)
│   └── Submissions             (Global View, Integrity Check)
├── Moderation
│   ├── Content Queue           (Pending, Reported, Auto-Flagged)
│   ├── Moderation Rules        (Keywords, Blacklist, Automation)
│   └── Reports & Appeals       (User Reports, Content Flags)
├── Security
│   ├── Fraud Detection         (Alerts, Rules, Case Management)
│   ├── Security Monitor        (Login Attempts, API Abuse, IP Blocklist)
│   ├── Audit Logs              (Activity Trail, Search, Export)
│   └── Backup & Recovery       (Backups, Restore, Schedule)
├── Analytics
│   ├── Platform Analytics      (Growth, Engagement, Performance)
│   ├── Revenue Analytics       (MRR, Plans, Invoices)
│   ├── Event Intelligence      (Performance, Trends, Comparisons)
│   ├── User Behavior           (Heatmaps, Funnels, Adoption)
│   └── Reports                 (Pre-built, Custom, Scheduled)
├── Communications
│   ├── Notifications           (Broadcast, Templates, History)
│   ├── Email Templates         (Editor, Preview, History)
│   └── Announcements           (Banners, Alerts)
├── Settings
│   ├── Platform Config         (Feature Flags, Limits, Maintenance)
│   ├── Role Management         (Roles, Permissions, Assignment)
│   ├── API & Integrations      (API Keys, Webhooks, Status)
│   ├── Security Settings       (Password Policy, 2FA, IP Restriction)
│   ├── Email Settings          (SMTP, Limits, Templates)
│   ├── Compliance & Privacy    (GDPR, Data Retention, Deletion)
│   └── Backup Settings         (Schedule, Retention)
└── Support
    ├── Disputes & Appeals      (Cases, Messages, Resolutions)
    ├── Helpdesk                (Tickets, Responses, SLAs)
    └── Institution Onboarding  (Checklist, Progress, Templates)
```

---

## PART 4: IMPLEMENTATION PLAN

### Phase 1: Foundation (Week 1-2)
1. **Auth enhancements** — super admin role enforcement, 2FA, session management
2. **Audit log system** — write audit middleware, all admin actions auto-logged
3. **Backend scaffolding** — admin routes module with auth + audit middleware
4. **Frontend layout** — AdminLayout with sidebar, navigation, route guards

### Phase 2: Core Governance (Week 3-4)
5. **Institution management** — CRUD, verification workflow, suspend/block
6. **User management** — CRUD, role changes, block/unblock, impersonation
7. **Event governance** — global list, status override, moderation, cancel
8. **Judge oversight** — list, performance, unassign, disable

### Phase 3: Security & Integrity (Week 5-6)
9. **Fraud detection** — rule engine, alert dashboard, case management
10. **Security monitoring** — login monitor, API abuse, IP blocklist
11. **Submission integrity** — score anomalies, plagiarism flags, overrides
12. **Leaderboard validation** — snapshots, recalculations, adjustments

### Phase 4: Analytics & Intelligence (Week 7-8)
13. **Platform analytics** — dashboards, growth metrics, engagement
14. **Revenue analytics** — transactions, plans, invoices
15. **Event intelligence** — performance, trends, comparisons
16. **User behavior** — heatmaps, funnels, feature adoption
17. **Reporting engine** — pre-built, custom, scheduled reports

### Phase 5: Operations (Week 9-10)
18. **Moderation system** — content queue, auto-moderation, reports
19. **Notification center** — broadcast, templates, delivery analytics
20. **Support & disputes** — ticket system, appeals workflow, SLAs
21. **Platform config** — feature flags, maintenance mode, system limits

### Phase 6: Enterprise Features (Week 11-12)
22. **Role & permission engine** — custom roles, permission matrix
23. **API & integration management** — API keys, webhooks, usage
24. **Compliance & privacy** — GDPR, data export, deletion, retention
25. **Backup & recovery** — backup schedule, restore workflow
26. **Onboarding system** — institution onboarding, tutorials, templates
27. **CMS** — homepage, blogs, announcements, SEO
