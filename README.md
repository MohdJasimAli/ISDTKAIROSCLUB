# ISDT Kairos Club — Student Idea & Innovation Platform

Department of Computer Science, Integral University.

## Project setup

Monorepo: `frontend/` (React + Vite + Tailwind) + `backend/` (Express + Prisma + MongoDB).

### Quick start
1. MongoDB running locally (or an Atlas URI) — the project-local replica set uses `mongodb://127.0.0.1:27018/isdt_kairos?replicaSet=rs0`
2. `cp backend/.env.example backend/.env` and fill `DATABASE_URL` + JWT secrets
3. Run `install-all.cmd` on Windows, or run `npm install` in `backend/` and `frontend/`
4. `npm --prefix backend run db:push` (MongoDB has no migrate — schema is pushed)
5. `npm --prefix backend run db:seed` (set `ADMIN_PASSWORD` in `backend/.env` first)
6. Start the backend and frontend in separate terminals: `cd backend && npm run dev` and `cd frontend && npm run dev` (or run `dev-all.cmd` on Windows) → frontend http://localhost:5173, backend http://localhost:5000/api/v1/health

## Phase 11 — Polish

The frontend includes route-level metadata, Open Graph/structured data, accessible navigation and dialogs, reduced-motion support, lazy-loaded routes, responsive tables, and mobile-friendly touch targets. For device testing on the same network, use `cd frontend && npm run dev:host`. Run `cd frontend && npm run build` before testing a production bundle.

## Phase 12 — Deployment

Deployment configuration and the GitHub → MongoDB Atlas → Render → Vercel → domain workflow are documented in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
