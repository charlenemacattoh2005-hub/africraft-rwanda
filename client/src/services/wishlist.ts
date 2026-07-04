import { apiGetAuth, apiPost, apiDelete } from './api';

export async function fetchWishlist() {
  return apiGetAuth('/api/wishlist');
}

export async function addWishlist(productId: string) {
  return apiPost(`/api/wishlist/${productId}`, null, true);
}

export async function removeWishlist(productId: string) {
  return apiDelete(`/api/wishlist/${productId}`, true);
}
