import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';

const router = Router();

export async function listPublished(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);
    // Archived items always have isPublished=false (see manage archive handler),
    // so filtering on isPublished alone is exact. Do NOT add `archivedAt: null`:
    // on MongoDB, Prisma's null filter matches explicit-null only, not missing
    // fields — docs created without archivedAt would silently vanish.
    const items = await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: { id: true, title: true, body: true, isPinned: true, publishedAt: true, createdAt: true },
    });
    return ok(res, items);
  } catch (err) {
    console.error(err);
    return fail(res, 'Database unavailable — run migration and check DATABASE_URL', 503);
  }
}

router.get('/announcements', listPublished);
export default router;
