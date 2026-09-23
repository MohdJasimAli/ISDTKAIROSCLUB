import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok } from '../../utils/ApiResponse.js';

const router = Router();

router.get('/health', async (req, res) => {
  let db = 'disconnected';
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    db = 'connected';
  } catch (e) {
    db = 'disconnected: ' + e.message;
  }
  const status = db === 'connected' ? 200 : 503;
  return ok(res, { service: 'kairos-backend', db, time: new Date().toISOString() }, status === 200 ? 'Backend is running' : 'Backend database is unavailable', status);
});

export default router;
