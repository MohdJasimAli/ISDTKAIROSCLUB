import rateLimit from 'express-rate-limit';

/** General API limiter (mounted globally in app.js). */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Brute-force protection for login/register — its own bucket so general form
 *  spam (contact, event signup, interest) can never lock logins out. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts — please try again in a few minutes.' },
});

/** Tighter limiter for forms (contact, event registration). */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again in a few minutes.' },
});

/** Idea submissions — separate bucket so form spam can't lock out logins. */
export const ideaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'You have submitted several ideas recently — please try again later.' },
});
