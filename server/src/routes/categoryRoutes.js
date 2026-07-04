import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', listCategories);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [body('name').isString().trim().isLength({ min: 2, max: 80 }), validateResult],
  createCategory
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  [param('id').isMongoId(), body('name').optional().isString().trim().isLength({ min: 2, max: 80 }), validateResult],
  updateCategory
);

router.delete('/:id', requireAuth, requireAdmin, [param('id').isMongoId(), validateResult], deleteCategory);

export default router;
