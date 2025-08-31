
# Issue Tracker (React + Next.js API + PostgreSQL/Neon)

## 🚀 Live Demo

[https://issue-tracker-beta-coral.vercel.app/](https://issue-tracker-beta-coral.vercel.app/)


Features:
- Auth with JWT in httpOnly cookie (signup/login/logout)
- RBAC: admin can edit/close/delete any issue; users can CRUD their own issues; comment creation by any authenticated user
- Endpoints for issues CRUD and issue comments
- Pagination, filtering, search: GET /api/issues?status=open|closed|all&page=&page_size=&q=
- Frontend: list, search/filter, create/edit status (close/reopen), comments, optimistic UI for create/close
- Input validation (zod) and proper HTTP codes

Tech:
- Next.js App Router (Node/Express-like API via route handlers)
- PostgreSQL (Neon) using @neondatabase/serverless
- JWT with jose, password hashing with bcryptjs
- SWR for data fetching and optimistic updates


## ⚠️ Installation Note

**If you get errors running `npm install`, use:**

```bash
npm install --legacy-peer-deps
```

This is required due to some peer dependency conflicts in the current package versions.

---

## Setup

1) Configure environment variables (Project Settings → Environment Variables)
- DATABASE_URL: Postgres connection string (Neon integration recommended)
- JWT_SECRET: random secret for signing JWTs

2) Initialize database
- Run scripts/migrate.ts (applies scripts/sql/*.sql, including 002 to align schema)
- Run scripts/seed.ts (creates admin and user, sample issues/comments)
  - Admin: admin@example.com / Admin1234!
  - User: user@example.com / User1234!

3) Use the app
- Pages: /issues (list), /issues/[id] (detail), /signup, /login, /logout
- Or call APIs directly (see cURL)

Note: In v0 Preview, scripts can be executed from the /scripts folder.

## API

- POST /api/auth/signup
  - body: { email, password }
  - 201: { id, email, role }
  - 409: email in use
- POST /api/auth/login
  - body: { email, password }
  - 200: { id, email, role }
  - 401: invalid credentials
- POST /api/auth/logout
  - 200: { ok: true }
- GET /api/auth/me
  - 200: { user: { sub, email, role } | null }

- GET /api/issues?status=open|closed|all&page=1&page_size=10&q=term
  - 200: { items, total, page, page_size, has_next }
- POST /api/issues
  - body: { title, description }
  - auth required
  - 201: created issue
- GET /api/issues/:id
  - 200: issue with creator_email
  - 404: not found
- PATCH /api/issues/:id
  - body: { title?, description?, status? }
  - auth + RBAC (admin or owner)
  - 200: { ok: true }
  - 403/404/400 as appropriate
- DELETE /api/issues/:id
  - auth + RBAC (admin or owner)
  - 200: { ok: true }
  - 403/404

- GET /api/issues/:id/comments
  - 200: comments list
- POST /api/issues/:id/comments
  - body: { body }
  - auth required
  - 201: created comment

### Example cURL

Signup:
curl -i -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!"}'

Login:
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin1234!"}'

List issues:
curl -i "http://localhost:3000/api/issues?status=open&page=1&page_size=5"

Create issue (send cookie from login response):
curl -i -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_COOKIE" \
  -d '{"title":"New issue","description":"Details here"}'

Close issue:
curl -i -X PATCH http://localhost:3000/api/issues/ISSUE_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_COOKIE" \
  -d '{"status":"closed"}'

Comment on issue:
curl -i -X POST http://localhost:3000/api/issues/ISSUE_ID/comments \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_COOKIE" \
  -d '{"body":"Looks good"}'

## Database schema

Tables: users, issues, comments
- users: id (uuid pk), email unique, password_hash, role ('admin'|'user'), created_at [optional: name]
- issues: id (uuid pk), title, description, status ('open'|'closed'), creator_id fk → users(id), created_at, updated_at
- comments: id (uuid pk), issue_id fk, author_id fk, body, created_at

## Docker Compose 

For local development without Neon, you can use a local Postgres:
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: issuetracker
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:

DATABASE_URL example:
postgres://postgres:postgres@localhost:5432/issuetracker

## Notes

- All inputs are validated server-side with zod; errors return 400 with details.
- Auth errors: 401; RBAC errors: 403; Not found: 404; Conflicts: 409.
- Optimistic UI for create and close/reopen on the issues list.
