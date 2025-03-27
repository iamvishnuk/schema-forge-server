import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional()
});

export const TeamIdSchema = z.object({
  teamId: z.string({ required_error: 'Team Id is missing' }).min(1, {
    message: 'Team Id is missing'
  })
});
