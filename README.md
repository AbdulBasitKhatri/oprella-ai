# Oprella AI

> An AI-assisted opportunity discovery and recruiting platform that helps students find better-fit opportunities and helps organizations reach and manage emerging talent.

**Live product:** [oprella-ai.netlify.app](https://oprella-ai.netlify.app/)

**Live API:** [oprellaaibackend.fastapicloud.dev](https://oprellaaibackend.fastapicloud.dev/)

Oprella AI brings opportunity discovery, candidate context, application intelligence, and recruiter workflow into one focused platform. Students can build a profile once and use it to discover relevant jobs, internships, fellowships, hackathons, and workshops. Organizations can create listings, review applicants, understand candidate fit, and communicate decisions from the same system.

## Product Story

Students often search across disconnected job boards, repeat the same information in every application, and have little feedback about whether an opportunity matches their skills. Recruiters face the opposite problem: large volumes of applications with inconsistent candidate context and limited time for structured review.

Oprella AI addresses both sides of that gap:

- **For students:** a structured profile, CV-assisted onboarding, personalized discovery, fit analysis, saved opportunities, application tracking, and deadline notifications.
- **For organizations:** a recruiter workspace for organization onboarding, opportunity publishing, applicant review, status management, and candidate messaging.
- **For the platform:** a shared data model that connects opportunity requirements, candidate profiles, applications, AI analysis, and notifications.

## Core Value Proposition

### For students and early-career talent

- Replace scattered searching with one opportunity feed.
- See opportunities ranked against profile terms and skills.
- Understand matched skills, skill gaps, eligibility, and recommendations before applying.
- Reuse a structured profile instead of re-entering the same information.
- Track submitted applications and recruiter decisions in one place.

### For recruiters and organizations

- Create and maintain structured opportunity listings.
- Define skills, eligibility, location, working mode, dates, duration, and compensation.
- Review applicant profiles and AI-assisted fit analysis.
- Move applicants through reviewing, interview, accepted, and rejected states.
- Send personalized decision messages and trigger candidate notifications.

## Feature Set

### Student experience

1. **Account creation and login**
   - Email/password signup and login.
   - Role-aware navigation and protected routes.
   - Remember-me behavior using browser storage.

2. **Student onboarding**
   - Education, degree field, semester, skills, interests, location, experience, and career goals.
   - Manual profile completion.
   - PDF and DOCX CV import with text extraction and AI-assisted field parsing.
   - CV uploads are limited to 5 MB.

3. **Personalized opportunity discovery**
   - A general feed with search, category filtering, pagination, and applied-opportunity exclusion.
   - A personalized **For You** feed based on profile terms and required-skill overlap.
   - Supported categories include jobs, internships, fellowships, hackathons, and workshops.
   - Opportunity details include organization, location, remote mode, deadline, dates, description, eligibility, required skills, and stipend information.

4. **Saved opportunities**
   - Bookmark opportunities for later review.
   - View and remove saved opportunities from a dedicated workspace.

5. **Application intelligence**
   - Preview an application before submitting.
   - AI-generated fit score, matched skills, skill gaps, eligibility signal, summary, and recommendations.
   - Cached analysis avoids repeating the same analysis unnecessarily.
   - Local skill-overlap analysis provides a fallback when Gemini is unavailable.

6. **Application tracker**
   - View application history and status changes.
   - Track submitted, reviewing, interview, accepted, and rejected states.
   - Read recruiter decision messages.

7. **Notifications**
   - New-application and decision notifications.
   - Deadline reminders for opportunities approaching within seven days.
   - Mark notifications as read.

8. **Profile and account controls**
   - Review and edit student profile information.
   - Change password.
   - Delete a student account.

### Recruiter and organization experience

1. **Organization onboarding**
   - Company name, industry, company size, website, location, contact details, hiring needs, description, and intended use case.

2. **Recruiter dashboard**
   - Organization profile completion.
   - Listing and applicant counts.
   - Recent postings and operational task indicators.

3. **Opportunity management**
   - Create, list, view, edit, and delete organization-owned postings.
   - Capture title, category, type, location, remote mode, deadlines, start details, duration, working days, timezone, application URL, description, eligibility, required skills, status, and stipend.
   - Automatic organization ownership and publication timestamps.

4. **Applicant review**
   - View applications for an organization-owned opportunity.
   - Review candidate snapshots and stored fit analysis.
   - Update application status to reviewing, interview, accepted, or rejected.

5. **Candidate communication**
   - Send a subject and message to a candidate.
   - Accepted messages update the application and notify the candidate.
   - Rejections create a structured decision message and candidate notification.

6. **Organization profile and account controls**
   - View and edit organization details.
   - Change password.
   - Delete a recruiter account.

### Platform administration

- Backend-protected mock opportunity seeding from `mock_opportunities_1000.json`.
- Seed data upsert support and deletion by item or batch size.
- Constant-time comparison for the administrative seed password.

The backend exposes these administrative operations, but the current frontend does not register the `/admin` route in the active router. They should therefore be treated as backend operations rather than a public product workflow.

## AI and Data Intelligence

Oprella AI uses Google Gemini through the Generative Language REST API. The backend calls the configured model using `httpx`; it does not depend on a Gemini-specific Python SDK.

### CV-to-profile extraction

1. A student uploads a PDF or DOCX CV.
2. The backend extracts text with `pypdf` or `python-docx`.
3. Gemini converts the text into structured fields: education, degree field, semester, skills, interests, location, experience, and career goals.
4. The result is returned to the onboarding flow for profile completion.

### Candidate-opportunity fit analysis

Before applying, the backend can ask Gemini to evaluate the candidate against the opportunity. The result is constrained to structured JSON containing:

- Score from 0 to 100.
- Matched skills.
- Skill gaps.
- Eligibility signal.
- Summary.
- Recommendations.

The analysis is cached in MongoDB and copied into the application record when the student applies. If Gemini is disabled or the request fails, the application continues using a deterministic local skill-overlap analysis.

### Discovery matching

The personalized feed currently uses local matching. It extracts meaningful terms from the student's skills, interests, goals, education, experience, and location, compares them with opportunity text, and prioritizes skill and term matches. This keeps discovery functional even when AI is unavailable and provides a clear foundation for a future ranking model.

## Technical Architecture

```text
Student or recruiter browser
        |
        v
React 19 + Vite + React Router + Tailwind CSS
        |
        | HTTPS JSON API with Bearer JWT
        v
FastAPI application on FastAPI Cloud
        |
        +--> MongoDB Atlas
        |
        +--> Google Gemini REST API
        |
        +--> pypdf / python-docx for CV extraction
```

### Frontend

- React 19.2.
- Vite 8.
- React Router 7.
- Tailwind CSS 3.
- `lucide-react` for interface icons.
- `oxlint` for linting.
- Netlify deployment with SPA fallback to `index.html`.
- API base URL configured through `VITE_API_BASE_URL`.

### Backend

- FastAPI with Uvicorn/FastAPI CLI.
- Python package configuration in [Backend/pyproject.toml](Backend/pyproject.toml).
- Pydantic models for request validation and response shaping.
- Async MongoDB access through Motor and PyMongo SRV support.
- JWT authentication with PyJWT.
- Password hashing and verification with Passlib and bcrypt.
- `httpx` for outbound Gemini requests.
- `pypdf` and `python-docx` for CV text extraction.
- CORS configured for local development and the production Netlify origin.

### Data model

The active MongoDB database is configured as `oprella_ai`. Main collections are:

| Collection | Purpose |
| --- | --- |
| `users` | Credentials, roles, onboarding details, profiles, saved opportunity IDs, and CV metadata/content. |
| `opportunities` | Organization and seeded opportunity postings. |
| `applications` | Candidate/opportunity snapshots, status, timestamps, fit analysis, and decision messages. |
| `application_analysis_cache` | Reusable candidate-opportunity analysis results. |
| `notifications` | Application, decision, and deadline notifications. |

Applications store snapshots of relevant candidate, recruiter, and opportunity data. This preserves useful context if a profile or posting changes later.

## Authentication and Authorization

- Signup and login return a bearer access token and user summary.
- Passwords are hashed with bcrypt and never stored as plaintext.
- JWTs carry the user ID in `sub` and expire according to `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Protected requests use `Authorization: Bearer <token>`.
- Frontend route guards distinguish public, student, recruiter, and onboarding-only routes.
- Recruiter-only opportunity and applicant operations verify ownership and role on the backend.
- Logout currently removes the client-side token; there is no refresh-token or server-side logout endpoint.

## API Surface

The interactive API documentation is available from the FastAPI deployment at `/docs` when enabled by the hosting environment.

### Authentication and profiles

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create an account and issue a token. |
| `POST` | `/auth/login` | Authenticate an account. |
| `POST` | `/auth/student-onboarding` | Save student onboarding details. |
| `POST` | `/auth/student-onboarding/import-cv` | Parse a PDF/DOCX CV into profile fields. |
| `POST` | `/auth/recruiter-onboarding` | Save organization onboarding details. |
| `GET` / `PUT` | `/auth/student/profile` | Read or update a student profile. |
| `GET` / `PUT` | `/auth/recruiter/profile` | Read or update an organization profile. |
| `GET` | `/auth/recruiter/dashboard` | Load recruiter dashboard data. |
| `PUT` | `/auth/change-password` | Change the current password. |
| `DELETE` | `/auth/student/delete-account` | Delete a student account. |
| `DELETE` | `/auth/recruiter/delete-account` | Delete a recruiter account. |

### Opportunities

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/opportunities/` | Create a recruiter-owned opportunity. |
| `GET` | `/opportunities/` | List available opportunities. |
| `GET` | `/opportunities/feed` | Search, filter, paginate, and exclude applied opportunities. |
| `GET` | `/opportunities/for-you` | Return profile-matched opportunities for students. |
| `GET` | `/opportunities/public/{opportunity_id}` | Read a public opportunity. |
| `GET` | `/opportunities/my` | List the current recruiter's postings. |
| `GET` / `PUT` / `DELETE` | `/opportunities/{opportunity_id}` | Read, update, or delete an owned posting. |

### Applications and notifications

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/applications/preview/{opportunity_id}` | Preview profile fit and application readiness. |
| `POST` | `/applications/{opportunity_id}` | Submit an application. |
| `GET` | `/applications/my` | List the current student's applications. |
| `GET` | `/applications/opportunity/{opportunity_id}` | List applicants for a recruiter-owned opportunity. |
| `PATCH` | `/applications/{application_id}/status` | Update an applicant status. |
| `POST` | `/applications/{application_id}/message` | Send a recruiter decision message. |
| `GET` | `/notifications` | Load notifications and create eligible deadline reminders. |
| `PATCH` | `/notifications/{notification_id}/read` | Mark a notification as read. |

### Administrative seed operations

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/seed-opportunities?password=...` | Upsert bundled mock opportunities. |
| `DELETE` | `/admin/mock-opportunities/{mock_id}?password=...` | Delete one seeded opportunity. |
| `DELETE` | `/admin/mock-opportunities?count=...&password=...` | Delete all or a supported batch size. |

## Repository Structure

```text
oprella-ai/
├── Backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── applications.py
│   │   │   ├── auth.py
│   │   │   └── opportunities.py
│   │   ├── auth_utils.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── mock_opportunities_1000.json
│   │   └── schemas.py
│   ├── HowToRun.txt
│   ├── pyproject.toml
│   └── requirements.txt
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── netlify.toml
│   ├── package.json
│   └── vite.config.js
└── README.md
```

Key implementation references:

- [Backend/app/main.py](Backend/app/main.py): FastAPI app, lifecycle, CORS, and router registration.
- [Backend/app/routes/auth.py](Backend/app/routes/auth.py): authentication, onboarding, profile, and CV import flows.
- [Backend/app/routes/opportunities.py](Backend/app/routes/opportunities.py): discovery, matching, and recruiter opportunity management.
- [Backend/app/routes/applications.py](Backend/app/routes/applications.py): fit analysis, applications, status changes, messaging, and notifications.
- [Frontend/src/App.jsx](Frontend/src/App.jsx): frontend routes and role-aware navigation.
- [Frontend/src/config/appConfig.js](Frontend/src/config/appConfig.js): API base URL and client endpoint map.
- [Frontend/netlify.toml](Frontend/netlify.toml): production frontend build and SPA redirect configuration.

## Local Development

### Prerequisites

- Node.js and npm.
- Python 3.10+ recommended.
- A MongoDB Atlas cluster or compatible MongoDB instance.
- A Gemini API key for CV parsing and AI fit analysis. The app still has local fallbacks for fit analysis and discovery.

### Backend

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev app/main.py
```

The backend is then available at `http://127.0.0.1:8000`. FastAPI's interactive documentation is available at `http://127.0.0.1:8000/docs`.

For a production-style local process:

```powershell
fastapi run app/main.py
```

### Frontend

```powershell
cd Frontend
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

### Environment variables

Create `Backend/.env` with deployment-specific values:

```dotenv
MONGODB_URL=<your MongoDB connection string>
DATABASE_NAME=oprella_ai
PROJECT_NAME="Oprella AI API"
SECRET_KEY=<long random JWT signing secret>
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-3.1-flash-lite-preview
ADMIN_SEED_PASSWORD=<strong private seed password>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Create `Frontend/.env` for local development or configure the same value in Netlify:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For the deployed frontend, set `VITE_API_BASE_URL` to the production API origin, without a trailing slash:

```dotenv
VITE_API_BASE_URL=https://oprellaaibackend.fastapicloud.dev
```

## Deployment

### Frontend on Netlify

The frontend deployment is configured in [Frontend/netlify.toml](Frontend/netlify.toml):

- Build command: `npm run build`.
- Publish directory: `dist`.
- SPA redirect: every route serves `index.html` so React Router can handle navigation.
- Required environment variable: `VITE_API_BASE_URL`.

### Backend on FastAPI Cloud

The backend entrypoint is `app.main:app`, configured in [Backend/pyproject.toml](Backend/pyproject.toml). The runtime requires:

- MongoDB connectivity.
- Environment variables listed above.
- CORS access for `https://oprella-ai.netlify.app`.
- A production-safe JWT secret and admin seed password.

## Security and Operations

The credentials included in the original project context are secrets. They must not be committed to GitHub, README files, screenshots, frontend code, or public issue trackers.

Because the MongoDB connection string and Gemini API key were exposed in the conversation and appear to have been present in environment/config material, rotate them immediately:

1. Rotate the MongoDB Atlas database user password and review network access rules.
2. Revoke and regenerate the Gemini API key.
3. Replace the JWT `SECRET_KEY` with a long random value.
4. Change the administrative seed password.
5. Store only placeholders in documentation and keep real values in deployment secrets.
6. Check Git history for leaked values before making the repository public.

Additional production-hardening work recommended before scaling includes rate limiting, file-content validation beyond file extensions, structured logging/monitoring, database indexes, token refresh/revocation strategy, and automated tests for authorization boundaries.

## Current Product Boundaries

This README documents the behavior currently represented in the repository. The following are useful roadmap opportunities rather than claims of fully implemented functionality:

- The landing page references an AI mentor/chat experience, but no mentor API or chat UI is currently wired.
- The frontend contains an `AdminPage` component, but `/admin` is not registered in the active route table.
- Recruiter dashboard metrics are derived from current stored posting data; they are not a separate analytics pipeline.
- Personalized discovery is deterministic local matching. Gemini is used for CV extraction and application fit analysis.
- There is no refresh-token flow or server-side logout endpoint.

## Product Roadmap Opportunities

- Add a conversational AI mentor for career planning and application preparation.
- Introduce explainable ranking with configurable student preferences.
- Add organization verification and trust signals.
- Build recruiter analytics for funnel conversion, response time, and listing performance.
- Add email and push notification channels.
- Add moderation, reporting, and duplicate-opportunity detection.
- Add automated API, authorization, and end-to-end test coverage.
- Add observability dashboards and background jobs for recurring deadline reminders.

## Status

Oprella AI is a deployed MVP with a working student discovery/application workflow and recruiter publishing/review workflow. The architecture is intentionally modular: the current local matching and Gemini integrations can evolve independently as the product gains users, data, and stronger ranking signals.