import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateResult } from '../middleware/validate.js';
import {
  checkout,
  myOrders,
  getOrderById,
  listAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

router.post(
  '/checkout',
  requireAuth,
  [
    body('customer.fullName').isString().trim().isLength({ min: 2, max: 120 }),
    body('customer.phone').isString().trim().isLength({ min: 5, max: 30 }),
    body('customer.email').isEmail().normalizeEmail(),
    body('customer.address').isString().trim().isLength({ min: 2, max: 500 }),
    body('customer.district').optional().isString().trim().isLength({ max: 120 }),
    body('customer.sector').optional().isString().trim().isLength({ max: 120 }),
    body('customer.city').optional().isString().trim().isLength({ max: 120 }),
    body('customer.deliveryNotes').optional().isString().trim().isLength({ max: 500 }),
    body('paymentMethod').optional().isString().trim(),

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
router.get('/', requireAuth, requireAdmin, listAllOrders);
router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  [param('id').isMongoId(), body('status').isString().isIn(['pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled']), validateResult],
  updateOrderStatus
);

export default router;

