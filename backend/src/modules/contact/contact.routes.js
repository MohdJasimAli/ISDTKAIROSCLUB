import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { strictLimiter } from '../../middleware/rateLimiter.js';
import { contactSchema } from '../../validators/public.validators.js';

const router = Router();

export async function createContact(req, res) {
  try {
    await prisma.contactMessage.create({ data: req.body });
    return ok(res, null, 'Thanks! Your message has been received — we usually reply within 2–3 days.', 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Database unavailable — run migration and check DATABASE_URL', 503);
  }
}

router.post('/contact', strictLimiter, validate(contactSchema), createContact);

export default router;
