import { apiGet } from './api';

export async function fetchProducts(params?: { q?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.category) sp.set('category', params.category);
  if (params?.minPrice) sp.set('minPrice', params.minPrice);
  if (params?.maxPrice) sp.set('maxPrice', params.maxPrice);
  if (params?.sort) sp.set('sort', params.sort);

  const qs = sp.toString();
  return apiGet(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProductById(id: string) {
  return apiGet(`/api/products/${id}`);
}

