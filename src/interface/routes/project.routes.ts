import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import {
  validateParams,
  validateRequest
} from '../middlewares/requestValidator.middleware';
import {
  addTeamToProjectSchema,
  CreateProjectSchema,
  removeTeamFromProjectSchema
} from '../validators/project.validator';
import { IdParamsSchema } from '../validators/team.validator';

const projectRoutes = Router();
const projectController = new ProjectController();

projectRoutes.get('/', projectController.getProjects);
projectRoutes.get(
  '/:id',
  validateParams(IdParamsSchema),
  projectController.getProjectDetails
);
projectRoutes.get(
  '/design/:id',
  validateParams(IdParamsSchema),
  projectController.getProjectDesign
);
projectRoutes.get(
  '/teams-and-members/:id',
  validateParams(IdParamsSchema),
  projectController.getProjectAssociatedTeamsAndMembers
);

projectRoutes.post(
  '/create',
  validateRequest(CreateProjectSchema),
  projectController.createProject
);

projectRoutes.put(
  '/update/:id',
  validateRequest(CreateProjectSchema),
  projectController.updateProject
);
projectRoutes.put(
  '/add-team',
  validateRequest(addTeamToProjectSchema),
  projectController.addTeamToProject
);
projectRoutes.put(
  '/remove-team',
  validateRequest(removeTeamFromProjectSchema),
  projectController.removeTeamFromProject
);

projectRoutes.delete(
  '/delete/:id',
  validateParams(IdParamsSchema),
  projectController.deleteProject
);

export default projectRoutes;
