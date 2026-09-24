export const env = {
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Comma-separated list of allowed browser origins for CORS, e.g.
  // https://app.isdtkairos.club,https://my-app.vercel.app
  frontendOrigins: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // 'lax' (default) — correct when frontend + API share one registrable domain
  // (app.isdtkairos.club → api.isdtkairos.club). Set 'none' ONLY when they are on
  // different sites (e.g. *.vercel.app frontend + *.onrender.com API) — auth
  // cookies are otherwise blocked as cross-site.
  cookieSameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
};
