import { z } from 'zod';
import { IDEA_CATEGORIES, PROJECT_STATUSES } from '../config/constants.js';

const inList = (list, message) => z.string().refine((v) => list.includes(v), { message });

export const adminUserUpdateSchema = z
  .object({
    membershipStatus: z.enum(['PENDING', 'MEMBER', 'VOLUNTEER', 'REJECTED']).optional(),
    role: z.enum(['STUDENT', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Nothing to update' });

export const createProjectSchema = z.object({
  name: z.string().trim().min(5).max(150),
  description: z.string().trim().min(10).max(5000),
  problem: z.string().trim().min(10).max(5000),
  solution: z.string().trim().min(10).max(5000),
  category: inList(IDEA_CATEGORIES, 'Unknown category'),
  technologies: z.array(z.string().trim().max(50)).max(30).optional(),
  status: inList(PROJECT_STATUSES, 'Unknown status').optional(),
  leadId: z.string().trim().min(1).optional(),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().min(10).max(5000),
  venue: z.string().trim().max(200).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  maxSeats: z.coerce.number().int().min(1).max(5000).optional(),
  isPublished: z.boolean().optional(),
});

export const eventUpdateSchema = eventSchema.partial().refine((o) => Object.keys(o).length > 0, {
  message: 'Nothing to update',
});

export const publishSchema = z.object({ isPublished: z.boolean() });

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(10).max(5000),
  isPublished: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export const announcementUpdateSchema = announcementSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: 'Nothing to update' });

export const archiveSchema = z.object({ archived: z.boolean() });

export const markReadSchema = z.object({ isRead: z.boolean() });
