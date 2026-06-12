# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

STEM Commons is a full-stack resource directory for STEM facilities (labs, makerspaces, etc.) in India. It features public browsing, geospatial search, an ownership claim system, and admin verification workflows.

## Development Commands

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000, docs at /docs
python -m app.seed                     # create tables + seed demo data
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev                            # http://localhost:5173
npm run build
npm run lint
```

### Docker (full stack)

```bash
docker-compose up -d --build
docker-compose exec backend python -m app.seed
# Backend: http://localhost:8000 | Frontend: http://localhost:5173
```

## Environment

A single `.env` file lives at the **monorepo root** (not inside `backend/` or `frontend/`). The backend reads it via pydantic-settings; the frontend reads it via Vite's `envDir` pointed at `../`. Copy `.env.example` to `.env` to get started.

Key variables: `DATABASE_URL`, `SECRET_KEY`, `VITE_API_URL`, `FIRST_ADMIN_EMAIL/USERNAME/PASSWORD`.

PostgreSQL runs on port **5433** in Docker (mapped to 5432 internally).

## Architecture

### Backend (`backend/app/`)

**Layer structure:**
- `api/v1/endpoints/` — HTTP handlers, one file per domain
- `services/resource_service.py` — business logic layer (only resource domain has a service so far; other domains do logic inline)
- `models/` — SQLAlchemy ORM models
- `schemas/` — Pydantic DTOs (request/response)
- `api/deps.py` — FastAPI dependency injection: `get_current_user`, `require_admin`, `require_owner`

**Key facts:**
- All routes are versioned under `/api/v1`; aggregated in `api/v1/api.py`
- Resource has a PostGIS `Geography(POINT, SRID=4326)` column — use GeoAlchemy2 for spatial queries
- JWT auth (HS256): tokens carry `sub` (user ID), `role`, `exp`. Protected routes use `Depends(get_current_user)`.
- Rate limiting on `POST /auth/login` is **in-memory** (not safe for multi-worker deployments)
- `main.py` uses FastAPI's `lifespan` for startup: validates `SECRET_KEY`, creates tables, bootstraps first admin from env vars
- No Alembic — schema migrations are SQL statements in `db/init_db.py`

**User roles:** `Admin`, `Verified Owner`, `User`

**Public vs authenticated:**
- Public: `GET /resources`, `GET /search/*`, `POST /resources/submit`
- Admin-only mutations: `POST/PUT/DELETE /resources`, `/admin/*`
- Owner: `/owner/*` (requires `Verified Owner` or `Admin`)

### Frontend (`frontend/src/`)

**Structure:**
- `app/App.tsx` — BrowserRouter + AuthProvider wrapping all routes
- `context/AuthContext.tsx` — global auth state: `user`, `isAdmin`, `isOwner`, `login()`, `logout()`; restores session on load via `GET /auth/me`
- `lib/api.ts` — all backend calls; base URL from `VITE_API_URL`; injects `Authorization: Bearer {token}`
- `lib/auth.ts` — token stored in `localStorage` under key `auth_token`
- `components/auth/ProtectedRoute.tsx` — role-gated route wrapper

**Route map:**
| Path | Page | Auth |
|------|------|------|
| `/` | LandingPage | public |
| `/resources` | ResourcesPage | public |
| `/resource/:id` | ResourceDetail | public |
| `/map` | MapPage | public |
| `/submit` | SubmitResource | public |
| `/login` | LoginPage | public |
| `/admin` | AdminDashboard | Admin only |
| `/owner` | OwnerDashboard | Verified Owner or Admin |

**Design tokens (defined inline/globals.css):**
- Primary red: `#c41a0a`, Background beige: `#f5f2ee`, Dark text: `#1a1a1a`
- Fonts: Oswald (headings), Barlow (body)
- Status palette: green `#166534` (Working), yellow `#92400e` (Planned), orange `#9a3412` (Temp Closed), red `#7f1d1d` (Closed)

### Data Flow for Resource Submission

1. Anyone can `POST /resources/submit` → creates an unverified resource
2. Admin reviews and calls `POST /admin/resources/{id}/verify`
3. Owner can submit a claim via `POST /resources/{id}/claims`
4. Admin approves/rejects claims; approved → user role upgraded to `Verified Owner`
