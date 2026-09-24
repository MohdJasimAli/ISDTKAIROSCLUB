import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../../validators/auth.validators.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  signAccessToken, signRefreshToken, verifyRefreshToken,
  ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions,
} from '../../utils/jwt.js';
import { publicUserSelect, pickPublic } from '../../utils/publicUser.js';

const router = Router();
const DB_DOWN = 'Database unavailable — run migration and check DATABASE_URL';

// Compared against when the email doesn't exist, to keep login timing constant.
const DUMMY_HASH = bcrypt.hashSync('kairos-timing-equalizer', 12);

function setAuthCookies(res, user) {
  res.cookie(ACCESS_COOKIE, signAccessToken(user), accessCookieOptions());
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), refreshCookieOptions());
}

router.post('/auth/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { phone, ...rest } = req.body;
    const email = req.body.email;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail(res, 'An account with this email already exists', 409);

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email,
        passwordHash: await hashPassword(req.body.password),
        department: req.body.department,
        year: req.body.year,
        phone: phone || null,
      },
      select: publicUserSelect,
    });

    setAuthCookies(res, user);
    return ok(res, user, 'Welcome to Kairos! Your account is pending review by the team.', 201);
  } catch (err) {
    if (err.code === 'P2002') return fail(res, 'An account with this email already exists', 409);
    console.error(err);
    return fail(res, DB_DOWN, 503);
  }
});

router.post('/auth/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, select: { ...publicUserSelect, passwordHash: true, isActive: true } });

    const valid = await comparePassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) return fail(res, 'Invalid email or password', 401);
    if (!user.isActive) return fail(res, 'This account has been disabled', 403);

    const safeUser = pickPublic(user);
    setAuthCookies(res, safeUser);
    return ok(res, safeUser, `Welcome back, ${safeUser.name.split(' ')[0]}!`);
  } catch (err) {
    console.error(err);
    return fail(res, DB_DOWN, 503);
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return fail(res, 'No session to refresh', 401);

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return fail(res, 'Session expired — please log in again', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: publicUserSelect });
    if (!user) return fail(res, 'Account not found', 401);

    setAuthCookies(res, user);
    return ok(res, user, 'Session refreshed');
  } catch (err) {
    console.error(err);
    return fail(res, DB_DOWN, 503);
  }
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(), maxAge: 0 });
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: 0 });
  return ok(res, null, 'Logged out');
});

router.get('/auth/me', requireAuth, (req, res) => ok(res, req.user));

// POST /api/v1/auth/password — change password (strict rate limit: secrets at stake).
router.post('/auth/password', requireAuth, authLimiter, validate(changePasswordSchema), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHash: true } });
    if (!user) return fail(res, 'Account not found', 401);

    const valid = await comparePassword(req.body.currentPassword, user.passwordHash);
    if (!valid) return fail(res, 'Current password is incorrect', 401);

    const passwordHash = await hashPassword(req.body.newPassword);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    // Invalidate refresh cookies so stolen sessions die with the password change.
    res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(), maxAge: 0 });
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: 0 });
    return ok(res, null, 'Password changed — please log in again.');
  } catch (err) {
    console.error(err);
    return fail(res, DB_DOWN, 503);
  }
});

export default router;
