# STEM Commons — Backend API

FastAPI + PostgreSQL/PostGIS service for the STEM Resources Discovery Platform.

## Run with Docker (recommended)

From the repository root:

```bash
docker-compose up -d --build      # starts PostGIS + API
docker-compose exec backend python -m app.seed   # load sample data
```

- API:      http://localhost:8000
- Docs:     http://localhost:8000/docs
- Health:   http://localhost:8000/health

## Run locally (without Docker)

Requires a PostgreSQL instance with the PostGIS extension.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # adjust DATABASE_URL if needed
python -m app.seed            # creates tables + sample data
uvicorn app.main:app --reload
```

## Key endpoints (prefix `/api/v1`)

| Method | Path                              | Purpose                          |
|--------|-----------------------------------|----------------------------------|
| POST   | `/auth/login`                     | Email+password → JWT (rate-limited) |
| GET    | `/auth/me`                        | Current authenticated user       |
| GET    | `/resources`                      | List with filters + pagination   |
| POST   | `/resources`                      | Create a resource (**admin only**) |
| GET    | `/resources/{id}`                 | Resource detail                  |
| PUT    | `/resources/{id}`                 | Update (**admin only**)          |
| DELETE | `/resources/{id}`                 | Delete (**admin only**)          |
| GET    | `/search/resources?q=`            | Full-text search                 |
| GET    | `/search/states`                  | Distinct states                  |
| GET    | `/search/districts/{state}`       | Districts in a state             |
| GET    | `/search/autocomplete?q=`         | Name autocomplete                |
| GET    | `/search/nearby?latitude=&longitude=&radius=` | PostGIS distance search |
| *      | `/resources/{id}/machines` …      | Machines CRUD                    |
| *      | `/resources/{id}/photos` …        | Photos                           |
| POST   | `/resources/{id}/claim`           | Submit a claim                   |
| POST   | `/resources/{id}/report`          | Report an issue                  |

The `/resources` response matches the frontend's resource shape
(`id, name, type, status, description, city, state, address, phone,
contact, website, facilities[], lat, lng`).

## Authentication & security

Admin auth uses JWT bearer tokens. Mutating resource routes (POST/PUT/DELETE)
require the `Admin` role.

**Environment variables** (see `.env`):

| Var | Purpose |
|-----|---------|
| `SECRET_KEY` | JWT signing key. **Must** be overridden in production. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default 480 = 8h). |
| `FIRST_ADMIN_EMAIL` / `FIRST_ADMIN_USERNAME` / `FIRST_ADMIN_PASSWORD` | Bootstrap admin created on first startup if no admin exists. |

Generate a strong key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Security measures in place:

- Passwords hashed with **bcrypt** (random per-hash salt, constant-time verify).
- JWTs signed with HS256 and an expiry claim; validated on every protected request.
- Login **rate limiting**: 5 attempts per IP+email per 5 minutes → HTTP 429.
- **Generic** login errors (never reveals whether an email exists).
- App **refuses to start in production** if `SECRET_KEY` is left at the default.
- CORS restricted to configured origins.

Production notes: serve over HTTPS, set a unique `SECRET_KEY`, supply admin
credentials via a secrets manager (not committed env files), and rotate the
bootstrap password after first login.
