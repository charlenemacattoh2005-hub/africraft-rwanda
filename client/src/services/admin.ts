/**
 * admin.ts — Admin/Vendor/Rider API service
 *
 * All calls go through the centralized api.ts client which provides:
 * - Automatic 3-retry with 5s delay
 * - 30s AbortController timeout per attempt
 * - Smart error messages (no "check your internet")
 * - Consistent auth header injection
 *
 * No raw fetch() calls here — everything uses apiGet/apiGetAuth/
 * apiPost/apiPatch/apiPut/apiDelete from api.ts.
 */
import {
  apiGetAuth,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  apiGet,
} from './api';

// ── Stats & analytics ─────────────────────────────────────────
export const fetchAdminStats    = ()                    => apiGetAuth('/api/admin/stats');
export const fetchSiteStats     = ()                    => apiGetAuth('/api/admin/site-stats');

// ── Orders ────────────────────────────────────────────────────
export const fetchAdminOrders    = (p?: string)         => apiGetAuth(`/api/admin/orders${p ? '?' + p : ''}`);
export const fetchAdminOrderById = (id: string)         => apiGetAuth(`/api/admin/orders/${id}`);
export const updateOrderStatus   = (id: string, status: string, note?: string) =>
  apiPatch(`/api/admin/orders/${id}/status`, { status, note });
export const addOrderNote        = (id: string, note: string) =>
  apiPatch(`/api/admin/orders/${id}/note`, { note });
export const assignRider         = (id: string, riderId: string) =>
  apiPatch(`/api/admin/orders/${id}/rider`, { riderId });

// ── Customers ─────────────────────────────────────────────────
export const fetchAdminCustomers = (p?: string)         => apiGetAuth(`/api/admin/customers${p ? '?' + p : ''}`);

// ── User management ───────────────────────────────────────────
export const fetchAllUsers  = (p?: string)              => apiGetAuth(`/api/admin/users${p ? '?' + p : ''}`);
export const createUser     = (data: any)               => apiPost('/api/admin/users', data, true);
export const updateUser     = (id: string, data: any)   => apiPut(`/api/admin/users/${id}`, data, true);
export const deleteUser     = (id: string)              => apiDelete(`/api/admin/users/${id}`, true);
export const assignRole     = (id: string, role: string) =>
  apiPatch(`/api/admin/users/${id}/role`, { role });
export const suspendUser    = (id: string, suspend: boolean) =>
  apiPatch(`/api/admin/users/${id}/suspend`, { suspend });

// ── Products (admin) ──────────────────────────────────────────
export const fetchAdminProducts = (p?: string)          => apiGetAuth(`/api/admin/products${p ? '?' + p : ''}`);
export const createProduct      = (data: any)           => apiPost('/api/admin/products', data, true);
export const updateProduct      = (id: string, data: any) => apiPatch(`/api/admin/products/${id}`, data);
export const deleteProduct      = (id: string)          => apiDelete(`/api/admin/products/${id}`, true);
export const bulkProductAction  = (ids: string[], action: string) =>
  apiPost('/api/admin/products/bulk', { ids, action }, true);

// ── Inventory ─────────────────────────────────────────────────
export const fetchInventory = (filter?: string)         => apiGetAuth(`/api/admin/inventory${filter ? '?filter=' + filter : ''}`);
export const adjustStock    = (id: string, adjustment: number, reason?: string) =>
  apiPatch(`/api/admin/inventory/${id}/adjust`, { adjustment, reason });

// ── Discounts / Coupons ───────────────────────────────────────
export const fetchDiscounts    = ()                     => apiGetAuth('/api/admin/discounts');
export const createDiscount    = (data: any)            => apiPost('/api/admin/discounts', data, true);
export const updateDiscount    = (id: string, data: any) => apiPatch(`/api/admin/discounts/${id}`, data);
export const deleteDiscount    = (id: string)           => apiDelete(`/api/admin/discounts/${id}`, true);

// ── Notifications & activity ──────────────────────────────────
export const fetchNotifications = ()                    => apiGetAuth('/api/admin/notifications');
export const fetchActivityLog   = ()                    => apiGetAuth('/api/admin/activity');

// ── Categories (admin) ────────────────────────────────────────
export const fetchAdminCategories   = ()                => apiGetAuth('/api/admin/categories');
export const createAdminCategory    = (data: any)       => apiPost('/api/admin/categories', data, true);
export const updateAdminCategory    = (id: string, data: any) => apiPatch(`/api/admin/categories/${id}`, data);
export const deleteAdminCategory    = (id: string)      => apiDelete(`/api/admin/categories/${id}`, true);

// ── Reviews (admin) ───────────────────────────────────────────
export const fetchAdminReviews  = (p?: string)          => apiGetAuth(`/api/admin/reviews${p ? '?' + p : ''}`);
export const deleteAdminReview  = (id: string)          => apiDelete(`/api/admin/reviews/${id}`, true);

// ── Vendor list (for dropdowns) ───────────────────────────────
export const fetchVendorList    = ()                    => apiGetAuth('/api/admin/vendors/list');

// ── Vendor dashboard ──────────────────────────────────────────
export const fetchVendorStats        = ()               => apiGetAuth('/api/admin/vendor/stats');
export const fetchVendorProducts     = ()               => apiGetAuth('/api/admin/vendor/products');
export const createVendorProduct     = (data: any)      => apiPost('/api/admin/vendor/products', data, true);
export const updateVendorProduct     = (id: string, data: any) => apiPatch(`/api/admin/vendor/products/${id}`, data);
export const deleteVendorProduct     = (id: string)     => apiDelete(`/api/admin/vendor/products/${id}`, true);
export const fetchVendorOrders       = ()               => apiGetAuth('/api/admin/vendor/orders');
export const fetchVendorPayout       = ()               => apiGetAuth('/api/admin/vendor/payout');

// ── Rider dashboard ───────────────────────────────────────────
export const fetchRiderStats       = ()                 => apiGetAuth('/api/admin/rider/stats');
export const fetchRiderDeliveries  = (status?: string)  => apiGetAuth(`/api/admin/rider/deliveries${status ? '?status=' + status : ''}`);
export const updateDeliveryStatus  = (id: string, status: string) =>
  apiPatch(`/api/admin/rider/deliveries/${id}/status`, { status });
export const fetchRiderEarnings    = ()                 => apiGetAuth('/api/admin/rider/earnings');

// ── Site content (homepage CMS) ───────────────────────────────
export const fetchSiteContent   = ()                    => apiGet('/api/site-content');
export const updateSiteContent  = (data: any)           => apiPatch('/api/admin/site-content', data);
export const addHeroBanner      = (data: any)           => apiPost('/api/admin/site-content/banners', data, true);
export const removeHeroBanner   = (bannerId: string)    => apiDelete(`/api/admin/site-content/banners/${bannerId}`, true);
