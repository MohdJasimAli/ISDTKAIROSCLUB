import { Router } from 'express';
import prisma from '../../config/db.js';
import { ok, fail } from '../../utils/ApiResponse.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import {
  convertIdeaSchema, updateProjectSchema, projectStatusSchema,
  memberSchema, memberRoleSchema, projectUpdateSchema,
} from '../../validators/project.validators.js';
import { createProjectSchema } from '../../validators/admin.validators.js';
import { PROJECT_STATUS_TRANSITIONS } from '../../config/constants.js';

const router = Router();
const DB_DOWN = 'Database unavailable — check DATABASE_URL and that start-mongo.cmd is running';
const ADMIN = requireRole('ADMIN');

function dbFail(res, err) {
  console.error(err);
  return fail(res, DB_DOWN, 503);
}

/** Admin, or the project's lead, or a member (when allowMember). */
async function canManage(projectId, user, allowMember = false) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, leadId: true, status: true },
  });
  if (!project) return { project: null, allowed: false };
  if (user.role === 'ADMIN' || project.leadId === user.id) return { project, allowed: true };
  if (allowMember) {
    const member = await prisma.projectMember.findFirst({ where: { projectId, userId: user.id } });
    if (member) return { project, allowed: true };
  }
  return { project, allowed: false };
}

/** Keep the denormalized Project.leadId and ProjectMember.role in sync. */
async function setLead(projectId, userId) {
  const existing = await prisma.projectMember.findFirst({ where: { projectId, userId } });
  if (existing) {
    await prisma.projectMember.update({ where: { id: existing.id }, data: { role: 'LEAD' } });
  } else {
    await prisma.projectMember.create({ data: { projectId, userId, role: 'LEAD' } });
  }
  await prisma.project.update({ where: { id: projectId }, data: { leadId: userId } });
}

// POST /api/v1/projects/from-idea/:ideaId — convert an APPROVED idea into a project (admin).
router.post('/projects/from-idea/:ideaId', requireAuth, ADMIN, validate(convertIdeaSchema), async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({ where: { id: req.params.ideaId } });
    if (!idea) return fail(res, 'Idea not found', 404);
    if (idea.status !== 'APPROVED') return fail(res, 'Only approved ideas can become projects', 400);

    // Relations aren't populated without `include` on MongoDB — check explicitly.
    const existingProject = await prisma.project.findFirst({
      where: { sourceIdeaId: idea.id },
      select: { id: true },
    });
    if (existingProject) return fail(res, 'This idea has already been converted into a project', 409);

    const leadId = req.body.leadId || idea.submitterId;
    const lead = await prisma.user.findUnique({ where: { id: leadId }, select: { id: true, name: true } });
    if (!lead) return fail(res, 'Lead user not found', 404);

    const project = await prisma.project.create({
      data: {
        name: req.body.name || idea.title,
        description: idea.proposedSolution,
        problem: idea.problemStatement,
        solution: idea.proposedSolution,
        category: idea.category,
        technologies: idea.techStack ?? [],
        status: req.body.status || 'TEAM_FORMATION',
        progress: 0,
        leadId: lead.id,
        sourceIdeaId: idea.id,
        members: { create: [{ userId: lead.id, role: 'LEAD' }] },
      },
      include: { members: true },
    });
    // Note: the idea's public listing is unaffected; the project supersedes it for team work.
    return ok(res, project, `Project created — ${lead.name} is the project lead.`, 201);
  } catch (err) {
    if (err.code === 'P2002') {
      return fail(res, 'This idea has already been converted into a project', 409);
    }
    return dbFail(res, err);
  }
});

// GET /api/v1/projects/mine — projects I lead or belong to.
router.get('/projects/mine', requireAuth, async (req, res) => {
  try {
    const items = await prisma.project.findMany({
      where: { OR: [{ leadId: req.user.id }, { members: { some: { userId: req.user.id } } }] },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, name: true, category: true, status: true, progress: true,
        isFeatured: true, createdAt: true,
        lead: { select: { id: true, name: true } },
        _count: { select: { members: true, updates: true } },
      },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/projects/:id — lead/admin edit; admins only for featured & lead changes.
router.patch('/projects/:id', requireAuth, validate(updateProjectSchema), async (req, res) => {
  try {
    const { project, allowed } = await canManage(req.params.id, req.user);
    if (!project) return fail(res, 'Project not found', 404);
    if (!allowed) return fail(res, 'Only the project lead or an admin can edit this project', 403);

    const data = { ...req.body };
    if (data.githubUrl === '') data.githubUrl = null;
    if (data.demoUrl === '') data.demoUrl = null;

    if (req.user.role !== 'ADMIN') {
      delete data.isFeatured;
      delete data.leadId; // lead transfers happen via /members/:userId/role (admin)
    }
    if (data.leadId === '') data.leadId = null;
    if (data.leadId) {
      const leadUser = await prisma.user.findUnique({ where: { id: data.leadId }, select: { id: true } });
      if (!leadUser) return fail(res, 'Lead user not found', 404);
      delete data.leadId;
      await setLead(project.id, leadUser.id);
    }

    const updated = await prisma.project.update({ where: { id: project.id }, data });
    return ok(res, updated, 'Project updated');
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/projects/:id/status — validated status-machine transition (admin).
router.post('/projects/:id/status', requireAuth, ADMIN, validate(projectStatusSchema), async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: { id: true, status: true } });
    if (!project) return fail(res, 'Project not found', 404);

    const next = req.body.status;
    const allowedNext = PROJECT_STATUS_TRANSITIONS[project.status] ?? [];
    if (next !== project.status && !allowedNext.includes(next)) {
      return fail(
        res,
        `Cannot move from ${project.status} to ${next}. Allowed: ${allowedNext.join(', ') || 'none (terminal status)'}`,
        409
      );
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { status: next, ...(next === 'COMPLETED' ? { progress: 100 } : {}) },
    });
    const isdtNote = next === 'CONNECTED_WITH_ISDT'
      ? ' This flags the project for ISDT review/mentorship — it does not mean acceptance into ISDT.'
      : '';
    return ok(res, updated, `Status updated to ${next}.${isdtNote}`);
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/projects/:id/members — add by userId or email (admin).
router.post('/projects/:id/members', requireAuth, ADMIN, validate(memberSchema), async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!project) return fail(res, 'Project not found', 404);

    const user = req.body.userId
      ? await prisma.user.findUnique({ where: { id: req.body.userId }, select: { id: true, name: true } })
      : await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() }, select: { id: true, name: true } });
    if (!user) return fail(res, 'No student found with that id/email', 404);

    const existing = await prisma.projectMember.findFirst({ where: { projectId: project.id, userId: user.id } });
    if (existing) return fail(res, `${user.name} is already on this team`, 409);

    if (req.body.role === 'LEAD') {
      await setLead(project.id, user.id);
    } else {
      await prisma.projectMember.create({ data: { projectId: project.id, userId: user.id, role: 'MEMBER' } });
    }
    return ok(res, null, `${user.name} added to the team.`, 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// PATCH /api/v1/projects/:id/members/:userId/role — promote/demote (admin).
router.patch('/projects/:id/members/:userId/role', requireAuth, ADMIN, validate(memberRoleSchema), async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const member = await prisma.projectMember.findFirst({ where: { projectId, userId } });
    if (!member) return fail(res, 'That user is not on this team', 404);

    if (req.body.role === 'LEAD') {
      await setLead(projectId, userId);
    } else {
      await prisma.projectMember.update({ where: { id: member.id }, data: { role: 'MEMBER' } });
      const proj = await prisma.project.findUnique({ where: { id: projectId }, select: { leadId: true } });
      if (proj?.leadId === userId) {
        await prisma.project.update({ where: { id: projectId }, data: { leadId: null } });
      }
    }
    return ok(res, null, `Role updated to ${req.body.role}.`);
  } catch (err) {
    return dbFail(res, err);
  }
});

// DELETE /api/v1/projects/:id/members/:userId (admin).
router.delete('/projects/:id/members/:userId', requireAuth, ADMIN, async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const member = await prisma.projectMember.findFirst({ where: { projectId, userId } });
    if (!member) return fail(res, 'That user is not on this team', 404);

    await prisma.projectMember.delete({ where: { id: member.id } });
    const proj = await prisma.project.findUnique({ where: { id: projectId }, select: { leadId: true } });
    if (proj?.leadId === userId) {
      await prisma.project.update({ where: { id: projectId }, data: { leadId: null } });
    }
    return ok(res, null, 'Member removed from the team.');
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/projects/:id/updates — lead/member/admin posts progress.
router.post('/projects/:id/updates', requireAuth, validate(projectUpdateSchema), async (req, res) => {
  try {
    const { project, allowed } = await canManage(req.params.id, req.user, true);
    if (!project) return fail(res, 'Project not found', 404);
    if (!allowed) return fail(res, 'Only team members or admins can post updates', 403);

    const update = await prisma.projectUpdate.create({
      data: { projectId: project.id, authorId: req.user.id, ...req.body },
    });
    return ok(res, update, 'Update posted.', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

// GET /api/v1/projects/:id/updates — public when the project is publicly visible.
router.get('/projects/:id/updates', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: { id: true, status: true } });
    if (!project) return fail(res, 'Project not found', 404);
    const isPublic = ['APPROVED', 'TEAM_FORMATION', 'DEVELOPMENT', 'TESTING', 'PROTOTYPE_READY', 'SHOWCASE', 'CONNECTED_WITH_ISDT', 'COMPLETED'].includes(project.status);
    if (!isPublic) return fail(res, 'Project not found', 404);

    const items = await prisma.projectUpdate.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
    return ok(res, items);
  } catch (err) {
    return dbFail(res, err);
  }
});

// POST /api/v1/projects — create a project directly, without a source idea (admin).
router.post('/projects', requireAuth, ADMIN, validate(createProjectSchema), async (req, res) => {
  try {
    const { leadId, technologies, status, ...rest } = req.body;
    let lead = null;
    if (leadId) {
      lead = await prisma.user.findUnique({ where: { id: leadId }, select: { id: true, name: true } });
      if (!lead) return fail(res, 'Lead user not found', 404);
    }

    const project = await prisma.project.create({
      data: {
        ...rest,
        technologies: technologies ?? [],
        status: status || 'TEAM_FORMATION',
        progress: 0,
        ...(lead ? { leadId: lead.id, members: { create: [{ userId: lead.id, role: 'LEAD' }] } } : {}),
      },
      include: { members: true },
    });
    return ok(res, project, lead ? `Project created — ${lead.name} is the project lead.` : 'Project created.', 201);
  } catch (err) {
    return dbFail(res, err);
  }
});

export default router;
