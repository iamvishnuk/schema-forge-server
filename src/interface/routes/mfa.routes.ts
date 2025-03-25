import { Router } from 'express';
import { MfaController } from '../controllers/mfa.controller';
import { authenticateJWT } from '../middlewares/passport.middleware';

const mfaRoutes = Router();
const mfaController = new MfaController();

mfaRoutes.get('/setup', authenticateJWT, mfaController.generateMFASetup);

export default mfaRoutes;
