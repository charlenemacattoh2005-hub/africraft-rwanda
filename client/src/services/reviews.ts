import { apiGet, apiPost, apiDelete } from './api';

export async function fetchProductReviews(productId: string) {
  return apiGet(`/api/reviews/${productId}`);
}

export async function saveProductReview(productId: string, rating: number, comment: string) {
  return apiPost(`/api/reviews/${productId}`, { rating, comment }, true);
}

export async function deleteProductReview(productId: string) {
  return apiDelete(`/api/reviews/${productId}`, true);
}
