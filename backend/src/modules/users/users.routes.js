import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { updateProfileSchema } from '../../validators/auth.validators.js';
import { publicUserSelect } from '../../utils/publicUser.js';

const router = Router();

router.get('/users/me', requireAuth, (req, res) => ok(res, req.user));

router.patch('/users/me', requireAuth, validate(updateProfileSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.githubUrl === '') data.githubUrl = null;
    if (data.linkedinUrl === '') data.linkedinUrl = null;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: publicUserSelect,
    });
    return ok(res, user, 'Profile updated');
  } catch (err) {
    console.error(err);
    return fail(res, 'Database unavailable — run migration and check DATABASE_URL', 503);
  }
});

export default router;
