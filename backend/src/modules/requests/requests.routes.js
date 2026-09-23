import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { strictLimiter } from '../../middleware/rateLimiter.js';
import { projectInterestSchema, requestReviewSchema } from '../../validators/project.validators.js';

const router = Router();
const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';

// Projects in these statuses are visible/joinable by students.
const PUBLIC_STATUSES = [
  'APPROVED', 'TEAM_FORMATION', 'DEVELOPMENT', 'TESTING',
  'PROTOTYPE_READY', 'SHOWCASE', 'CONNECTED_WITH_ISDT', 'COMPLETED',
];

function dbFail(res, err) {
  console.error(err);
  return fail(res, DB_DOWN, 503);
}

// POST /api/v1/projects/:id/interest — "I'm Interested" on a project.
router.post('/projects/:id/interest', requireAuth, strictLimiter, validate(projectInterestSchema), async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, leadId: true, status: true },
    });
    if (!project || !PUBLIC_STATUSES.includes(project.status)) return fail(res, 'Project not found', 404);
    if (project.leadId === req.user.id) return fail(res, 'You already lead this project!', 400);

    const member = await prisma.projectMember.findFirst({ where: { projectId: project.id, userId: req.user.id } });
    if (member) return fail(res, 'You are already on this team', 409);

    const existing = await prisma.joinRequest.findFirst({ where: { projectId: project.id, applicantId: req.user.id } });
    if (existing) return fail(res, 'You have already expressed interest in this project', 409);

    await prisma.joinRequest.create({
      data: {
        projectId: project.id,
        applicantId: req.user.id,
        message: req.body.message || "I'm interested in joining this project.",
        skillsOffered: req.body.skillsOffered || [],
        status: 'PENDING',
      },
    });
    return ok(res, null, 'Interest sent! Team formation is admin-assisted — the Kairos team reviews every match.', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/requests/mine — my join requests across ideas and projects.
router.get('/requests/mine', requireAuth, async (req, res) => {
  try {
    const items = await prisma.joinRequest.findMany({
      where: { applicantId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, status: true, message: true, createdAt: true, updatedAt: true,
        idea: { select: { id: true, title: true, category: true } },
        project: { select: { id: true, name: true, status: true } },
        reviewedBy: { select: { name: true } },
      },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/projects/:id/requests — project lead or admin.
router.get('/projects/:id/requests', requireAuth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, leadId: true },
    });
    if (!project) return fail(res, 'Project not found', 404);
    if (req.user.role !== 'ADMIN' && project.leadId !== req.user.id) {
      return fail(res, 'Only the project lead or an admin can view team requests', 403);
    }

    const items = await prisma.joinRequest.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
      include: {
        applicant: {
          select: {
            id: true, name: true, email: true, department: true, year: true,
            skills: true, bio: true, githubUrl: true, linkedinUrl: true,
          },
        },
      },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/requests/:id/review — admin approves (adds student to the team) or rejects.
// Idea-based requests resolve to the project created from that idea.
router.post('/requests/:id/review', requireAuth, requireRole('ADMIN'), validate(requestReviewSchema), async (req, res) => {
  try {
    const request = await prisma.joinRequest.findUnique({
      where: { id: req.params.id },
      include: {
        idea: { select: { id: true, title: true, project: { select: { id: true } } } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!request) return fail(res, 'Request not found', 404);
    if (request.status !== 'PENDING') {
      return fail(res, `This request was already ${request.status.toLowerCase()}`, 409);
    }

    const { action } = req.body;
    const label = request.project?.name || request.idea?.title || 'the project';

    if (action === 'APPROVE') {
      const projectId = request.projectId || request.idea?.project?.id || null;
      if (!projectId) {
        return fail(res, 'No project exists for this idea yet — convert the idea into a project first', 409);
      }
      const member = await prisma.projectMember.findFirst({
        where: { projectId, userId: request.applicantId },
      });
      if (!member) {
        await prisma.projectMember.create({
          data: { projectId, userId: request.applicantId, role: 'MEMBER' },
        });
      }
    }

    const updated = await prisma.joinRequest.update({
      where: { id: request.id },
      data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', reviewedById: req.user.id },
    });

    return ok(
      res,
      updated,
      action === 'APPROVE'
        ? `Approved — the student has been added to ${label}.`
        : `Request for ${label} was rejected.`
    );
  } catch (err) {
    return dbFail(res, err);
  }
});

export default router;
