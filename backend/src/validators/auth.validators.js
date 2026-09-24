import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .max(150, 'Email is too long')
  .email('Invalid email address')
  .transform((v) => v.toLowerCase());

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72)
  .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), 'Include at least one letter and one number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email: emailField,
  password: passwordField,
  department: z.string().trim().min(1, 'Department is required').max(100),
  year: z.string().trim().min(1, 'Year / semester is required').max(30),
  phone: z.string().trim().max(20).optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    department: z.string().trim().max(100).optional(),
    year: z.string().trim().max(30).optional(),
    phone: z.string().trim().max(20).nullable().optional(),
    bio: z.string().trim().max(1000).nullable().optional(),
    skills: z.array(z.string().trim().max(50)).max(30).optional(),
    interests: z.array(z.string().trim().max(50)).max(30).optional(),
    githubUrl: z.union([z.string().trim().url('Must be a valid URL'), z.literal('')]).nullable().optional(),
    linkedinUrl: z.union([z.string().trim().url('Must be a valid URL'), z.literal('')]).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

// POST /auth/password — change your own password (verify current first).
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordField,
});
