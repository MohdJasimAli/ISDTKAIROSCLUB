import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole, optionalAuth } from '../../middleware/auth.js';
import { ideaLimiter, strictLimiter } from '../../middleware/rateLimiter.js';
import { createIdeaSchema, updateIdeaSchema, reviewIdeaSchema, interestSchema } from '../../validators/idea.validators.js';

const router = Router();
const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';
const EDITABLE_STATUSES = ['PENDING_REVIEW', 'CHANGES_REQUESTED'];

const submitterPublic = { select: { id: true, name: true, department: true, year: true } };

function dbFail(res, err) {
  console.error(err);
  return fail(res, DB_DOWN, 503);
}

// Empty optional strings → null for storage.
function cleanInput(body) {
  const out = { ...body };
  if ('demoLink' in out) out.demoLink = out.demoLink || null;
  if ('existingTeamMembers' in out) out.existingTeamMembers = out.existingTeamMembers || null;
  return out;
}

// POST /api/v1/ideas — authenticated submission, starts PENDING_REVIEW.
router.post('/ideas', requireAuth, ideaLimiter, validate(createIdeaSchema), async (req, res) => {
  try {
    const idea = await prisma.idea.create({
      data: {
        ...cleanInput(req.body),
        submitterId: req.user.id,
        status: 'PENDING_REVIEW',
        isPublic: false,
      },
    });
    return ok(res, idea, 'Idea submitted — the Kairos team will review it shortly.', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/ideas — public discovery: ONLY approved + public ideas.
router.get('/ideas', optionalAuth, async (req, res) => {
  try {
    const { search = '', category, currentStage, tech, page = 1, limit = 12 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = {
      isPublic: true,
      status: 'APPROVED',
      ...(category && { category }),
      ...(currentStage && { currentStage }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { problemStatement: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const select = {
      id: true, title: true, problemStatement: true, category: true,
      requiredSkills: true, techStack: true, currentStage: true,
      hasExistingTeam: true, viewCount: true, createdAt: true,
    };

    let items;
    let total;
    if (tech) {
      // techStack is a JSON array — Prisma can't filter it server-side. The idea
      // corpus is small by design, so filter in memory then paginate.
      const all = await prisma.idea.findMany({ where, select, orderBy: { createdAt: 'desc' } });
      const needle = tech.toLowerCase();
      const filtered = all.filter((i) =>
        (i.techStack ?? []).some((t) => String(t).toLowerCase().includes(needle))
      );
      total = filtered.length;
      items = filtered.slice((pageNum - 1) * take, pageNum * take);
    } else {
      [total, items] = await prisma.$transaction([
        prisma.idea.count({ where }),
        prisma.idea.findMany({
          where, select, orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * take, take,
        }),
      ]);
    }

    // Annotate with the viewer's interest state so buttons render correctly.
    let interests = {};
    if (req.user && items.length) {
      const mine = await prisma.joinRequest.findMany({
        where: { applicantId: req.user.id, ideaId: { in: items.map((i) => i.id) } },
        select: { ideaId: true, status: true },
      });
      interests = Object.fromEntries(mine.map((r) => [r.ideaId, r.status]));
    }
    items = items.map((i) => ({ ...i, myInterest: interests[i.id] ?? null }));

    return ok(res, { items, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/ideas/mine — the submitter's own ideas, any status.
router.get('/ideas/mine', requireAuth, async (req, res) => {
  try {
    const items = await prisma.idea.findMany({
      where: { submitterId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, category: true, currentStage: true, status: true,
        reviewerNote: true, isPublic: true, viewCount: true, createdAt: true, updatedAt: true,
      },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/ideas/:id — public only when approved+public; otherwise owner/admin only.
router.get('/ideas/:id', optionalAuth, async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: req.params.id },
      include: { submitter: submitterPublic },
    });
    if (!idea) return fail(res, 'Idea not found', 404);

    const isOwner = req.user?.id === idea.submitterId;
    const isAdmin = req.user?.role === 'ADMIN';
    // Mask existence of unapproved ideas from the public.
    if (!idea.isPublic && !isOwner && !isAdmin) return fail(res, 'Idea not found', 404);

    if (idea.isPublic && !isOwner && !isAdmin) {
      idea.viewCount += 1;
      await prisma.idea.update({ where: { id: idea.id }, data: { viewCount: { increment: 1 } } });
      delete idea.reviewerNote; // internal review feedback never goes to the public
    }

    let myInterest = null;
    if (req.user) {
      myInterest = await prisma.joinRequest.findFirst({
        where: { ideaId: idea.id, applicantId: req.user.id },
        select: { status: true, createdAt: true },
      });
    }

    return ok(res, {
      ...idea,
      viewerIsOwner: isOwner,
      canEdit: isAdmin || (isOwner && EDITABLE_STATUSES.includes(idea.status)),
      myInterest,
    });
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/ideas/:id — owner edits while PENDING/CHANGES_REQUESTED (auto-resubmits);
// admins can edit anytime without changing status.
router.patch('/ideas/:id', requireAuth, validate(updateIdeaSchema), async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({ where: { id: req.params.id } });
    if (!idea) return fail(res, 'Idea not found', 404);

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = idea.submitterId === req.user.id;
    if (!isOwner && !isAdmin) return fail(res, 'This idea belongs to someone else', 403);
    if (isOwner && !isAdmin && !EDITABLE_STATUSES.includes(idea.status)) {
      return fail(res, `Ideas with status "${idea.status}" can no longer be edited — contact the Kairos team`, 409);
    }

    const data = cleanInput(req.body);
    if (isOwner && !isAdmin) {
      // Owner edits resubmit for a fresh review and clear the previous note.
      data.status = 'PENDING_REVIEW';
      data.reviewerNote = null;
      data.isPublic = false;
    }

    const updated = await prisma.idea.update({ where: { id: idea.id }, data });
    return ok(res, updated, 'Idea updated');
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/ideas/:id/interest — "I'm Interested". Admin-assisted matching: this
// only records the request (PENDING); the Kairos team reviews and forms teams (Phase 8).
router.post('/ideas/:id/interest', requireAuth, strictLimiter, validate(interestSchema), async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: req.params.id },
      select: { id: true, submitterId: true, isPublic: true, status: true },
    });
    if (!idea || !idea.isPublic || idea.status !== 'APPROVED') return fail(res, 'Idea not found', 404);
    if (idea.submitterId === req.user.id) {
      return fail(res, "This is your own idea — teammates will come to you!", 400);
    }
    const existing = await prisma.joinRequest.findFirst({
      where: { ideaId: idea.id, applicantId: req.user.id },
    });
    if (existing) return fail(res, 'You have already expressed interest in this idea', 409);

    await prisma.joinRequest.create({
      data: {
        ideaId: idea.id,
        applicantId: req.user.id,
        message: req.body.message || "I'm interested in joining this idea.",
        skillsOffered: req.body.skillsOffered || [],
        status: 'PENDING',
      },
    });
    return ok(res, null, 'Interest sent! Team formation is admin-assisted — the Kairos team reviews every match.', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/ideas/:id/review — admin approval workflow (UI lands in Phase 9).
router.post('/ideas/:id/review', requireAuth, requireRole('ADMIN'), validate(reviewIdeaSchema), async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({ where: { id: req.params.id } });
    if (!idea) return fail(res, 'Idea not found', 404);

    const { action, note } = req.body;
    const next = {
      APPROVE: { status: 'APPROVED', isPublic: true, reviewerNote: note || null },
      REJECT: { status: 'REJECTED', isPublic: false, reviewerNote: note || null },
      REQUEST_CHANGES: { status: 'CHANGES_REQUESTED', isPublic: false, reviewerNote: note },
    }[action];

    const updated = await prisma.idea.update({ where: { id: idea.id }, data: next });
    const messages = {
      APPROVE: 'Idea approved — it is now visible in Explore Ideas.',
      REJECT: 'Idea rejected.',
      REQUEST_CHANGES: 'Changes requested — the submitter has been notified via their dashboard.',
    };
    return ok(res, updated, messages[action]);
  } catch (err) {
    return dbFail(res, err);
  }
});

export default router;
