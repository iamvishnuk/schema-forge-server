import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import {
  validateParams,
  validateRequest
} from '../middlewares/requestValidator.middleware';
import {
  AcceptProjectInviteSchema,
  ChangeProjectMemberRoleSchema,
  CreateProjectSchema,
  ProjectInviteSchema
} from '../validators/project.validator';
import { IdParamsSchema } from '../validators/team.validator';

const projectRoutes = Router();
const projectController = new ProjectController();

projectRoutes.get('/', projectController.getProjects);
projectRoutes.get('/templates', projectController.getAvailableTemplates);
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
  '/members/:id',
  validateParams(IdParamsSchema),
  projectController.getProjectMembers
);

projectRoutes.post(
  '/create',
  validateRequest(CreateProjectSchema),
  projectController.createProject
);
projectRoutes.post(
  '/accept-invite',
  validateRequest(AcceptProjectInviteSchema),
  projectController.acceptProjectInvite
);
projectRoutes.post(
  '/invite',
  validateRequest(ProjectInviteSchema),
  projectController.sendProjectInvitation
);

projectRoutes.put(
  '/update/:id',
  validateRequest(CreateProjectSchema),
  projectController.updateProject
);

projectRoutes.put(
  '/member/change-role',
  validateRequest(ChangeProjectMemberRoleSchema),
  projectController.changeProjectMemberRole
);

projectRoutes.delete(
  '/delete/:id',
  validateParams(IdParamsSchema),
  projectController.deleteProject
);

projectRoutes.delete(
  '/member/remove/:id',
  validateParams(IdParamsSchema),
  projectController.removeOrLeaveProjectMember
);

export default projectRoutes;
