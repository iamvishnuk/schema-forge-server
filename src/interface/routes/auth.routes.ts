import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/requestValidator.middleware';
import { registerUserSchema } from '../validators/auth.validator';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
  '/register',
  validateRequest(registerUserSchema),
  authController.register
);

export default authRoutes;
