import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { validateParams } from '../middlewares/requestValidator.middleware';
import { deleteSessionSchema } from '../validators/session.validator';

const sessionRoutes = Router();
const sessionController = new SessionController();

sessionRoutes.get('/all', sessionController.getAllSession);
sessionRoutes.get('/current', sessionController.getCurrentSession);

sessionRoutes.delete(
  '/:id',
  validateParams(deleteSessionSchema),
  sessionController.deleteSession
);

export default sessionRoutes;
