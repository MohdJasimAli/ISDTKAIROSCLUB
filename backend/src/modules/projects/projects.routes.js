import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Statuses visible to the public — IDEA_SUBMITTED / UNDER_REVIEW stay private until approved.
const PUBLIC_STATUSES = [
  'APPROVED', 'TEAM_FORMATION', 'DEVELOPMENT', 'TESTING',
  'PROTOTYPE_READY', 'SHOWCASE', 'CONNECTED_WITH_ISDT', 'COMPLETED',
];

function dbFail(res, err) {
  console.error(err);
  return fail(res, 'Database unavailable — run migration and check DATABASE_URL', 503);
}

export async function listPublicProjects(req, res) {
  try {
    const { search = '', category, status, page = 1, limit = 12 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    const where = {
      status: status && PUBLIC_STATUSES.includes(status) ? status : { in: PUBLIC_STATUSES },
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
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * take,
        take,
        select: {
          id: true, name: true, description: true, category: true, technologies: true,
          status: true, progress: true, demoUrl: true, githubUrl: true, isFeatured: true,
          createdAt: true,
          lead: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
    ]);

    // Annotate with the viewer's request/membership state (when logged in).
    let annotated = items;
    if (req.user && items.length) {
      const ids = items.map((p) => p.id);
      const [requests, memberships] = await Promise.all([
        prisma.joinRequest.findMany({
          where: { projectId: { in: ids }, applicantId: req.user.id },
          select: { projectId: true, status: true },
        }),
        prisma.projectMember.findMany({
          where: { projectId: { in: ids }, userId: req.user.id },
          select: { projectId: true },
        }),
      ]);
      const requestMap = Object.fromEntries(requests.map((r) => [r.projectId, r.status]));
      const memberSet = new Set(memberships.map((m) => m.projectId));
      annotated = items.map((p) => ({
        ...p,
        myInterest: requestMap[p.id] ?? null,
        viewerIsMember: memberSet.has(p.id),
      }));
    }

    return ok(res, { items: annotated, total, page: pageNum, limit: take });
  } catch (err) {
    return dbFail(res, err);
  }
}

export async function getPublicProject(req, res) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, status: { in: PUBLIC_STATUSES } },
      include: {
        lead: { select: { id: true, name: true, department: true, year: true } },
        members: {
          include: { user: { select: { id: true, name: true, department: true, year: true, skills: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        updates: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } },
        sourceIdea: { select: { id: true, title: true, category: true } },
      },
    });
    if (!project) return fail(res, 'Project not found', 404);

    let myInterest = null;
    let viewerIsMember = false;
    if (req.user) {
      const [request, membership] = await Promise.all([
        prisma.joinRequest.findFirst({
          where: { projectId: project.id, applicantId: req.user.id },
          select: { status: true, createdAt: true },
        }),
        prisma.projectMember.findFirst({
          where: { projectId: project.id, userId: req.user.id },
          select: { role: true },
        }),
      ]);
      myInterest = request;
      viewerIsMember = Boolean(membership);
    }

    return ok(res, {
      ...project,
      viewerIsLead: project.leadId === req.user?.id,
      viewerIsMember,
      myInterest,
    });
  } catch (err) {
    return dbFail(res, err);
  }
}

router.get('/projects', optionalAuth, listPublicProjects);
router.get('/projects/:id', optionalAuth, getPublicProject);

export default router;
