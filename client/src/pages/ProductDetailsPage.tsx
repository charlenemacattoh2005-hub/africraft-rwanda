import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../services/products';
import { addWishlist } from '../services/wishlist';
import { Breadcrumb, ProductCard, LoadingSkeleton } from '../components/ui';

const CART_KEY = 'africraft_cart_v1';
type CartLine = { productId: string; quantity: number };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.productId === 'string' && Number.isFinite(Number(x.quantity))) : [];
  } catch { return []; }
}
function saveCart(lines: CartLine[]) { localStorage.setItem(CART_KEY, JSON.stringify(lines)); }
function upsertLine(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  const q = Math.max(1, Math.floor(quantity));
  const idx = lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) { const next = [...lines]; next[idx] = { ...next[idx], quantity: next[idx].quantity + q }; return next; }
  return [...lines, { productId, quantity: q }];
}

function CartToast({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <span className="toast-icon">🛒</span>
      <div className="toast-body">
        <div className="toast-title">Added to cart!</div>
        <div className="toast-sub">{name}</div>
      </div>
      <div className="toast-actions">
        <Link to="/cart" className="btn primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={onClose}>View Cart</Link>
        <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={onClose} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [product,         setProduct]         = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [toast,           setToast]           = useState(false);
  const [qty,             setQty]             = useState(1);
  const [wishlistMsg,     setWishlistMsg]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true); setError(null); setProduct(null);
    (async () => {
      try {
        const data = await fetchProductById(id);
        if (!mounted) return;
        setProduct(data.item);
        const recData = await fetchProducts({ category: data.item?.category, sort: 'new_arrivals' } as any);
        if (!mounted) return;
        setRecommendations((recData.items || []).filter((i: any) => i._id !== id).slice(0, 4));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load product');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const canAdd = useMemo(() => {
    if (!product) return false;
    return qty >= 1 && product.stock >= qty && product.isActive !== false;
  }, [product, qty]);

  function addToCart() {
    if (!product || !id) return;
    saveCart(upsertLine(loadCart(), id, qty));
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  }

  async function addToWishlist() {
    if (!id) return;
    try {
      await addWishlist(id);
      setWishlistMsg('Added to wishlist ♡');
      setTimeout(() => setWishlistMsg(null), 3000);
    } catch (err: any) {
      setWishlistMsg(err?.message || 'Failed to add to wishlist');
      setTimeout(() => setWishlistMsg(null), 3000);
    }
  }

  const stockStatus = !product ? null
    : product.stock === 0       ? { label: 'Out of stock', cls: 'out' }
    : product.stock <= 5        ? { label: `Only ${product.stock} left`, cls: 'low-stock' }
    : { label: 'In stock', cls: 'in-stock' };

  const stars = Math.round(product?.averageRating || 0);

  return (
    <div className="container page">
      {toast && product && <CartToast name={product.name} onClose={() => setToast(false)} />}

      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Home', to: '/' },
        { label: 'Shop', to: '/products' },
        { label: product?.name || 'Product' },
      ]} />

      {/* Loading skeleton */}
      {loading && (
        <div className="product-detail-layout" style={{ marginTop: 24 }}>
          <div className="skeleton" style={{ borderRadius: 18, aspectRatio: '1', width: '100%' }} />
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 32, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 32, width: '50%', borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 48, borderRadius: 12 }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="products-error" role="alert" style={{ marginTop: 24 }}>⚠️ {error}</div>
      )}

      {/* Product detail */}
      {product && !loading && (
        <div className="product-detail-layout">

          {/* Image */}
          <div className="product-detail-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <div className="product-detail-image-placeholder">🎨</div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div className="product-detail-category">{product.category}</div>
            <h1 className="product-detail-name">{product.name}</h1>

            {/* Rating */}
            {(product.reviewCount || 0) > 0 && (
              <div className="product-detail-rating">
                <span className="stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                <span className="rating-count">({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Price */}
            <div className="product-detail-price">
              RWF {Number(product.price).toLocaleString()}
              <span>per item</span>
            </div>

            {/* Stock */}
            {stockStatus && (
              <div className="stock-indicator">
                <span className={`stock-dot ${stockStatus.cls}`} aria-hidden="true" />
                <span style={{ color: stockStatus.cls === 'out' ? 'var(--danger)' : stockStatus.cls === 'low-stock' ? '#d97706' : 'var(--green)' }}>
                  {stockStatus.label}
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="product-detail-desc">{product.description}</p>
            )}

            {/* Specs */}
            <div className="product-specs">
              {[
                { key: 'Category',  val: product.category },
                { key: 'Material',  val: product.material  || 'Handcrafted' },
                { key: 'Artisan',   val: product.artisanName || 'Local artisan' },
                { key: 'Rating',    val: `${product.averageRating?.toFixed ? product.averageRating.toFixed(1) : 0} / 5` },
              ].map(({ key, val }) => (
                <div key={key} className="product-spec-row">
                  <span className="product-spec-key">{key}</span>
                  <span className="product-spec-value">{val}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="product-qty-row">
                <span className="product-qty-label">Quantity</span>
                <div className="product-qty-ctrl" role="group" aria-label="Quantity selector">
                  <button
                    className="product-qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="product-qty-val" aria-live="polite">{qty}</span>
                  <button
                    className="product-qty-btn"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                {qty > product.stock && (
                  <span className="small" style={{ color: 'var(--danger)' }}>Exceeds available stock</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="product-actions-row">
              <button
                className={`btn${canAdd ? ' primary' : ''}`}
                onClick={canAdd ? addToCart : undefined}
                disabled={!canAdd}
                aria-label={canAdd ? 'Add to cart' : 'Out of stock'}
              >
                {product.stock === 0 ? '🚫 Out of stock' : '🛒 Add to cart'}
              </button>
              <button className="btn" onClick={addToWishlist} aria-label="Add to wishlist">
                ♡ Wishlist
              </button>
              <Link to="/cart" className="btn">View cart</Link>
            </div>

            {wishlistMsg && (
              <div className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>{wishlistMsg}</div>
            )}

            {/* Trust badges */}
            <div className="page-trust-bar">
              <span className="badge">🌿 Handcrafted</span>
              <span className="badge">🔒 Secure checkout</span>
              <span className="badge">🚚 Local delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="recommendations-section">
          <div className="recommendations-title">You may also like</div>
          <p className="recommendations-sub">Other handcrafted items from the same category.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {recommendations.map((item) => (
              <ProductCard key={item._id} product={item} variant="home" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
