import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
router.post('/me/change-password', requireAuth, changePassword);

export default router;
