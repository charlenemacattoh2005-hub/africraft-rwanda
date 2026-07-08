import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAllReviews, deleteReviewByAdmin } from '../services/adminReviews';

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function AdminReviewModerationPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function Inner() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string|null>(null);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    let ok = true;
    fetchAllReviews()
      .then(d => { if (ok) setReviews(d.reviews || []); })
      .catch(e => { if (ok) setError(e?.message || 'Failed'); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  async function onDelete(id: string) {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReviewByAdmin(id);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  }

  const filtered = reviews.filter(r =>
    search === '' ||
    r.productId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="accent-bar" />
      <div className="h1" style={{ marginBottom:4 }}>Review Moderation</div>
      <p className="p" style={{ marginBottom:20 }}>Manage and moderate customer reviews across all products.</p>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <input className="input" style={{ maxWidth:300 }} placeholder="Search by product or customer…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="badge" style={{ alignSelf:'center' }}>{filtered.length} reviews</div>
      </div>

      {loading && <div className="skeleton" style={{ height:200 }} />}
      {error && <div className="badge" style={{ borderColor:'rgba(220,38,38,.3)', color:'#dc2626', background:'rgba(220,38,38,.08)' }}>{error}</div>}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--muted)' }}>No reviews found.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight:700 }}>{r.productId?.name || '—'}</td>
                  <td className="small">{r.userId?.email || '—'}</td>
                  <td style={{ color:'#d97706', fontWeight:700, letterSpacing:1 }}>{stars(r.rating)}</td>
                  <td style={{ maxWidth:220, fontSize:13 }}>{r.comment || <span style={{ color:'var(--muted)' }}>No comment</span>}</td>
                  <td className="small">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn danger" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => onDelete(r._id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
