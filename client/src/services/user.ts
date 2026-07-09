import { apiGetAuth, apiPut, apiPost } from './api';

export const fetchProfile   = ()         => apiGetAuth('/api/users/me');
export const updateProfile  = (data: any) => apiPut('/api/users/me', data, true);
export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  apiPost('/api/users/me/change-password', data, true);
