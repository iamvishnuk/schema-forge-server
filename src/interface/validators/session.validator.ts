import { z } from 'zod';

export const deleteSessionSchema = z.object({
  id: z
    .string({ required_error: 'Session id is required' })
    .trim()
    .min(1, { message: 'Session id must have atleast 1 character' })
    .max(255, { message: 'Session id must have atmost 255 characters' })
});
