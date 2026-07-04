import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { validateResult } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get(
  '/',
  [
    query('q').optional().isString().trim().isLength({ max: 100 }),
    query('category').optional().isString().trim().isLength({ max: 80 }),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('sort').optional().isIn(['lowest_price', 'highest_price', 'new_arrivals', 'newest', 'price_asc', 'price_desc']),
    query('featured').optional().isIn(['true', 'false']),
    query('badge').optional().isString().trim().isLength({ max: 50 }),
    validateResult,
  ],
  listProducts
);

router.get('/:id', getProduct);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').isString().trim().isLength({ min: 2, max: 120 }),
    body('description').isString().trim().isLength({ min: 10, max: 2000 }),
    body('category').isString().trim().isLength({ min: 2, max: 80 }),
    body('price').isNumeric().custom((value) => value >= 0),
    body('stock').isInt({ min: 0 }),
    body('imageUrl').optional().isString().trim().isLength({ max: 1000 }),
    validateResult,
  ],
  createProduct
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
    body('description').optional().isString().trim().isLength({ min: 10, max: 2000 }),
    body('category').optional().isString().trim().isLength({ min: 2, max: 80 }),
    body('price').optional().isNumeric().custom((value) => value >= 0),
    body('stock').optional().isInt({ min: 0 }),
    body('imageUrl').optional().isString().trim().isLength({ max: 1000 }),
    validateResult,
  ],
  updateProduct
);

router.delete('/:id', requireAuth, requireAdmin, [param('id').isMongoId(), validateResult], deleteProduct);

export default router;

