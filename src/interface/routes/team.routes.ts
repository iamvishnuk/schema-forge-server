import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticateJWT } from '../middlewares/passport.middleware';
import {
  validateParams,
  validateRequest
} from '../middlewares/requestValidator.middleware';
import { createTeamSchema, TeamIdSchema } from '../validators/team.validator';

const teamRoutes = Router();
const teamController = new TeamController();

teamRoutes.get('/user-teams', authenticateJWT, teamController.getUserTeams);

teamRoutes.post(
  '/create',
  authenticateJWT,
  validateRequest(createTeamSchema),
  teamController.createTeam
);

teamRoutes.put(
  '/update/:teamId',
  authenticateJWT,
  validateRequest(createTeamSchema),
  validateParams(TeamIdSchema),
  teamController.updateTeam
);

teamRoutes.delete(
  '/delete/:teamId',
  authenticateJWT,
  validateParams(TeamIdSchema),
  teamController.deleteTeam
);

export default teamRoutes;
