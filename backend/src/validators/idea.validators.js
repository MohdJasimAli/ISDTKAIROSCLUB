import { z } from 'zod';
import { IDEA_CATEGORIES, IDEA_STAGES, SUPPORT_OPTIONS } from '../config/constants.js';

const inList = (list, message) => z.string().refine((v) => list.includes(v), { message });

const urlOrEmpty = z.union([z.string().trim().url('Must be a valid URL'), z.literal('')]);

export const createIdeaSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  category: inList(IDEA_CATEGORIES, 'Unknown category'),
  problemStatement: z.string().trim().min(20, 'Describe the problem in at least 20 characters').max(5000),
  proposedSolution: z.string().trim().min(20, 'Describe your solution in at least 20 characters').max(5000),
  expectedImpact: z.string().trim().min(10, 'Tell us the expected impact (min 10 characters)').max(3000),
  techStack: z.array(z.string().trim().max(50)).max(20).default([]),
  requiredSkills: z.array(z.string().trim().max(50)).max(20).default([]),
  supportNeeded: z
    .array(inList(SUPPORT_OPTIONS, 'Unknown support option'))
    .min(1, 'Pick at least one type of support')
    .max(SUPPORT_OPTIONS.length),
  currentStage: inList(IDEA_STAGES, 'Unknown stage').default('JUST_AN_IDEA'),
  hasExistingTeam: z.boolean().default(false),
  existingTeamMembers: z.string().trim().max(1000).optional(),
  demoLink: urlOrEmpty.optional(),
});

export const updateIdeaSchema = createIdeaSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'Nothing to update' });

export const reviewIdeaSchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
    note: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.action !== 'REQUEST_CHANGES' || (d.note && d.note.length >= 5), {
    message: 'A note is required when requesting changes',
    path: ['note'],
  });

export const interestSchema = z.object({
  message: z.string().trim().min(3, 'Say a little more').max(1000).optional(),
  skillsOffered: z.array(z.string().trim().max(50)).max(15).optional(),
});
