import { apiPost, setAuthToken } from './api';

export async function login(email: string, password: string) {
  const data = await apiPost('/api/auth/login', { email, password });
  setAuthToken(data.token);
  return data;
}

export async function register(fullName: string, email: string, password: string) {
  const data = await apiPost('/api/auth/register', { fullName, email, password });
  setAuthToken(data.token);
  return data;
}

export function logout() {
  setAuthToken(null);
}

