import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, { message: 'Name must have atleast 1 character' })
    .max(255, { message: 'Name must have atmost 255 characters' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'password must have atleast 6 character' })
    .max(255, { message: 'password must have atmost 255 characters' })
});
