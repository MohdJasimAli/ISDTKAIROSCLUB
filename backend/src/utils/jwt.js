import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const ACCESS_COOKIE = 'kairos_access';
export const REFRESH_COOKIE = 'kairos_refresh';

function toMs(duration) {
  const m = /^(\d+)([smhd])$/.exec(duration);
  if (!m) return 15 * 60 * 1000;
  const n = Number(m[1]);
  return n * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
}

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, typ: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.jwt.refreshSecret);
  if (payload.typ !== 'refresh') throw new Error('Invalid token type');
  return payload;
}

// httpOnly cookies: JS can't read tokens (XSS-safe). Refresh token is path-scoped to auth routes.
export function accessCookieOptions() {
  return { httpOnly: true, sameSite: env.cookieSameSite, secure: env.isProd, path: '/', maxAge: toMs(env.jwt.accessExpires) };
}

export function refreshCookieOptions() {
  return { httpOnly: true, sameSite: env.cookieSameSite, secure: env.isProd, path: '/api/v1/auth', maxAge: toMs(env.jwt.refreshExpires) };
}
