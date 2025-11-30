import { z } from 'zod';
import { TeamRoleEnum } from '../../core/entities/team-member.entity';

export const IdParamsSchema = z.object({
  id: z.string({ required_error: 'Id is missing' }).min(1, {
    message: 'Id is missing'
  })
});

export const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional()
});

export const TeamIdSchema = z.object({
  teamId: z.string({ required_error: 'Team Id is missing' }).min(1, {
    message: 'Team Id is missing'
  })
});

export const inviteTeamMemberSchema = z.object({
  teamId: z.string({ required_error: 'Team id is missing' }).min(1, {
    message: 'Team Id is missing'
  }),
  inviteeEmail: z.string({ required_error: 'Email is required' }).email({
    message: 'Invalid email address'
  }),
  role: z.enum(['admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role must be either admin, member or viewer' })
  })
});

export const acceptInvitationSchema = z.object({
  token: z
    .string({ required_error: 'Token is required' })
    .min(1, { message: 'Token is required' })
});

export const changeRoleSchema = z.object({
  id: z.string({ required_error: 'Id is required' }).min(1, {
    message: 'Id is required'
  }),
  role: z.nativeEnum(TeamRoleEnum, { message: 'Invalid role' })
});
