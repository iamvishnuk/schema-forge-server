import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticateJWT } from '../middlewares/passport.middleware';
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

teamRoutes.get('/user-teams', authenticateJWT, teamController.getUserTeams);
teamRoutes.get(
  '/user-created-teams',
  authenticateJWT,
  teamController.getUserCreatedTeams
);
teamRoutes.get(
  '/:teamId',
  authenticateJWT,
  validateParams(TeamIdSchema),
  teamController.getTeamById
);

teamRoutes.post(
  '/create',
  authenticateJWT,
  validateRequest(createTeamSchema),
  teamController.createTeam
);
teamRoutes.post(
  '/invite',
  authenticateJWT,
  validateRequest(inviteTeamMemberSchema),
  teamController.inviteTeamMember
);
teamRoutes.post(
  '/accept-invite',
  authenticateJWT,
  validateRequest(acceptInvitationSchema),
  teamController.acceptInvitation
);

teamRoutes.put(
  '/update/:teamId',
  authenticateJWT,
  validateRequest(createTeamSchema),
  validateParams(TeamIdSchema),
  teamController.updateTeam
);
teamRoutes.put(
  '/member/change-role',
  authenticateJWT,
  teamController.changeTeamMemberRole
);

teamRoutes.delete(
  '/delete/:teamId',
  authenticateJWT,
  validateParams(TeamIdSchema),
  teamController.deleteTeam
);
teamRoutes.delete(
  '/member/remove/:id',
  authenticateJWT,
  validateParams(IdParamsSchema),
  teamController.removeOrLeaveTeam
);

export default teamRoutes;
