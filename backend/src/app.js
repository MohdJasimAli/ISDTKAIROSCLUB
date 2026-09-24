import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import healthRoutes from './modules/health/health.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import eventRoutes from './modules/events/events.routes.js';
import teamRoutes from './modules/team/team.routes.js';
import announcementRoutes from './modules/announcements/announcements.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import ideaRoutes from './modules/ideas/ideas.routes.js';
import projectManageRoutes from './modules/projects/projects.manage.routes.js';
import requestRoutes from './modules/requests/requests.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import eventManageRoutes from './modules/events/events.manage.routes.js';
import announcementManageRoutes from './modules/announcements/announcements.manage.routes.js';

const app = express();

if (env.isProd) app.set('trust proxy', 1);

// Security headers. CSP is disabled because the SPA's index.html contains an inline
// JSON-LD block (plus React inline style attributes and Google Fonts) and the API only
// returns JSON, where CSP has no effect. Re-enable with explicit hashes if you want a
// policy on the HTML responses.
app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(cors({ origin: env.frontendOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/v1', healthRoutes);
// Manage/request routes BEFORE projectRoutes: '/projects/mine' must win over '/projects/:id'.
app.use('/api/v1', projectManageRoutes);
app.use('/api/v1', requestRoutes);
app.use('/api/v1', projectRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', teamRoutes);
app.use('/api/v1', announcementRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', ideaRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', eventManageRoutes);
app.use('/api/v1', announcementManageRoutes);

// Rate limiting applies to the API only — static assets must not consume the budget.
app.use('/api/v1', apiLimiter);

// ---------- Serve the built SPA from the same origin (single-service deployment) ----------
// When frontend/dist exists (it is produced during install), this service also serves the
// website. Same-origin means auth cookies stay first-party, so no CORS/proxy is required.
// If you later host the frontend on a CDN instead, this block simply stays inactive.
const appDir = path.dirname(fileURLToPath(import.meta.url));
const spaDir = path.resolve(appDir, '../../frontend/dist');
const spaIndex = path.join(spaDir, 'index.html');
const hasSpa = fs.existsSync(spaIndex);

if (hasSpa) {
  app.use(
    express.static(spaDir, {
      index: false,
      setHeaders(res, filePath) {
        // Vite emits content-hashed asset filenames — safe to cache forever.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );
}

// 404 + SPA fallback + error handler (consistent envelope)
app.use((req, res) => {
  // Client-side routes (/admin, /projects/:id, …) hand back index.html for React Router.
  // Requests that look like files (missing asset) stay 404 instead of returning HTML.
  const looksLikeAsset = path.extname(req.path) !== '';
  if (hasSpa && req.method === 'GET' && !req.path.startsWith('/api/') && !looksLikeAsset) {
    return res.sendFile(spaIndex);
  }
  return res.status(404).json({ success: false, message: 'Not found' });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  // Never leak internals: unexpected 5xx responses are generic in production.
  // Validation/body-parser errors carry 4xx statuses with safe messages.
  const isServerError = status >= 500;
  const message = isServerError && env.isProd
    ? 'Something went wrong — please try again later.'
    : err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
});

export default app;
