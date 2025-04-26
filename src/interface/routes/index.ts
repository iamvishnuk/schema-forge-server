import { Router } from 'express';
import authRoutes from './auth.routes';
import { authenticateJWT } from '../middlewares/passport.middleware';
import sessionRoutes from './session.routes';
import mfaRoutes from './mfa.routes';
import teamRoutes from './team.routes';
import projectRoutes from './project.routes';

const router = Router();

// Health check endpoint for Docker health checks
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/session', authenticateJWT, sessionRoutes);
router.use('/mfa', mfaRoutes);
router.use('/team', authenticateJWT, teamRoutes);
router.use('/project', authenticateJWT, projectRoutes);

export default router;
