import { apiGetAuth, apiDelete } from './api';

export async function fetchAllReviews() {
  return apiGetAuth('/api/admin/reviews');
}

export async function deleteReviewByAdmin(reviewId: string) {
  return apiDelete(`/api/admin/reviews/${reviewId}`, true);
}
