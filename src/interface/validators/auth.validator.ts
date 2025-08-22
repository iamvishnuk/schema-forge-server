import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, { message: 'Name must have atleast 1 character' })
        .max(30, { message: 'Name must have atmost 30 characters' })
    ),
  email: z
    .string({ required_error: 'Email is required' })
    .transform((val) => val.trim())
    .transform((val) => val.toLocaleLowerCase())
    .pipe(z.string().email({ message: 'Invalid email' })),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must have at least 8 characters' })
    .max(255, { message: 'Password must have at most 255 characters' })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((password) => /[0-9]/.test(password), {
      message: 'Password must contain at least one number'
    })
    .refine((password) => /[^A-Za-z0-9]/.test(password), {
      message: 'Password must contain at least one special character'
    })
});

export const loginUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .transform((val) => val.trim())
    .transform((val) => val.toLocaleLowerCase())
    .pipe(z.string().email({ message: 'Invalid email' })),
  password: z
    .string({ required_error: 'Password is required' })
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(8, { message: 'Password must have at least 8 characters' })
        .max(255, { message: 'Password must have at most 255 characters' })
        .refine((password: string) => /[A-Z]/.test(password), {
          message: 'Password must contain at least one uppercase letter'
        })
        .refine((password: string) => /[a-z]/.test(password), {
          message: 'Password must contain at least one lowercase letter'
        })
        .refine((password: string) => /[0-9]/.test(password), {
          message: 'Password must contain at least one number'
        })
        .refine((password: string) => /[^A-Za-z0-9]/.test(password), {
          message: 'Password must contain at least one special character'
        })
    )
});

export const verificationEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'Code must have atleast 1 character' })
    .max(255, { message: 'Code must have atmost 255 characters' })
});

export const emailSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .transform((val) => val.trim())
    .transform((val) => val.toLocaleLowerCase())
    .pipe(z.string().email({ message: 'Invalid email' }))
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'password must have atleast 6 character' })
    .max(255, { message: 'password must have atmost 255 characters' }),
  code: z
    .string()
    .trim()
    .min(1, { message: 'Code must have atleast 1 character' })
    .max(255, { message: 'Code must have atmost 255 characters' })
});
