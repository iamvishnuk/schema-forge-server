import { Router } from 'express';
import authRoutes from './auth.routes';
import { authenticateJWT } from '../middlewares/passport.middleware';
import sessionRoutes from './session.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/session', authenticateJWT, sessionRoutes);

export default router;
