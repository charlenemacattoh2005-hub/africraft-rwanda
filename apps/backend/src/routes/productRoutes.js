import { Router } from 'express';
import { query } from 'express-validator';
import { listProducts, getProduct } from '../controllers/productController.js';
import { validateResult } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  [
    query('q').optional().isString().trim().isLength({ max: 100 }),
    query('category').optional().isString().trim().isLength({ max: 80 }),
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('sort').optional().isIn(['price_asc', 'price_desc', 'newest']),
    validateResult,
  ],
  listProducts
);

router.get('/:id', getProduct);

export default router;

