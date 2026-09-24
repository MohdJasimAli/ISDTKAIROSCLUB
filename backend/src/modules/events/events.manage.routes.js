import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { eventSchema, eventUpdateSchema, publishSchema } from '../../validators/admin.validators.js';
import { uniqueSlug } from '../../utils/slug.js';
import { env } from '../../config/env.js';

const router = Router();
const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';
const ADMIN = requireRole('ADMIN');

function dbFail(res, err) {
  console.error(err);
  return fail(res, DB_DOWN, 503);
}

// GET /api/v1/admin/events — all events incl. unpublished.
router.get('/admin/events', requireAuth, ADMIN, async (req, res) => {
  try {
    const items = await prisma.event.findMany({
      orderBy: { startsAt: 'desc' },
      include: { _count: { select: { registrations: true } } },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/admin/events — create.
router.post('/admin/events', requireAuth, ADMIN, validate(eventSchema), async (req, res) => {
  try {
    const { slug, imageUrl, endsAt, ...rest } = req.body;
    if (endsAt && endsAt < rest.startsAt) return fail(res, 'End time must be after start time', 422);
    const event = await prisma.event.create({
      data: {
        ...rest,
        ...(endsAt ? { endsAt } : {}),
        imageUrl: imageUrl || null,
        slug: await uniqueSlug(prisma, 'event', slug || rest.title),
      },
    });
    return ok(res, event, 'Event created', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/admin/events/:id — edit.
router.patch('/admin/events/:id', requireAuth, ADMIN, validate(eventUpdateSchema), async (req, res) => {
  try {
    const existing = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: { id: true, startsAt: true, endsAt: true },
    });
    if (!existing) return fail(res, 'Event not found', 404);

    const { slug, imageUrl, ...rest } = req.body;
    const data = { ...rest };
    if ('imageUrl' in req.body) data.imageUrl = imageUrl || null;
    if (slug) data.slug = await uniqueSlug(prisma, 'event', slug, existing.id);

    const resolvedEnd = 'endsAt' in data ? data.endsAt : existing.endsAt;
    const resolvedStart = 'startsAt' in data ? data.startsAt : existing.startsAt;
    if (resolvedEnd && resolvedStart && resolvedEnd < resolvedStart) {
      return fail(res, 'End time must be after start time', 422);
    }

    const event = await prisma.event.update({ where: { id: existing.id }, data });
    return ok(res, event, 'Event updated');
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/admin/events/reset — wipe ALL boards (ideas, projects,
// requests, events, announcements, messages). Keeps users and team profiles so
// nobody loses their account. Blocked in production by default.
router.post('/admin/events/reset', requireAuth, ADMIN, async (req, res) => {
  try {
    if (env.isProd && process.env.ALLOW_ADMIN_RESET !== 'true') {
      return fail(res, 'Reset is disabled in production. Set ALLOW_ADMIN_RESET=true to enable temporarily.', 403);
    }

    const summary = {};
    summary.joinRequests = (await prisma.joinRequest.deleteMany({})).count;
    summary.projectUpdates = (await prisma.projectUpdate.deleteMany({})).count;
    summary.projectMembers = (await prisma.projectMember.deleteMany({})).count;
    summary.projects = (await prisma.project.deleteMany({})).count;
    summary.ideas = (await prisma.idea.deleteMany({})).count;
    summary.eventRegistrations = (await prisma.eventRegistration.deleteMany({})).count;
    summary.events = (await prisma.event.deleteMany({})).count;
    summary.announcements = (await prisma.announcement.deleteMany({})).count;
    summary.contactMessages = (await prisma.contactMessage.deleteMany({})).count;

    return ok(res, summary, 'Demo boards wiped. Users and team profiles were kept.');
  } catch (err) {
    return dbFail(res, err);
  }
});
router.post('/admin/events/:id/publish', requireAuth, ADMIN, validate(publishSchema), async (req, res) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return fail(res, 'Event not found', 404);
    const event = await prisma.event.update({
      where: { id: existing.id },
      data: { isPublished: req.body.isPublished },
    });
    return ok(res, event, req.body.isPublished ? 'Event published' : 'Event unpublished');
  } catch (err) {
    return dbFail(res, err);
  }
});

// DELETE /api/v1/admin/events/:id
router.delete('/admin/events/:id', requireAuth, ADMIN, async (req, res) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return fail(res, 'Event not found', 404);
    await prisma.eventRegistration.deleteMany({ where: { eventId: existing.id } });
    await prisma.event.delete({ where: { id: existing.id } });
    return ok(res, null, 'Event deleted');
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/admin/events/:id/registrations
router.get('/admin/events/:id/registrations', requireAuth, ADMIN, async (req, res) => {
  try {
    const items = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

export default router;
