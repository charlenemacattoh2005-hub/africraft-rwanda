import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { fetchWishlist, removeWishlist } from '../services/wishlist';
import { fetchProductById } from '../services/products';

const CART_KEY = 'africraft_cart_v1';

function addToCart(productId: string) {
  try {
    const lines = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const idx = lines.findIndex((x: any) => x.productId === productId);
    if (idx >= 0) lines[idx].quantity += 1;
    else lines.push({ productId, quantity: 1 });
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {}
}

export default function WishlistPage() {
  return <RequireAuth><WishlistInner /></RequireAuth>;
}

function WishlistInner() {
  const [items,    setItems]    = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist()
      .then(d => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!items.length) return;
    Promise.all(items.map(i => fetchProductById(i.productId).then(d => [i.productId, d.item]).catch(() => [i.productId, null])))
      .then(entries => {
        const map: Record<string, any> = {};
        entries.forEach(([id, p]) => { if (p) map[id as string] = p; });
        setProducts(map);
      });
  }, [items]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function onRemove(productId: string) {
    await removeWishlist(productId).catch(() => {});
    setItems(cur => cur.filter(i => i.productId !== productId));
    showToast('Removed from wishlist');
  }

  function onMoveToCart(productId: string, name: string) {
    addToCart(productId);
    showToast(`${name} added to cart!`);
  }

  return (
    <div className="container page">
      {toast && <div className="admin-toast success" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>✅ {toast}</div>}

      <div className="account-header">
        <div>
          <h1 className="account-title">❤️ My Wishlist</h1>
          <p className="account-subtitle">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/products" className="btn">Continue shopping</Link>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❤️</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Your wishlist is empty</div>
          <p style={{ color: '#78716c', marginBottom: 20 }}>Browse products and save your favorites here.</p>
          <Link to="/products" className="btn primary">Browse products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {items.map(item => {
            const p = products[item.productId];
            return (
              <div key={item.productId} className="wishlist-card">
                <Link to={`/products/${item.productId}`} className="wishlist-img-wrap">
                  {p?.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="wishlist-img" />
                    : <div className="wishlist-img-placeholder">🛍️</div>}
                  {p?.badge && <span className="wishlist-badge">{p.badge}</span>}
                </Link>
                <div className="wishlist-body">
                  <Link to={`/products/${item.productId}`} className="wishlist-name">{p?.name || 'Loading…'}</Link>
                  <div className="wishlist-category">{p?.category || ''}</div>
                  <div className="wishlist-price">RWF {p ? Number(p.price).toLocaleString() : '—'}</div>
                  <div className="wishlist-stock">
                    {p?.stock === 0
                      ? <span style={{ color: '#dc2626', fontSize: 12 }}>Out of stock</span>
                      : <span style={{ color: '#15803d', fontSize: 12 }}>✓ In stock ({p?.stock})</span>}
                  </div>
                  <div className="wishlist-actions">
                    <button className="btn primary" style={{ flex: 1, fontSize: 12 }}
                      disabled={!p || p.stock === 0}
                      onClick={() => onMoveToCart(item.productId, p?.name || 'Item')}>
                      🛒 Add to Cart
                    </button>
                    <button className="btn" style={{ fontSize: 12, padding: '8px 12px', color: '#dc2626', borderColor: 'rgba(220,38,38,.3)' }}
                      onClick={() => onRemove(item.productId)} title="Remove from wishlist">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
