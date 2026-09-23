import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { strictLimiter } from '../../middleware/rateLimiter.js';
import { eventRegisterSchema } from '../../validators/public.validators.js';

const router = Router();

function dbFail(res, err) {
  console.error(err);
  return fail(res, 'Database unavailable — run migration and check DATABASE_URL', 503);
}

export async function listPublished(req, res) {
  try {
    const items = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true, title: true, slug: true, description: true, venue: true,
        startsAt: true, endsAt: true, imageUrl: true, maxSeats: true,
        _count: { select: { registrations: true } },
      },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
}

export async function getBySlug(req, res) {
  try {
    const event = await prisma.event.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) return fail(res, 'Event not found', 404);
    return ok(res, event);
  } catch (err) {
    return dbFail(res, err);
  }
}

export async function register(req, res) {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, isPublished: true },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) return fail(res, 'Event not found', 404);

    if (event.maxSeats && event._count.registrations >= event.maxSeats) {
      return fail(res, 'This event is full', 409);
    }

    const dupe = await prisma.eventRegistration.findFirst({
      where: { eventId: event.id, email: req.body.email },
    });
    if (dupe) return fail(res, 'This email is already registered', 409);

    await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
      },
    });
    return ok(res, null, 'Registration confirmed — see you there!', 201);
  } catch (err) {
    return dbFail(res, err);
  }
}

router.get('/events', listPublished);
router.get('/events/:slug', getBySlug);
router.post('/events/:id/register', strictLimiter, validate(eventRegisterSchema), register);

export default router;
