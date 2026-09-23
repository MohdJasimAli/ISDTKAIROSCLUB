import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';

const router = Router();

export async function listTeam(req, res) {
  try {
    const items = await prisma.teamProfile.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return ok(res, items);
  } catch (err) {
    console.error(err);
    return fail(res, 'Database unavailable — run migration and check DATABASE_URL', 503);
  }
}

router.get('/team', listTeam);
export default router;
