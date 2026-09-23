import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { adminUserUpdateSchema, markReadSchema } from '../../validators/admin.validators.js';

const router = Router();
const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';

function dbFail(res, err) {
  console.error(err);
  return fail(res, DB_DOWN, 503);
}

// Everything below is admin-only.
router.use(requireAuth, requireRole('ADMIN'));

// GET /api/v1/admin/stats — dashboard metrics.
router.get('/admin/stats', async (req, res) => {
  try {
    const [
      students, admins, members, pendingUsers,
      ideasTotal, ideasPending, ideasApproved, ideasRejected,
      projectsActive, projectsCompleted, projectsTeamFormation,
      requestsPending, eventsTotal, eventsPublished, messagesUnread,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { membershipStatus: 'MEMBER' } }),
      prisma.user.count({ where: { membershipStatus: 'PENDING' } }),
      prisma.idea.count(),
      prisma.idea.count({ where: { status: { in: ['PENDING_REVIEW', 'UNDER_REVIEW'] } } }),
      prisma.idea.count({ where: { status: 'APPROVED' } }),
      prisma.idea.count({ where: { status: 'REJECTED' } }),
      prisma.project.count({ where: { status: { in: ['APPROVED', 'TEAM_FORMATION', 'DEVELOPMENT', 'TESTING', 'PROTOTYPE_READY', 'SHOWCASE', 'CONNECTED_WITH_ISDT'] } } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'TEAM_FORMATION' } }),
      prisma.joinRequest.count({ where: { status: 'PENDING' } }),
      prisma.event.count(),
      prisma.event.count({ where: { isPublished: true } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

    return ok(res, {
      users: { students, admins, members, pendingMembership: pendingUsers },
      ideas: { total: ideasTotal, pending: ideasPending, approved: ideasApproved, rejected: ideasRejected },
      projects: { active: projectsActive, completed: projectsCompleted, teamFormation: projectsTeamFormation },
      requestsPending,
      events: { total: eventsTotal, published: eventsPublished },
      messagesUnread,
    });
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/admin/ideas — every idea, any status.
router.get('/admin/ideas', async (req, res) => {
  try {
    const { search = '', status, category, page = 1, limit = 20 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = {
      ...(status && { status }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { problemStatement: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await prisma.$transaction([
      prisma.idea.count({ where }),
      prisma.idea.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * take,
        take,
        select: {
          id: true, title: true, category: true, status: true, isPublic: true,
          currentStage: true, viewCount: true, reviewerNote: true, createdAt: true,
          submitter: { select: { id: true, name: true, email: true, department: true, year: true } },
        },
      }),
    ]);

    // Flag which ideas already have a project so the UI can hide "convert".
    const converted = await prisma.project.findMany({
      where: { sourceIdeaId: { in: items.map((i) => i.id) } },
      select: { id: true, sourceIdeaId: true },
    });
    const projectByIdea = Object.fromEntries(converted.map((p) => [p.sourceIdeaId, p.id]));
    const annotated = items.map((i) => ({ ...i, projectId: projectByIdea[i.id] ?? null }));

    return ok(res, { items: annotated, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/admin/users — students + admins with participation counts.
router.get('/admin/users', async (req, res) => {
  try {
    const { search = '', role, membershipStatus, page = 1, limit = 20 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = {
      ...(role && { role }),
      ...(membershipStatus && { membershipStatus }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * take,
        take,
        select: {
          id: true, name: true, email: true, role: true, department: true, year: true,
          phone: true, skills: true, interests: true, githubUrl: true, linkedinUrl: true,
          membershipStatus: true, isActive: true, createdAt: true,
          _count: { select: { ideas: true, memberships: true, joinRequests: true } },
        },
      }),
    ]);

    return ok(res, { items, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/admin/users/:id — membership / role / active state.
router.patch('/admin/users/:id', validate(adminUserUpdateSchema), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return fail(res, 'You cannot change your own role, membership or active state', 400);
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!user) return fail(res, 'Student not found', 404);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: req.body,
      select: { id: true, name: true, role: true, membershipStatus: true, isActive: true },
    });
    return ok(res, updated, 'Student updated');
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/admin/projects — all projects incl. internal statuses.
router.get('/admin/projects', async (req, res) => {
  try {
    const { search = '', status, category, page = 1, limit = 20 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = {
      ...(status && { status }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (pageNum - 1) * take,
        take,
        select: {
          id: true, name: true, category: true, status: true, progress: true,
          isFeatured: true, githubUrl: true, demoUrl: true, createdAt: true, updatedAt: true,
          lead: { select: { id: true, name: true, email: true } },
          sourceIdea: { select: { id: true, title: true } },
          members: { select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { members: true, updates: true, joinRequests: true } },
        },
      }),
    ]);

    return ok(res, { items, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/admin/requests — every team application.
router.get('/admin/requests', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = { ...(status && { status }) };
    const [total, items] = await prisma.$transaction([
      prisma.joinRequest.count({ where }),
      prisma.joinRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * take,
        take,
        include: {
          applicant: {
            select: {
              id: true, name: true, email: true, department: true, year: true,
              skills: true, githubUrl: true,
            },
          },
          idea: { select: { id: true, title: true } },
          project: { select: { id: true, name: true, status: true } },
          reviewedBy: { select: { name: true } },
        },
      }),
    ]);
    return ok(res, { items, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/admin/messages — contact form inbox.
router.get('/admin/messages', async (req, res) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = unreadOnly === 'true' ? { isRead: false } : {};
    const [total, items] = await prisma.$transaction([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * take, take }),
    ]);
    return ok(res, { items, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/admin/messages/:id — mark read/unread.
router.patch('/admin/messages/:id', validate(markReadSchema), async (req, res) => {
  try {
    const message = await prisma.contactMessage.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!message) return fail(res, 'Message not found', 404);
    const updated = await prisma.contactMessage.update({
      where: { id: message.id },
      data: { isRead: req.body.isRead },
    });
    return ok(res, updated, req.body.isRead ? 'Marked as read' : 'Marked as unread');
  } catch (err) {
    return dbFail(res, err);
  }
});

export default router;
