import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { announcementSchema, announcementUpdateSchema, archiveSchema, publishSchema } from '../../validators/admin.validators.js';

const router = Router();
const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';
const ADMIN = requireRole('ADMIN');

function dbFail(res, err) {
  console.error(err);
  return fail(res, DB_DOWN, 503);
}

// GET /api/v1/admin/announcements — all, including archived.
router.get('/admin/announcements', requireAuth, ADMIN, async (req, res) => {
  try {
    const items = await prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: { author: { select: { name: true } } },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/admin/announcements — create (auto-stamps publishedAt).
router.post('/admin/announcements', requireAuth, ADMIN, validate(announcementSchema), async (req, res) => {
  try {
    const { isPublished = false, ...rest } = req.body;
    const announcement = await prisma.announcement.create({
      data: {
        ...rest,
        isPublished,
        authorId: req.user.id,
        ...(isPublished ? { publishedAt: new Date() } : {}),
      },
    });
    return ok(res, announcement, 'Announcement created', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/admin/announcements/:id — edit.
router.patch('/admin/announcements/:id', requireAuth, ADMIN, validate(announcementUpdateSchema), async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({ where: { id: req.params.id }, select: { id: true, isPublished: true } });
    if (!existing) return fail(res, 'Announcement not found', 404);

    const data = { ...req.body };
    if (data.isPublished === true && !existing.isPublished) data.publishedAt = new Date();

    const announcement = await prisma.announcement.update({ where: { id: existing.id }, data });
    return ok(res, announcement, 'Announcement updated');
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/admin/announcements/:id/publish
router.post('/admin/announcements/:id/publish', requireAuth, ADMIN, validate(publishSchema), async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return fail(res, 'Announcement not found', 404);
    const announcement = await prisma.announcement.update({
      where: { id: existing.id },
      data: {
        isPublished: req.body.isPublished,
        ...(req.body.isPublished ? { publishedAt: new Date(), archivedAt: null } : {}),
      },
    });
    return ok(res, announcement, req.body.isPublished ? 'Announcement published' : 'Announcement unpublished');
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/admin/announcements/:id/archive
router.post('/admin/announcements/:id/archive', requireAuth, ADMIN, validate(archiveSchema), async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return fail(res, 'Announcement not found', 404);
    const announcement = await prisma.announcement.update({
      where: { id: existing.id },
      data: {
        archivedAt: req.body.archived ? new Date() : null,
        ...(req.body.archived ? { isPublished: false } : {}),
      },
    });
    return ok(res, announcement, req.body.archived ? 'Announcement archived' : 'Announcement restored');
  } catch (err) {
    return dbFail(res, err);
  }
});

// DELETE /api/v1/admin/announcements/:id
router.delete('/admin/announcements/:id', requireAuth, ADMIN, async (req, res) => {
  try {
    const existing = await prisma.announcement.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return fail(res, 'Announcement not found', 404);
    await prisma.announcement.delete({ where: { id: existing.id } });
    return ok(res, null, 'Announcement deleted');
  } catch (err) {
    return dbFail(res, err);
  }
});

export default router;
