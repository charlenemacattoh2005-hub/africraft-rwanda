import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import { checkout, myOrders, getOrderById } from '../controllers/orderController.js';

const router = Router();

router.post(
  '/checkout',
  requireAuth,
  [
    body('customer.fullName').isString().trim().isLength({ min: 2, max: 120 }),
    body('customer.phone').isString().trim().isLength({ min: 5, max: 30 }),
    body('customer.email').isEmail().normalizeEmail(),
    body('customer.address').isString().trim().isLength({ min: 5, max: 500 }),
    body('customer.city').isString().trim().isLength({ min: 2, max: 120 }),

    body('items').isArray({ min: 1, max: 100 }),
    body('items.*.productId').isString(),
    body('items.*.quantity').isNumeric().toInt().isInt({ min: 1, max: 999 }),

    body('deliveryFee').optional().isNumeric(),
    validateResult,
  ],
  checkout
);

router.get('/me', requireAuth, myOrders);
router.get('/:id', requireAuth, getOrderById);

export default router;

