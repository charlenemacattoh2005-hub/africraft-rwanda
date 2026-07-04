import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/adminController.js';

const router = Router();

router.get('/stats', requireAuth, requireAdmin, getAdminStats);

export default router;
