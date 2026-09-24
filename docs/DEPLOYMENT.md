# ISDT Kairos Club — Deployment Guide

This guide deploys the application as a small, production-oriented monorepo:

```text
GitHub
  ├── Render web service → backend (Express + Prisma)
  ├── MongoDB Atlas       → application database
  └── Vercel static site → frontend (React + Vite)

app.isdtkairos.club  → Vercel frontend
api.isdtkairos.club  → Render backend
```

The `app.` and `api.` subdomains should share one registrable domain. The backend uses `SameSite=Lax` authentication cookies, so this layout keeps cookies working without weakening cookie security.

## 1. Prepare GitHub

1. Create a **private** GitHub repository (recommended because the project contains admin functionality). If the repository is already public, change it under **Settings → General → Danger Zone → Change visibility** before adding production credentials.
2. From the project root, verify ignored local files and secrets:

   ```powershell
   git status --short
   git check-ignore backend/.env frontend/.env frontend/dist a-login.json
   ```

3. Make the initial commit:

   ```powershell
   git add .
   git status
   git commit -m "chore: prepare Kairos Club for deployment"
   git branch -M main
   git remote add origin https://github.com/MohdJasimAli/ISDTKAIROSCLUB.git
   git push -u origin main
   ```

Do **not** commit `backend/.env`, database credentials, JWT secrets, or local smoke-test JSON files. The repository `.gitignore` excludes them.

GitHub Actions runs the frontend build and Prisma validation/generation on pushes and pull requests.

## 2. Create the MongoDB Atlas database

1. Create a MongoDB Atlas project and an M0 (or larger) cluster.
2. Choose a region close to the Render service.
3. Create a database user with the least privilege needed for this application.
4. Add an Atlas IP access list:
   - For a stable production service, allow Render's outbound IPs or use Atlas network access appropriate to the hosting plan.
   - For initial setup only, `0.0.0.0/0` can be used temporarily, then lock it down.
5. Copy the **SRV connection string**. Set it as `DATABASE_URL` in the backend host:

   ```text
   mongodb+srv://<user>:<url-encoded-password>@<cluster-host>/isdt_kairos?retryWrites=true&w=majority
   ```

6. Never put the Atlas password in GitHub, a frontend environment variable, or a screenshot.

Push the Prisma schema once from a trusted machine or a Render shell:

```powershell
$env:DATABASE_URL = "mongodb+srv://..."
npm --prefix backend run db:generate
npm --prefix backend run db:push
```

Seed the first administrator once, using a password supplied through the environment rather than source control:

```powershell
$env:ADMIN_EMAIL = "admin@your-domain.example"
$env:ADMIN_PASSWORD = "<long-random-password>"
$env:ADMIN_NAME = "Kairos Admin"
npm --prefix backend run db:seed
```

Take Atlas backups and configure a retention policy before storing important production data.

## 3. Deploy the backend to Render

The repository includes `render.yaml`, which defines the web service.

1. In Render, choose **New → Blueprint** and select the GitHub repository.
2. Render should detect `render.yaml` and create `isdt-kairos-api`.
3. Set the environment variables marked `sync: false`:

   | Variable | Value |
   |---|---|
   | `FRONTEND_URL` | `https://app.isdtkairos.club` (comma-separate additional allowed origins if needed) |
   | `COOKIE_SAME_SITE` | `lax` — correct while `app.`/`api.` share `isdtkairos.club`; `none` only if the frontend is hosted on a different site |
   | `DATABASE_URL` | Atlas SRV connection string |
   | `JWT_ACCESS_SECRET` | Random value, at least 32 characters |
   | `JWT_REFRESH_SECRET` | A different random value, at least 32 characters |

   `NODE_ENV=production`, `HOST=0.0.0.0`, and the token lifetimes are defined by the blueprint. The blueprint build uses `npm install --include=dev` because the Prisma CLI lives in `devDependencies` while `NODE_ENV=production` would otherwise skip it.

4. Deploy and wait for the health check:

   ```text
   https://api.isdtkairos.club/api/v1/health
   ```

   A healthy response has HTTP 200 and `data.db: "connected"`.
5. If Render uses a free plan, the service may sleep during low traffic. Use a paid always-on plan for a production launch.
6. Run `npm run db:push` from a one-off Render shell or trusted local environment before accepting traffic. Run `db:seed` only for the initial administrator.

## 4. Deploy the frontend to Vercel

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Vercel should use `frontend/vercel.json`:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - SPA fallback: `index.html`
4. The checked-in `frontend/vercel.json` sets the production API URL to `https://api.isdtkairos.club/api/v1`. You may override it in Vercel if the API domain changes:

   ```text
   VITE_API_URL=https://api.isdtkairos.club/api/v1
   ```

5. Deploy and verify the generated site. Test at least:
   - Home, About, Events, and Projects direct URLs
   - Login and registration
   - An authenticated dashboard route
   - A project/event detail route

`VITE_API_URL` is compiled into the frontend bundle. Redeploy after changing it.

## 4b. Alternative: host the frontend on Render

If you prefer a single provider, add this static site service to `render.yaml`:

```yaml
  - type: web
    name: isdt-kairos-web
    runtime: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    autoDeploy: true
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://isdt-kairos-api.onrender.com/api/v1
```

The rewrite rule is the SPA fallback, so deep links such as `/admin` and `/projects/:id` load `index.html` instead of a 404.

**Cookie caveat (important):** `isdt-kairos-web.onrender.com` and
`isdt-kairos-api.onrender.com` are different registrable sites, so authentication
cookies need `COOKIE_SAME_SITE=none` on the API service, and `FRONTEND_URL` must
be the web service URL. Cross-site cookies are increasingly restricted in some
browsers, which is why this guide prefers `app.` and `api.` on one custom domain
with `COOKIE_SAME_SITE=lax`.

## 5. Domain and DNS setup

The target is `isdtkairos.club` with the `app.` and `api.` subdomains. At the time this deployment guide was prepared, the domain did not publish DNS records, so register/activate it at the registrar before adding the provider targets.

Use these records:

| Type | Name | Value |
|---|---|---|
| CNAME | `app` | Vercel-provided frontend target |
| CNAME | `api` | Render-provided backend target |

Then:

1. Add `app.isdtkairos.club` to the Vercel project under **Settings → Domains**.
2. Add `api.isdtkairos.club` to the Render service under **Settings → Custom Domains**.
3. Wait for DNS propagation and TLS certificate issuance.
4. Set `FRONTEND_URL=https://app.isdtkairos.club` in Render.
5. Set `VITE_API_URL=https://api.isdtkairos.club/api/v1` in Vercel and redeploy.
6. Verify the API health endpoint and a browser login from the deployed frontend.

Keep the frontend and API on HTTPS. Do not add a trailing slash to `FRONTEND_URL`; it must exactly match the browser origin used for CORS and cookies.

## 6. Production environment checklist

Backend:

- [ ] `NODE_ENV=production`
- [ ] `HOST=0.0.0.0`
- [ ] `DATABASE_URL` points to Atlas
- [ ] `FRONTEND_URL` exactly matches the deployed frontend origin
- [ ] JWT access and refresh secrets are different random values
- [ ] `ADMIN_PASSWORD` is not stored in the service after initial seeding
- [ ] Atlas backups and IP access list are configured

Frontend:

- [ ] `VITE_API_URL` points to the HTTPS API
- [ ] Custom domain and TLS are active
- [ ] Direct links fall back to `index.html`
- [ ] Browser console contains no CORS, mixed-content, or cookie errors

## 7. Release verification

```powershell
# Frontend production build
cd frontend
npm ci
npm run build

# Backend schema checks (does not modify the database)
cd ..\backend
npm ci
npm run db:validate
npm run db:generate
```

After deployment, verify:

```text
GET https://api.isdtkairos.club/api/v1/health → 200
GET https://app.isdtkairos.club/             → 200
POST /api/v1/auth/login                  → valid credentials return 200
```

## 8. Rollback and maintenance

- Redeploy the previous Render/Vercel commit to roll back without rebuilding manually.
- Keep Prisma schema changes backward-compatible before deploying them.
- Run `db:push` only after reviewing the schema change; MongoDB has no SQL migration history in this setup.
- Rotate JWT secrets through the hosting provider; existing sessions will be invalidated.
- Review Render, Vercel, Atlas, and domain-registrar access as the deployment owners.
