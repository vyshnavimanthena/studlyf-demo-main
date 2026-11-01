# Application Route Map

This document catalogs all available routes for the Studlyf application.

---

## 🏢 Institution Dashboard Routes (`/institution-dashboard/*`)

| Section | URL Path | Component/Purpose |
| :--- | :--- | :--- |
| **Dashboard Home** | `/institution-dashboard` | Analytics & Alerts |
| **Events** | `/institution-dashboard/events` | Event Management |
| **Opportunities** | `/institution-dashboard/opportunities` | Listing Management |
| **Event Details** | `/institution-dashboard/event-details` | Event Config/Editor |
| **Participants** | `/institution-dashboard/participants` | User Management |
| **Teams** | `/institution-dashboard/teams` | Team Management |
| **Submissions** | `/institution-dashboard/submissions` | Submission Review |
| **Leaderboard** | `/institution-dashboard/leaderboard` | Live Results & Ranking |
| **Judges** | `/institution-dashboard/judges` | Judge Management |
| **Analytics** | `/institution-dashboard/analytics` | Reports & Stats |
| **Downloads** | `/institution-dashboard/downloads` | Export Data |
| **Certificates** | `/institution-dashboard/certificates` | Certification Issuance |
| **Settings** | `/institution-dashboard/settings` | Institution Profile |

---

## 🎓 Learner/Student Dashboard Routes

| Section | URL Path | Component/Purpose |
| :--- | :--- | :--- |
| **Student Dashboard** | `/dashboard/learner` | Main student overview |
| **Profile** | `/dashboard/profile` | Learner profile & management |
| **My Courses** | `/dashboard/my-courses` | Enrolled courses |
| **Courses Overview** | `/learn/courses-overview` | Browse available courses |
| **Course Player** | `/learn/course-player/:courseId` | Course learning interface |
| **Career Fit** | `/learn/career-fit` | Career assessment |
| **Assessment Intro** | `/learn/assessment-intro` | Prep for assessment |
| **Assessment** | `/learn/assessment` | Take assessment |
| **Company Modules** | `/learn/company-modules` | Company-specific learning |
| **Visualizers** | `/stack` \| `/queue` \| `/linked-list` | Data structure visualizers |
| **Resume Builder** | `/job-prep/resume-builder` | Tool for resumes |
| **Job Simulation** | `/job-prep/job-simulation` | Career prep tools |
| **Portfolio Builder**| `/job-prep/portfolio` | Portfolio tool |
| **SDL Projects** | `/job-prep/projects` | System Deconstruction Lab |
| **Skill Assessment** | `/skill-assessment` | Skill testing |
| **Interview Prep** | `/job-prep/mock-interview` | Mock interviews |
| **Opportunities** | `/opportunities` | Browse opportunities |
| **My Applications** | `/opportunities/my-applications`| Application tracker |

---

## 🌐 Public/Misc Routes

| Purpose | URL Path |
| :--- | :--- |
| **Home** | `/` |
| **Login/Signup** | `/login`, `/signup` |
| **AI Tools** | `/ai-tools` |
| **Certificate Verify** | `/verify/:id` |
| **Evaluation** | `/evaluate/:token` |
| **Admin (Restricted)** | `/admin/*` |
| **Event Hub** | `/events/:eventId` |
| **Judge Portal** | `/judge-portal/*` |
