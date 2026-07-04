import { Router } from 'express';
import { body } from 'express-validator';
import { validateResult } from '../middleware/validate.js';
import { register, login } from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('fullName').isString().trim().isLength({ min: 2, max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6, max: 200 }),
    validateResult,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1, max: 200 }),
    validateResult,
  ],
  login
);

export default router;

