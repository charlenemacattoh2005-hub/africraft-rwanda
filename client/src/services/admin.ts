import { apiGetAuth, apiDelete } from './api';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('africraft_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
const patch = (path: string, body: any) =>
  fetch(`${BASE}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() } as Record<string, string>, body: JSON.stringify(body) }).then(r => r.json());
const post = (path: string, body: any) =>
  fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } as Record<string, string>, body: JSON.stringify(body) }).then(r => r.json());
const put = (path: string, body: any) =>
  fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() } as Record<string, string>, body: JSON.stringify(body) }).then(r => r.json());
const del = (path: string) =>
  fetch(`${BASE}${path}`, { method: 'DELETE', headers: authHeaders() as Record<string, string> }).then(r => r.json());

// Stats & analytics
export const fetchAdminStats    = ()                                    => apiGetAuth('/api/admin/stats');
export const fetchSiteStats     = ()                                    => apiGetAuth('/api/admin/site-stats');

// Orders
export const fetchAdminOrders   = (params?: string)                     => apiGetAuth(`/api/admin/orders${params ? '?' + params : ''}`);
export const fetchAdminOrderById= (id: string)                          => apiGetAuth(`/api/admin/orders/${id}`);
export const updateOrderStatus  = (id: string, status: string, note?: string) => patch(`/api/admin/orders/${id}/status`, { status, note });
export const addOrderNote       = (id: string, note: string)            => patch(`/api/admin/orders/${id}/note`, { note });
export const assignRider        = (id: string, riderId: string)         => patch(`/api/admin/orders/${id}/rider`, { riderId });

// Customers
export const fetchAdminCustomers= (params?: string)                     => apiGetAuth(`/api/admin/customers${params ? '?' + params : ''}`);

// User management
export const fetchAllUsers      = (params?: string)                     => apiGetAuth(`/api/admin/users${params ? '?' + params : ''}`);
export const createUser         = (data: any)                           => post('/api/admin/users', data);
export const updateUser         = (id: string, data: any)               => put(`/api/admin/users/${id}`, data);
export const deleteUser         = (id: string)                          => del(`/api/admin/users/${id}`);
export const assignRole         = (id: string, role: string)            => patch(`/api/admin/users/${id}/role`, { role });
export const suspendUser        = (id: string, suspend: boolean)        => patch(`/api/admin/users/${id}/suspend`, { suspend });

// Products (admin)
export const fetchAdminProducts = (params?: string)                     => apiGetAuth(`/api/admin/products${params ? '?' + params : ''}`);
export const updateProduct      = (id: string, data: any)               => patch(`/api/admin/products/${id}`, data);
export const createProduct      = (data: any)                           => post('/api/admin/products', data);
export const bulkProductAction  = (ids: string[], action: string)       => post('/api/admin/products/bulk', { ids, action });
export const deleteProduct      = (id: string)                          => apiDelete(`/api/admin/products/${id}`, true);

// Inventory
export const fetchInventory     = (filter?: string)                     => apiGetAuth(`/api/admin/inventory${filter ? '?filter=' + filter : ''}`);
export const adjustStock        = (id: string, adjustment: number, reason?: string) => patch(`/api/admin/inventory/${id}/adjust`, { adjustment, reason });

// Discounts / Coupons
export const fetchDiscounts     = ()                                    => apiGetAuth('/api/admin/discounts');
export const createDiscount     = (data: any)                           => post('/api/admin/discounts', data);
export const updateDiscount     = (id: string, data: any)               => patch(`/api/admin/discounts/${id}`, data);
export const deleteDiscount     = (id: string)                          => del(`/api/admin/discounts/${id}`);

// Notifications & activity
export const fetchNotifications = ()                                    => apiGetAuth('/api/admin/notifications');
export const fetchActivityLog   = ()                                    => apiGetAuth('/api/admin/activity');

// Categories (admin)
export const fetchAdminCategories   = ()                                => apiGetAuth('/api/admin/categories');
export const createAdminCategory    = (data: any)                       => post('/api/admin/categories', data);
export const updateAdminCategory    = (id: string, data: any)           => patch(`/api/admin/categories/${id}`, data);
export const deleteAdminCategory    = (id: string)                      => del(`/api/admin/categories/${id}`);

// Reviews (admin)
export const fetchAdminReviews      = (params?: string)                 => apiGetAuth(`/api/admin/reviews${params ? '?' + params : ''}`);
export const deleteAdminReview      = (id: string)                      => del(`/api/admin/reviews/${id}`);

// Vendor
export const fetchVendorStats       = ()                                => apiGetAuth('/api/admin/vendor/stats');
export const fetchVendorProducts    = ()                                => apiGetAuth('/api/admin/vendor/products');
export const createVendorProduct    = (data: any)                       => post('/api/admin/vendor/products', data);
export const updateVendorProduct    = (id: string, data: any)           => patch(`/api/admin/vendor/products/${id}`, data);
export const deleteVendorProduct    = (id: string)                      => del(`/api/admin/vendor/products/${id}`);
export const fetchVendorOrders      = ()                                => apiGetAuth('/api/admin/vendor/orders');

// Rider
export const fetchRiderStats        = ()                                => apiGetAuth('/api/admin/rider/stats');
export const fetchRiderDeliveries   = (status?: string)                 => apiGetAuth(`/api/admin/rider/deliveries${status ? '?status=' + status : ''}`);
export const updateDeliveryStatus   = (id: string, status: string)      => patch(`/api/admin/rider/deliveries/${id}/status`, { status });
export const fetchRiderEarnings     = ()                                => apiGetAuth('/api/admin/rider/earnings');

// Vendor payout
export const fetchVendorPayout      = ()                                => apiGetAuth('/api/admin/vendor/payout');

// Site content (homepage CMS)
export const fetchSiteContent       = ()                                => fetch(`${BASE}/api/site-content`).then(r => r.json());
export const updateSiteContent      = (data: any)                       => patch('/api/admin/site-content', data);
export const addHeroBanner          = (data: any)                       => post('/api/admin/site-content/banners', data);
export const removeHeroBanner       = (bannerId: string)                => del(`/api/admin/site-content/banners/${bannerId}`);
