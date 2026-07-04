import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById, fetchProducts } from "../services/products";
import { addWishlist } from "../services/wishlist";

const CART_KEY = "africraft_cart_v1";

type CartLine = { productId: string; quantity: number };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        x &&
        typeof x.productId === "string" &&
        Number.isFinite(Number(x.quantity)),
    );
  } catch {
    return [];
  }
}

function saveCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

function upsertLine(
  lines: CartLine[],
  productId: string,
  quantity: number,
): CartLine[] {
  const q = Math.max(1, Math.floor(quantity));
  const idx = lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) {
    const next = [...lines];
    next[idx] = { ...next[idx], quantity: next[idx].quantity + q };
    return next;
  }
  return [...lines, { productId, quantity: q }];
}

function Toast({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 24, zIndex: 999,
      background: '#fff', border: '1px solid rgba(139,94,60,.2)',
      borderRadius: 14, padding: '14px 18px', boxShadow: '0 12px 32px rgba(60,36,18,.15)',
      display: 'flex', alignItems: 'center', gap: 14, minWidth: 280,
    }}>
      <span style={{ fontSize: 22 }}>🛒</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#4d2f17' }}>Added to cart!</div>
        <div className="small" style={{ marginTop: 2 }}>{name}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link to="/cart" className="btn primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={onClose}>View Cart</Link>
        <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={onClose}>Dismiss</button>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [toast, setToast] = useState(false);

  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        if (!mounted) return;
        setProduct(data.item);

        const recData = await fetchProducts({ category: data.item?.category, sort: 'new_arrivals' } as any);
        if (!mounted) return;
        setRecommendations((recData.items || []).filter((item: any) => item._id !== id).slice(0, 3));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const canAdd = useMemo(() => {
    if (!product) return false;
    return qty >= 1 && product.stock >= qty && product.isActive !== false;
  }, [product, qty]);

  function addToCart() {
    if (!product || !id) return;
    const lines = loadCart();
    const next = upsertLine(lines, id, qty);
    saveCart(next);
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  }

  async function addToWishlist() {
    if (!id) return;
    try {
      await addWishlist(id);
      alert('Added to wishlist');
    } catch (err: any) {
      alert(err?.message || 'Failed to add wishlist');
    }
  }

  return (
    <div className="container page">
      {toast && product && <Toast name={product.name} onClose={() => setToast(false)} />}
      <div className="card" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "flex-start",
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="h1">Product Details</div>
            <p className="p">Authentic Rwandan craft information.</p>
          </div>
          <div>
            <Link className="btn" to="/products">
              Back
            </Link>
          </div>
        </div>

        <div className="page-trust-bar">
          <span className="badge">Handcrafted</span>
          <span className="badge">Secure checkout</span>
          <span className="badge">Local artisan support</span>
        </div>

        {loading ? (
          <div className="small" style={{ marginTop: 16 }}>
            Loading...
          </div>
        ) : null}
        {error ? (
          <div
            className="badge"
            style={{ marginTop: 16, borderColor: "rgba(251,113,133,.45)" }}
          >
            {error}
          </div>
        ) : null}

        {product ? (
          <div style={{ marginTop: 16 }} className="grid">
            <div className="col-6">
              <div className="summary-card" style={{ padding: 16 }}>
                <div
                  style={{
                    height: 260,
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontWeight: 800, color: '#92400e', textAlign: 'center', padding: 16 }}>{product.name}</div>
                  )}
                </div>

                <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>
                  {product.name}
                </div>
                <div className="small" style={{ marginBottom: 10 }}>
                  {product.category}
                </div>
                <div className="p">{product.description}</div>

                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <div className="badge">Price: RWF {Number(product.price).toLocaleString()}</div>
                  <div className="badge">Available stock: {product.stock}</div>
                  <div className="badge">Category: {product.category}</div>
                  <div className="badge">Material: {product.material || 'Handcrafted'}</div>
                  <div className="badge">Artisan: {product.artisanName || 'Local artisan'}</div>
                  <div className="badge">Rating: {product.averageRating?.toFixed ? product.averageRating.toFixed(1) : product.averageRating || 0} / 5</div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="summary-card" style={{ padding: 16 }}>
                <div className="small" style={{ marginBottom: 8 }}>Quantity</div>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%' }}
                />

                <button
                  className={canAdd ? 'btn primary' : 'btn'}
                  style={{ width: '100%', marginTop: 14, cursor: canAdd ? 'pointer' : 'not-allowed' }}
                  onClick={canAdd ? addToCart : undefined}
                  type="button"
                >
                  Add to Cart
                </button>

                <button className="btn" type="button" style={{ width: '100%', marginTop: 10 }} onClick={addToWishlist}>
                  Add to Wishlist
                </button>

                <div className="small" style={{ marginTop: 10 }}>
                  {product.stock < qty ? 'Quantity exceeds available stock.' : null}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Link className="btn" to="/cart" style={{ width: '100%' }}>
                    Go to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {recommendations.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <div className="h1" style={{ fontSize: 20 }}>Recommended for You</div>
            <p className="p">Other handcrafted items that match this category.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
              {recommendations.map((item: any) => (
                <div key={item._id} className="summary-card" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.name}</div>
                  <div className="small" style={{ marginBottom: 8 }}>{item.category}</div>
                  <div style={{ fontWeight: 800, color: '#b45309', marginBottom: 10 }}>RWF {Number(item.price).toLocaleString()}</div>
                  <Link className="btn" to={`/products/${item._id}`}>View</Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


