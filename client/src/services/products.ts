import { apiGet } from './api';

export async function fetchProducts(params?: {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: string;
  badge?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.category) sp.set('category', params.category);
  if (params?.minPrice) sp.set('minPrice', params.minPrice);
  if (params?.maxPrice) sp.set('maxPrice', params.maxPrice);
  if (params?.sort) sp.set('sort', params.sort);
  if (params?.featured) sp.set('featured', params.featured);
  if (params?.badge) sp.set('badge', params.badge);

  const qs = sp.toString();
  return apiGet(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProductById(id: string) {
  return apiGet(`/api/products/${id}`);
}

export async function fetchFeaturedProducts() {
  return fetchProducts({ featured: 'true' });
}

export async function fetchBestSellers() {
  return fetchProducts({ badge: 'Best Seller' });
}

export async function fetchNewArrivals() {
  return fetchProducts({ badge: 'New Arrival', sort: 'newest' });
}
