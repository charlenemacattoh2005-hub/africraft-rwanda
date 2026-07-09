import { Router } from 'express';
import { requireAuth, requireAdmin, requireVendor } from '../middleware/auth.js';

// stats still in the original adminController (getAdminStats only)
import { getAdminStats } from '../controllers/adminController.js';

// new split controllers
import {
  getSiteStats, getNotifications, getActivityLog,
  getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
  getAdminReviews, deleteAdminReview,
  getDiscounts, createDiscount, updateDiscount, deleteDiscount,
} from '../controllers/analyticsController.js';

import {
  getAdminOrders, getAdminOrderById, updateOrderStatus, addOrderNote, assignRider,
} from '../controllers/orderAdminController.js';

import {
  getAdminCustomers,
  getAllUsers, createUser, updateUser, deleteUser, suspendUser, assignRole,
} from '../controllers/userAdminController.js';

import {
  getAdminProducts, createProduct, updateProduct, deleteProduct, bulkProductAction,
  getInventory, adjustStock,
  getVendorStats, getVendorProducts, createVendorProduct, updateVendorProduct,
  deleteVendorProduct, getVendorOrders,
} from '../controllers/productAdminController.js';

import {
  getRiderStats, getRiderDeliveries, updateDeliveryStatus,
} from '../controllers/riderController.js';

import {
  getPublicSiteContent, updateSiteContent,
  addHeroBanner, removeHeroBanner,
  getVendorPayout, getRiderEarningsSummary,
} from '../controllers/siteController.js';

const router = Router();
const A = [requireAuth, requireAdmin];
const V = [requireAuth, requireVendor];
const R = [requireAuth];

/* ── Stats & analytics ─────────────────────────────────────── */
router.get('/stats',      ...A, getAdminStats);
router.get('/site-stats', ...A, getSiteStats);

/* ── Orders ─────────────────────────────────────────────────── */
router.get   ('/orders',                   ...A, getAdminOrders);
router.get   ('/orders/:id',               ...A, getAdminOrderById);
router.patch ('/orders/:id/status',        ...A, updateOrderStatus);
router.patch ('/orders/:id/note',          ...A, addOrderNote);
router.patch ('/orders/:id/rider',         ...A, assignRider);

/* ── Customers ──────────────────────────────────────────────── */
router.get('/customers', ...A, getAdminCustomers);

/* ── Users ──────────────────────────────────────────────────── */
router.get   ('/users',              ...A, getAllUsers);
router.post  ('/users',              ...A, createUser);
router.put   ('/users/:id',          ...A, updateUser);
router.delete('/users/:id',          ...A, deleteUser);
router.patch ('/users/:id/role',     ...A, assignRole);
router.patch ('/users/:id/suspend',  ...A, suspendUser);

/* ── Products ───────────────────────────────────────────────── */
router.get   ('/products',           ...A, getAdminProducts);
router.post  ('/products',           ...A, createProduct);
router.post  ('/products/bulk',      ...A, bulkProductAction);
router.patch ('/products/:id',       ...A, updateProduct);
router.delete('/products/:id',       ...A, deleteProduct);

/* ── Inventory ──────────────────────────────────────────────── */
router.get  ('/inventory',               ...A, getInventory);
router.patch('/inventory/:id/adjust',    ...A, adjustStock);

/* ── Discounts ──────────────────────────────────────────────── */
router.get   ('/discounts',          ...A, getDiscounts);
router.post  ('/discounts',          ...A, createDiscount);
router.patch ('/discounts/:id',      ...A, updateDiscount);
router.delete('/discounts/:id',      ...A, deleteDiscount);

/* ── Notifications & activity ───────────────────────────────── */
router.get('/notifications', ...A, getNotifications);
router.get('/activity',      ...A, getActivityLog);

/* ── Categories ─────────────────────────────────────────────── */
router.get   ('/categories',         ...A, getAdminCategories);
router.post  ('/categories',         ...A, createAdminCategory);
router.patch ('/categories/:id',     ...A, updateAdminCategory);
router.delete('/categories/:id',     ...A, deleteAdminCategory);

/* ── Reviews ────────────────────────────────────────────────── */
router.get   ('/reviews',            ...A, getAdminReviews);
router.delete('/reviews/:id',        ...A, deleteAdminReview);

/* ── Vendor ─────────────────────────────────────────────────── */
router.get   ('/vendor/stats',             ...V, getVendorStats);
router.get   ('/vendor/products',          ...V, getVendorProducts);
router.post  ('/vendor/products',          ...V, createVendorProduct);
router.patch ('/vendor/products/:id',      ...V, updateVendorProduct);
router.delete('/vendor/products/:id',      ...V, deleteVendorProduct);
router.get   ('/vendor/orders',            ...V, getVendorOrders);

/* ── Rider ──────────────────────────────────────────────────── */
router.get  ('/rider/stats',                   ...R, getRiderStats);
router.get  ('/rider/deliveries',              ...R, getRiderDeliveries);
router.patch('/rider/deliveries/:id/status',   ...R, updateDeliveryStatus);
router.get  ('/rider/earnings',                ...R, getRiderEarningsSummary);

/* ── Site content (admin manage, public read) ───────────────── */
router.get  ('/site-content',                  getPublicSiteContent);
router.patch('/site-content',                  ...A, updateSiteContent);
router.post ('/site-content/banners',          ...A, addHeroBanner);
router.delete('/site-content/banners/:bannerId',...A, removeHeroBanner);

/* ── Vendor payout ──────────────────────────────────────────── */
router.get('/vendor/payout',                   ...V, getVendorPayout);

export default router;
