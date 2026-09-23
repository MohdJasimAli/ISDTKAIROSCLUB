import { z } from 'zod';
import { IDEA_CATEGORIES, PROJECT_STATUSES } from '../config/constants.js';

const inList = (list, message) => z.string().refine((v) => list.includes(v), { message });
const urlOrEmpty = z.union([z.string().trim().url('Must be a valid URL'), z.literal('')]);

export const convertIdeaSchema = z.object({
  name: z.string().trim().min(5).max(150).optional(),
  leadId: z.string().trim().min(1).optional(),
  status: inList(PROJECT_STATUSES, 'Unknown status').optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(5).max(150).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    problem: z.string().trim().min(10).max(5000).optional(),
    solution: z.string().trim().min(10).max(5000).optional(),
    category: inList(IDEA_CATEGORIES, 'Unknown category').optional(),
    technologies: z.array(z.string().trim().max(50)).max(30).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    githubUrl: urlOrEmpty.nullable().optional(),
    demoUrl: urlOrEmpty.nullable().optional(),
    images: z.array(z.string().trim().url()).max(10).optional(),
    isFeatured: z.boolean().optional(),
    leadId: z.union([z.string().trim().min(1), z.literal(''), z.null()]).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'Nothing to update' });

export const projectStatusSchema = z.object({ status: inList(PROJECT_STATUSES, 'Unknown status') });

export const memberSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    email: z.string().trim().email('Invalid email').optional(),
    role: z.enum(['LEAD', 'MEMBER']).default('MEMBER'),
  })
  .refine((d) => d.userId || d.email, { message: 'Provide a userId or email', path: ['userId'] });

export const memberRoleSchema = z.object({ role: z.enum(['LEAD', 'MEMBER']) });

export const projectInterestSchema = z.object({
  message: z.string().trim().min(3, 'Say a little more').max(1000).optional(),
  skillsOffered: z.array(z.string().trim().max(50)).max(15).optional(),
});

export const requestReviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
});

export const projectUpdateSchema = z.object({
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(10).max(5000),
  images: z.array(z.string().trim().url()).max(6).optional(),
});
