import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import {
  validateParams,
  validateRequest
} from '../middlewares/requestValidator.middleware';
import { CreateProjectSchema } from '../validators/project.validator';
import { IdParamsSchema } from '../validators/team.validator';

const projectRoutes = Router();
const projectController = new ProjectController();

projectRoutes.get('/', projectController.getProjects);
projectRoutes.get(
  '/design/:id',
  validateParams(IdParamsSchema),
  projectController.getProjectDesign
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

projectRoutes.delete(
  '/delete/:id',
  validateParams(IdParamsSchema),
  projectController.deleteProject
);

export default projectRoutes;
