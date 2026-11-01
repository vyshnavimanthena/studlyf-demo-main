<div align="center">

# 🎓 StudLyf v2

### AI-Powered Career Development & Institutional Event Management Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20+%20Vite-61DAFB?style=flat-square&logo=react)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://www.python.org/)

</div>

---

## 📖 Overview

StudLyf is a full-stack, production-grade platform with two core pillars:

1. **Student Career Development** — AI-powered mock interviews, technical assessments, resume/portfolio builder, skill roadmaps, and job-prep tools.
2. **Institutional Event Management** — End-to-end hackathon/competition lifecycle: post opportunities, manage registrations, run stages, assign judges, issue verifiable certificates, and track leaderboards.

---

## 🗂️ Project Structure

```
studlyfv2/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # App entrypoint & route registration
│   ├── integration_routes.py   # Institution dashboard APIs (/api/v1/institution/*)
│   ├── routes/                 # Feature-specific route modules
│   │   ├── opportunity_routes.py
│   │   ├── event_routes.py
│   │   ├── auth.py
│   │   └── ...
│   ├── services/               # Business logic layer
│   │   ├── subscription_service.py
│   │   ├── email_service.py
│   │   ├── opportunity_service.py
│   │   └── ...
│   ├── auth_institution.py     # JWT auth helpers (cookie + Bearer)
│   ├── db.py                   # MongoDB connection & collections
│   ├── tests/                  # Automated test suite
│   │   └── full_audit.py       # API audit script
│   └── requirements.txt
├── frontend/                   # React + Vite frontend
│   ├── App.tsx                 # Route definitions
│   ├── AuthContext.tsx         # Auth state management
│   ├── apiConfig.ts            # API base URL + auth headers
│   ├── pages/                  # Page components
│   │   ├── opportunities/
│   │   ├── events/
│   │   ├── institution-dashboard/
│   │   ├── admin/
│   │   └── ...
│   └── components/             # Reusable UI components
│       └── institution/
│           ├── PostOpportunityModal.tsx
│           ├── PostJobModal.tsx
│           └── PostInternshipModal.tsx
├── docker-compose.yml          # Full stack Docker setup
└── README.md
```

---

## 🚀 Features

### 1. 🎯 Opportunities & Job Portal
- **Glassmorphic list page** with 7 advanced filters (type, location, status, participation, team size, payment, skills)
- **Persistent filters** saved to `localStorage`
- **Eligibility engine** — client-side and server-side filtering based on candidate type, college, gender
- **Save/Bookmark** opportunities (synced to backend)
- **Apply flow** — individual and team-based applications
- **My Applications** dashboard with real-time status tracking
- **Post Job (4-step wizard)** — institutions post jobs directly from their dashboard
- **Post Opportunity (multi-step)** — hackathons, competitions, workshops, internships

### 2. 🏆 Hackathon / Event Lifecycle
- **Stage Builder** — define custom stages (Registration, Submission, Quiz, Evaluation)
- **Team Formation** — invite codes, join by code, enforced min/max team size
- **Participant Portal** — per-participant hub page with stage status
- **Quiz Engine** — create and run live quizzes per stage
- **Leaderboard** — real-time rankings from judge scores
- **Results Page** — public results with rank display

### 3. 🏫 Institution Dashboard (`/institution-dashboard`)
| Section | Purpose |
|---------|---------|
| Events Management | Create, edit, manage all events/hackathons |
| Opportunities Management | Post and track jobs/internships/competitions |
| Participants | View, filter, export all registrations |
| Teams | Manage team formation, merge, split |
| Judges | Invite external judges, assign to submissions |
| Certificates | Issue, customize, bulk-download certificates |
| Leaderboard | Live rankings per event |
| Reports | Export registration and submission data |
| Announcements | Send announcements to all participants |
| Settings | Institution profile, branding, subscription |

### 4. 👑 Admin Panel (`/admin`)
- Student Management, Course Management, Assessment Approval
- Opportunities Approval (review before going live)
- Analytics, Mentor Management, Company Management
- Payment Management, Resume Management, Ads, Audit Logs

### 5. 🎙️ AI-Powered Career Tools
- **3-Round Mock Interview** (Text + Voice, powered by Groq Llama 3.3 70B)
- **AI Technical Assessment Generator** (Company-style MCQ/coding)
- **Resume Builder** with AI summary + PDF export
- **Portfolio Builder** (glassmorphism style)
- **Skill Assessment** with history tracking
- **Career Roadmaps** (role-based)
- **Group Discussion Simulator**
- **Play-Learn-Earn** gamification module
- **DSA Visualizer** (Stack, Queue, Linked List, BST, Hash Table — 3D)

### 6. 🏅 Leaderboard & Certificate System
- **Automated scoring aggregation** from judge evaluations
- **QR-verified certificates** with cryptographic IDs
- **Bulk PDF export** per event or institution-wide
- **Multi-member team certificates** — auto-generated per team member
- **Public certificate verification** at `/verify/:id`

### 7. 🔐 Authentication System
- Self-managed JWT auth (no Firebase dependency)
- Login sets **both** `localStorage` token AND **HTTP-only cookie** — works in Incognito/private mode
- Role-Based Access Control: `student`, `institution`, `admin`, `super_admin`, `judge`, `mentor`
- Email verification on registration
- Forgot/Reset password flow
- Secure cookie fallback for all authenticated API calls

### 8. 💳 Subscription & Plan Management
- Plan tiers: Basic, Standard, Pro, Enterprise
- Confirmation-first plan selection flow
- Expiry reminders (7d, 3d, 1d, expired) via email + in-app
- Plan limit enforcement per listing (bypassed for admin/institution roles)

### 9. ✉️ Email & Notification System
- SMTP + Resend-style delivery with retry
- Templates: Registration, Team Invite, Shortlist, Certificate, Announcement
- Background async dispatch (non-blocking)
- In-app notification bell (institution dashboard)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Framer Motion |
| Styling | Vanilla CSS, CSS Modules |
| Backend | FastAPI (Python 3.11), Uvicorn |
| Database | MongoDB (via Motor async driver) |
| Auth | JWT (PyJWT), bcrypt, HTTP-only cookies |
| AI/LLM | Groq Cloud (Llama 3.3 70B) |
| Voice | Web Speech API |
| PDF | WeasyPrint, ReportLab |
| Cache | Redis |
| Deployment | Docker + Docker Compose |
| Email | SMTP / Resend |
| Rate Limiting | SlowAPI |

---

## ⚙️ Setup Instructions

### Option A: Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/studlyf-nirvaha/studlyfv2.git
cd studlyfv2

# 2. Create .env file (see below)
cp backend/.env.production.example .env

# 3. Start everything
docker compose up --build -d

# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
```

### Option B: Local Dev

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables (see .env section below)
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Database
MONGO_URL=mongodb://localhost:27017/studlyf_db

# Auth
JWT_SECRET_KEY=your_256bit_hex_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI
GROQ_API_KEY=your_groq_api_key_here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password

# App URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Admin
SUPER_ADMIN_EMAILS=admin@studlyf.com

# Environment
ENVIRONMENT=development
```

---

## 🗺️ Route Map

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login / Signup |
| `/forgot-password` | Password reset flow |
| `/about` | About page |
| `/roadmaps` | Career roadmap explorer |
| `/verify/:id` | Certificate verification |
| `/evaluate/:token` | Judge evaluation page |

### Student Routes (Login required)
| Route | Description |
|-------|-------------|
| `/dashboard` | Student home |
| `/opportunities` | Browse all opportunities |
| `/opportunities/:id` | Opportunity details + apply |
| `/opportunities/my-applications` | Track your applications |
| `/events/:id` | Hackathon participant portal |
| `/events/:id/quiz/:quizId` | Live quiz |
| `/job-prep/resume-builder` | AI Resume Builder |
| `/job-prep/portfolio` | Portfolio Builder |
| `/job-prep/mock-interview` | AI Mock Interview |
| `/job-prep/projects` | System Deconstruction Lab |
| `/roadmap/:skillId` | Skill-specific roadmap |

### Institution Routes (Institution role)
| Route | Description |
|-------|-------------|
| `/institution-dashboard` | Main dashboard |
| `/institution-dashboard/events` | Manage events/hackathons |
| `/institution-dashboard/opportunities` | Manage posted opportunities |
| `/institution-dashboard/participants` | View registrations |
| `/institution-dashboard/certificates` | Issue certificates |
| `/institution-dashboard/judges` | Manage judges |
| `/institution-dashboard/leaderboard` | Live rankings |
| `/institution-dashboard/settings` | Institution settings |

### Admin Routes (Admin role)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Admin overview |
| `/admin/students` | Student management |
| `/admin/opportunities` | Approve opportunities |
| `/admin/analytics` | Platform analytics |
| `/admin/payments` | Payment management |

---

## 🔌 Key API Endpoints

### Authentication
```
POST /api/auth/login              Login (returns JWT + sets cookie)
POST /api/auth/register           Register new user
POST /api/auth/forgot-password    Request reset link
GET  /api/auth/me                 Get current user profile
```

### Opportunities
```
GET  /api/opportunities/          List all opportunities (public)
GET  /api/opportunities/:id       Get single opportunity
POST /api/opportunities/          Create opportunity (auth required)
POST /api/opportunities/:id/apply Apply to opportunity
POST /api/opportunities/:id/save  Save/bookmark opportunity
```

### Events / Hackathons
```
GET  /api/v1/events/              List all events
GET  /api/v1/events/:id           Get event by ID
POST /api/v1/institution/events/create-professional    Create event
PATCH /api/v1/institution/events/:id/professional      Update event
```

### Institution Dashboard
```
GET  /api/v1/institution/events/:institution_id        List institution events
GET  /api/v1/institution/participants/:event_id        Get participants
GET  /api/v1/institution/certificates/:event_id        Get certificates
POST /api/v1/institution/judge/respond-invitation      Accept/decline judge invite
```

### Teams
```
POST /api/teams/create-secure      Create a team
POST /api/teams/:id/invites        Generate invite code
POST /api/teams/join-by-invite     Join team by code
GET  /api/teams/me?event_id=...    Get my team for an event
```

---

## 🧪 Running the API Audit

```bash
cd backend
source venv/bin/activate
python tests/full_audit.py
```

Expected output:
```
✅ [PASS] Backend Root Reachable
✅ [PASS] Login with bad creds -> 401
✅ [PASS] List Opportunities (public)
✅ [PASS] CORS headers on OPTIONS request
✅ [PASS] Frontend (localhost:3000) reachable
...
Total Tests: 16 | PASSED: 12+ | FAILED: 0
```

---

## 🐛 Recent Bug Fixes (July 2026)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| "7-day registration window" error on all plans | `max_registration_days: 7` in Basic plan config | Set to `None` (no limit) |
| "Missing or invalid token" on job/opportunity post | Token not sent in Incognito (localStorage empty) | Login now sets HTTP-only cookie; `authHeaders()` checks `sessionStorage` fallback |
| Backend crash on startup | `Optional` not imported in `email_service.py` | Added `from typing import Optional` |
| Admin plan limit bypass not working | `ignore_limits` not passed to validator | Fixed in `opportunity_routes.py` and `integration_routes.py` |
| Vague "Failed to save" error popup | Generic `alert(errorData.detail)` | Full field-level pre-submit validator + decoded FastAPI 422 errors |
| `PostJobModal` / `PostOpportunityModal` not sending auth | Missing `credentials: 'include'` on fetch | Added to all institution modals |

---

## ⚠️ Known Limitations

- **Voice features**: Chrome/Edge only (uses `webkitSpeechRecognition`)
- **PDF Generation**: Requires `WeasyPrint` or system-level `pdflatex`
- **Groq Rate Limits**: High-token models may throttle on free tier keys
- **CORS**: Hardcoded origins must be updated for non-localhost deployments

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by Studlyf Technologies Inc.

---

<div align="center">
Made with ❤️ by the Studlyf Team · <a href="https://studlyf.in">studlyf.in</a>
</div>
