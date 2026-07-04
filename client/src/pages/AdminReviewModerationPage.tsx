import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { getAuthPayload } from '../services/api';
import { fetchAllReviews, deleteReviewByAdmin } from '../services/adminReviews';

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payload = getAuthPayload();
  const isAdmin = payload?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllReviews();
        if (!mounted) return;
        setReviews(data.reviews || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load reviews');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  async function onDelete(id: string) {
    setLoading(true);
    setError(null);
    try {
      await deleteReviewByAdmin(id);
      setReviews((current) => current.filter((review) => review._id !== id));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <div className="container page">
        <div className="card" style={{ padding: 20 }}>
          <div className="h1">Review Moderation</div>
          <p className="p">Manage customer reviews across all products.</p>
          <div className="page-trust-bar">
            <span className="badge">Review oversight</span>
            <span className="badge">Content safety</span>
            <span className="badge">Customer feedback</span>
          </div>

          {loading ? (
            <div className="small" style={{ marginTop: 16 }}>
              Loading reviews...
            </div>
          ) : null}
          {error ? (
            <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
              {error}
            </div>
          ) : null}

          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            {reviews.map((review) => (
              <div key={review._id} className="summary-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{review.productId?.name || review.productId}</div>
                    <div className="small">Customer: {review.userId?.email || review.userId}</div>
                    <div className="small">Rating: {review.rating}/5</div>
                    <div style={{ marginTop: 8 }}>{review.comment || 'No comment'}</div>
                  </div>
                  <button className="btn danger" type="button" onClick={() => onDelete(review._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!loading && reviews.length === 0 ? (
              <div className="small">No reviews available.</div>
            ) : null}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
