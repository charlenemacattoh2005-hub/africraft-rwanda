import { apiPost } from './api';

export async function simulatePayment(payload: any) {
  return apiPost('/api/orders/checkout', payload, true);
}
