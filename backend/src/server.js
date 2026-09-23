import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';

// Fail fast on weak/missing auth secrets instead of booting an insecure server.
const MIN_JWT_LEN = env.isProd ? 32 : 16;
if (
  !env.jwt.accessSecret ||
  !env.jwt.refreshSecret ||
  env.jwt.accessSecret.length < MIN_JWT_LEN ||
  env.jwt.refreshSecret.length < MIN_JWT_LEN
) {
  console.error(
    `[FATAL] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each be set and at least ${MIN_JWT_LEN} characters. Check backend/.env.`
  );
  process.exit(1);
}

const host = process.env.HOST || '0.0.0.0';
app.listen(env.port, host, () => {
  console.log(`Kairos backend running on port ${env.port}`);
});
