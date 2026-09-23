import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email: z.string().trim().email('Invalid email').max(150),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

export const eventRegisterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email('Invalid email').max(150),
  phone: z.string().trim().max(20).optional(),
});
