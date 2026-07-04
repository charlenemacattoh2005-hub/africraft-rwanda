import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.put(
  '/me',
  requireAuth,
  [
    body('fullName').optional().isString().trim().isLength({ min: 2, max: 120 }),
    body('phone').optional().isString().trim().isLength({ min: 7, max: 30 }),
    body('address').optional().isString().trim().isLength({ min: 5, max: 500 }),
    validateResult,
  ],
  updateProfile
);

export default router;
