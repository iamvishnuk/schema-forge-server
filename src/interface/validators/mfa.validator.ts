import { z } from 'zod';

export const verifyMFASchema = z.object({
  code: z
    .string({ required_error: 'Code is required' })
    .trim()
    .min(1, { message: 'Code is required' }),
  secretKey: z
    .string({ required_error: 'Secret ky is required' })
    .trim()
    .min(1, { message: 'Secret key is required' })
});

export const verifyMfaLoginSchema = z.object({
  code: z
    .string({ required_error: 'Code is required' })
    .trim()
    .min(1, { message: 'Code is required' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email' })
});
