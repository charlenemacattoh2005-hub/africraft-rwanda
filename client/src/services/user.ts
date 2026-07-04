import { apiGetAuth, apiPut } from './api';

export async function fetchProfile() {
  return apiGetAuth('/api/users/me');
}

export async function updateProfile(data: { fullName?: string; phone?: string; address?: string }) {
  return apiPut('/api/users/me', data, true);
}
