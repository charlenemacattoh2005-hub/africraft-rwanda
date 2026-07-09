import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  createProduct,
  getSiteStats,
} from '../controllers/adminController.js';

const router = Router();

router.get('/stats',               requireAuth, requireAdmin, getAdminStats);
router.get('/site-stats',          requireAuth, requireAdmin, getSiteStats);
router.get('/orders',              requireAuth, requireAdmin, getAdminOrders);
router.patch('/orders/:id/status', requireAuth, requireAdmin, updateOrderStatus);
router.get('/customers',           requireAuth, requireAdmin, getAdminCustomers);
router.get('/products',            requireAuth, requireAdmin, getAdminProducts);
router.post('/products',           requireAuth, requireAdmin, createProduct);
router.patch('/products/:id',      requireAuth, requireAdmin, updateProduct);
router.delete('/products/:id',     requireAuth, requireAdmin, deleteProduct);

export default router;
