import { Router } from 'express';
import authRoutes from './auth.routes';
import { authenticateJWT } from '../middlewares/passport.middleware';
import sessionRoutes from './session.routes';
import mfaRoutes from './mfa.routes';
import teamRoutes from './team.routes';
import projectRoutes from './project.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/session', authenticateJWT, sessionRoutes);
router.use('/mfa', mfaRoutes);
router.use('/team', authenticateJWT, teamRoutes);
router.use('/project', authenticateJWT, projectRoutes);

export default router;
