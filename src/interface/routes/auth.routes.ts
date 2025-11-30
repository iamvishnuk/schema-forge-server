import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/requestValidator.middleware';
import {
  emailSchema,
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
  verificationEmailSchema
} from '../validators/auth.validator';
import { authenticateJWT } from '../middlewares/passport.middleware';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
  '/register',
  validateRequest(registerUserSchema),
  authController.register
);
authRoutes.post(
  '/login',
  validateRequest(loginUserSchema),
  authController.login
);
authRoutes.post(
  '/verify/email',
  validateRequest(verificationEmailSchema),
  authController.verifyEmail
);
authRoutes.post(
  '/password/forgot',
  validateRequest(emailSchema),
  authController.forgotPassword
);
authRoutes.post(
  '/password/reset',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);
authRoutes.post('/logout', authenticateJWT, authController.logout);

authRoutes.get('/refresh', authController.refreshToken);

export default authRoutes;
