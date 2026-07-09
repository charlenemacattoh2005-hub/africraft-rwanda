import { apiGetAuth, apiPost, apiDelete } from './api';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('africraft_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const patch = (path: string, body: any) =>
  fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  }).then(r => r.json());

const post = (path: string, body: any) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  }).then(r => r.json());

export const fetchAdminStats     = ()                           => apiGetAuth('/api/admin/stats');
export const fetchSiteStats      = ()                           => apiGetAuth('/api/admin/site-stats');
export const fetchAdminOrders    = ()                           => apiGetAuth('/api/admin/orders');
export const fetchAdminCustomers = ()                           => apiGetAuth('/api/admin/customers');
export const fetchAdminProducts  = ()                           => apiGetAuth('/api/admin/products');
export const updateOrderStatus   = (id: string, status: string) => patch(`/api/admin/orders/${id}/status`, { status });
export const updateProduct       = (id: string, data: any)      => patch(`/api/admin/products/${id}`, data);
export const createProduct       = (data: any)                  => post('/api/admin/products', data);
export const deleteProduct       = (id: string)                 => apiDelete(`/api/admin/products/${id}`, true);
