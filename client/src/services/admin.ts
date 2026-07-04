import { apiGetAuth } from './api';

export async function fetchAdminStats() {
  return apiGetAuth('/api/admin/stats');
}
