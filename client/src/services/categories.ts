import { apiGet } from './api';

export async function fetchCategories() {
  return apiGet('/api/categories');
}
