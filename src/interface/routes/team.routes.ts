import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import {
  validateParams,
  validateRequest
} from '../middlewares/requestValidator.middleware';
import {
  acceptInvitationSchema,
  createTeamSchema,
  IdParamsSchema,
  inviteTeamMemberSchema,
  TeamIdSchema
} from '../validators/team.validator';

const teamRoutes = Router();
const teamController = new TeamController();

teamRoutes.get('/user-teams', teamController.getUserTeams);
teamRoutes.get('/user-created-teams', teamController.getUserCreatedTeams);
teamRoutes.get(
  '/:teamId',
  validateParams(TeamIdSchema),
  teamController.getTeamById
);

teamRoutes.post(
  '/create',
  validateRequest(createTeamSchema),
  teamController.createTeam
);
teamRoutes.post(
  '/invite',
  validateRequest(inviteTeamMemberSchema),
  teamController.inviteTeamMember
);
teamRoutes.post(
  '/accept-invite',
  validateRequest(acceptInvitationSchema),
  teamController.acceptInvitation
);

teamRoutes.put(
  '/update/:teamId',
  validateRequest(createTeamSchema),
  validateParams(TeamIdSchema),
  teamController.updateTeam
);
teamRoutes.put('/member/change-role', teamController.changeTeamMemberRole);

teamRoutes.delete(
  '/delete/:teamId',
  validateParams(TeamIdSchema),
  teamController.deleteTeam
);
teamRoutes.delete(
  '/member/remove/:id',
  validateParams(IdParamsSchema),
  teamController.removeOrLeaveTeam
);

export default teamRoutes;
