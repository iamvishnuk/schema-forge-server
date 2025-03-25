import { Router } from 'express';
import authRoutes from './auth.routes';
import { authenticateJWT } from '../middlewares/passport.middleware';
import sessionRoutes from './session.routes';
import mfaRoutes from './mfa.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/session', authenticateJWT, sessionRoutes);
router.use('/mfa', mfaRoutes);

export default router;
