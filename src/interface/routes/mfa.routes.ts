import { Router } from 'express';
import { MfaController } from '../controllers/mfa.controller';
import { authenticateJWT } from '../middlewares/passport.middleware';
import { validateRequest } from '../middlewares/requestValidator.middleware';
import {
  verifyMfaLoginSchema,
  verifyMFASchema
} from '../validators/mfa.validator';

const mfaRoutes = Router();
const mfaController = new MfaController();

mfaRoutes.get('/setup', authenticateJWT, mfaController.generateMFASetup);

mfaRoutes.post(
  '/verify',
  authenticateJWT,
  validateRequest(verifyMFASchema),
  mfaController.verifyMFASetup
);
mfaRoutes.post(
  '/verify-login',
  validateRequest(verifyMfaLoginSchema),
  mfaController.verifyMfaLogin
);

mfaRoutes.put('/revoke', authenticateJWT, mfaController.revokeMFA);

export default mfaRoutes;
