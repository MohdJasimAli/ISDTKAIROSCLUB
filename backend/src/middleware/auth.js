import prisma from '../config/db.js';
import { fail } from '../utils/ApiResponse.js';
import { verifyAccessToken, ACCESS_COOKIE } from '../utils/jwt.js';
import { publicUserSelect } from '../utils/publicUser.js';

const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';

/** Attaches req.user when a valid, active session exists. Returns status strings for failures. */
async function attachUser(req) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return 'NO_TOKEN';

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return 'EXPIRED';
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: publicUserSelect });
  if (!user) return 'NOT_FOUND';
  if (!user.isActive) return 'DISABLED';

  req.user = user;
  return 'OK';
}

/** Requires a valid access cookie AND an active user in the DB. */
export async function requireAuth(req, res, next) {
  try {
    const status = await attachUser(req);
    if (status === 'NO_TOKEN') return fail(res, 'Authentication required', 401);
    if (status === 'EXPIRED') return fail(res, 'Session expired — please log in again', 401);
    if (status === 'NOT_FOUND') return fail(res, 'Account not found', 401);
    if (status === 'DISABLED') return fail(res, 'Account disabled', 403);
    return next();
  } catch (err) {
    console.error(err);
    return fail(res, DB_DOWN, 503);
  }
}

/** Attaches req.user when possible, otherwise continues anonymously (never fails). */
export async function optionalAuth(req, res, next) {
  try {
    await attachUser(req);
  } catch {
    // anonymous access is fine for public pages
  }
  return next();
}

/** Role gate — requireRole('ADMIN') or requireRole('ADMIN', 'MENTOR'). */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) return fail(res, 'You do not have permission to do this', 403);
    return next();
  };
}
