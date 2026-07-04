import { apiGetAuth, apiPost } from './api';

export async function checkout(payload: any) {
  // protected endpoint
  return apiPost('/api/orders/checkout', payload, true);
}

export async function fetchMyOrders() {
  return apiGetAuth('/api/orders/me');
}

export async function fetchOrderById(id: string) {
  return apiGetAuth(`/api/orders/${id}`);
}

