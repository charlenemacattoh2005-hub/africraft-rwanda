import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductReviews, saveProductReview, deleteProductReview } from '../services/reviews';
import { fetchProductById } from '../services/products';
import { getAuthToken } from '../services/api';

export default function ProductReviews() {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => Boolean(getAuthToken()), []);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [productData, reviewData] = await Promise.all([
          fetchProductById(id),
          fetchProductReviews(id),
        ]);
        if (!mounted) return;
        setProduct(productData.item);
        setReviews(reviewData.reviews || []);
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
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await saveProductReview(id, rating, comment);
      setReviews((current) => {
        const existingIndex = current.findIndex((item) => item.userId === data.review.userId);
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = data.review;
          return next;
        }
        return [data.review, ...current];
      });
      setSuccess('Review saved successfully');
    } catch (err: any) {
      setError(err?.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await deleteProductReview(id);
      setReviews((current) => current.filter((review) => review.productId !== id));
      setSuccess('Review deleted');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete review');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 20, marginTop: 20 }}>
      <div className="h1">Reviews</div>
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

      {success ? (
        <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(34,197,94,.45)' }}>
          {success}
        </div>
      ) : null}

      {product ? (
        <div className="small" style={{ marginTop: 12 }}>
          Reviews for {product.name} • {product.averageRating ? `Avg ${product.averageRating}/5` : 'No average rating yet'} • {reviews.length} review{reviews.length === 1 ? '' : 's'}
        </div>
      ) : null}

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {reviews.length === 0 ? (
          <div className="small">No reviews yet.</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{review.rating} / 5</div>
                  <div className="small">{review.comment || 'No comment provided'}</div>
                </div>
                <div className="small">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
          <div className="grid">
            <div className="col-6">
              <label className="small">Rating</label>
              <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ height: 12 }} />
          <label className="small">Comment</label>
          <textarea
            className="input"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience"
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <button className={saving ? 'btn' : 'btn primary'} type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Submit review'}
            </button>
            <button className="btn danger" type="button" onClick={onDelete} disabled={saving}>
              Delete my review
            </button>
          </div>
        </form>
      ) : (
        <div className="small" style={{ marginTop: 20 }}>
          Login to submit a review.
        </div>
      )}
    </div>
  );
}
