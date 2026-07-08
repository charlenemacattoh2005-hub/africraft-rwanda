import { apiGetAuth, apiPost, apiDelete } from './api';

const patch = (path: string, body: any) =>
  apiPost(path, body, true).catch(() => {
    // fallback using fetch directly for PATCH
    const token = localStorage.getItem('africraft_auth_token');
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }).then(r => r.json());
  });

export const fetchAdminStats     = ()           => apiGetAuth('/api/admin/stats');
export const fetchAdminOrders    = ()           => apiGetAuth('/api/admin/orders');
export const fetchAdminCustomers = ()           => apiGetAuth('/api/admin/customers');
export const fetchAdminProducts  = ()           => apiGetAuth('/api/admin/products');
export const updateOrderStatus   = (id: string, status: string) => patch(`/api/admin/orders/${id}/status`, { status });
export const updateProduct       = (id: string, data: any)      => patch(`/api/admin/products/${id}`, data);
export const deleteProduct       = (id: string)                  => apiDelete(`/api/admin/products/${id}`, true);
