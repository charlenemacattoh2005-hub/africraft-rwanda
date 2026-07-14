import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/products';
import { getAuthToken } from '../services/api';
import { Badge } from '../components/ui';

const CART_KEY = 'africraft_cart_v1';
type CartLine   = { productId: string; quantity: number };
type ProductInfo = { _id: string; name: string; price: number; stock: number; imageUrl?: string; category?: string };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.productId === 'string')
      .map((x) => ({ productId: x.productId, quantity: Math.max(1, Math.floor(Number(x.quantity) || 1)) }));
  } catch { return []; }
}
function saveCart(lines: CartLine[]) { localStorage.setItem(CART_KEY, JSON.stringify(lines)); }

const DELIVERY_FEE = 0; // shown as "calculated at checkout"

export default function CartPage() {
  const navigate = useNavigate();
  const [lines,    setLines]    = useState<CartLine[]>(() => loadCart());
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (lines.length === 0) { setProducts({}); return; }
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(
          lines.map(async (l) => {
            try { const d = await fetchProductById(l.productId); return [l.productId, d.item] as const; }
            catch { return [l.productId, null] as const; }
          })
        );
        if (!mounted) return;
        const next: Record<string, ProductInfo> = {};
        for (const [id, item] of entries) { if (item) next[id] = item; }
        setProducts(next);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [lines]);

  function changeQty(productId: string, delta: number) {
    const next = lines.map((l) => l.productId === productId ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l);
    setLines(next); saveCart(next);
  }
  function removeLine(productId: string) {
    const next = lines.filter((l) => l.productId !== productId);
    setLines(next); saveCart(next);
  }

  const subtotal      = useMemo(() => lines.reduce((s, l) => s + (products[l.productId]?.price || 0) * l.quantity, 0), [lines, products]);
  const totalQuantity = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);

  if (lines.length === 0) {
    return (
      <div className="container page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <div className="cart-empty-title">Your cart is empty</div>
          <p className="cart-empty-sub">Discover handcrafted treasures from Rwandan artisans.</p>
          <Link to="/products" className="btn primary">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div style={{ marginBottom: 8 }}>
        <h1 className="h1">Shopping Cart</h1>
        <p className="p">{totalQuantity} item{totalQuantity !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="page-trust-bar" style={{ marginBottom: 0 }}>
        <Badge variant="success">🔒 Secure checkout</Badge>
        <Badge variant="success">📱 Mobile money ready</Badge>
        <Badge variant="success">🚚 Fast Rwanda delivery</Badge>
      </div>

      <div className="cart-layout">
        {/* Line items */}
        <div style={{ display: 'grid', gap: 12 }}>
          {loading && (
            <div className="small" style={{ color: 'var(--muted)', padding: '8px 0' }}>Loading product details…</div>
          )}
          {lines.map((l) => {
            const p = products[l.productId];
            return (
              <div key={l.productId} className="cart-item">
                <div className="cart-item-thumb">
                  {p?.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} />
                    : <span className="cart-item-thumb-placeholder">🎨</span>
                  }
                </div>

                <div className="cart-item-body">
                  <Link to={`/products/${l.productId}`} className="cart-item-name">
                    {p?.name || 'Loading…'}
                  </Link>
                  <div className="cart-item-category">{p?.category || 'Handcrafted item'}</div>
                  {p && <div className="cart-item-unit-price">RWF {Number(p.price).toLocaleString()} each</div>}

                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => changeQty(l.productId, -1)} disabled={l.quantity <= 1} aria-label="Decrease quantity">−</button>
                    <span className="qty-display" aria-live="polite">{l.quantity}</span>
                    <button className="qty-btn" onClick={() => changeQty(l.productId, +1)} disabled={p ? l.quantity >= p.stock : false} aria-label="Increase quantity">+</button>
                    <button
                      className="btn danger"
                      style={{ fontSize: 12, padding: '5px 10px', marginLeft: 4 }}
                      onClick={() => removeLine(l.productId)}
                      aria-label={`Remove ${p?.name || 'item'} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-line-total">
                  {p ? `RWF ${(p.price * l.quantity).toLocaleString()}` : '—'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary panel */}
        <div className="cart-summary-panel">
          <div className="cart-summary-title">Order Summary</div>

          <div className="cart-summary-row">
            <span>Subtotal ({totalQuantity} item{totalQuantity !== 1 ? 's' : ''})</span>
            <span>RWF {subtotal.toLocaleString()}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery</span>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>Calculated at checkout</span>
          </div>
          <div className="cart-summary-row total">
            <span>Estimated total</span>
            <span>RWF {subtotal.toLocaleString()}</span>
          </div>

          <button
            className="btn primary"
            style={{ width: '100%', marginTop: 20, padding: '13px' }}
            onClick={() => {
              if (getAuthToken()) {
                navigate('/checkout');
              } else {
                navigate('/login', { state: { from: { pathname: '/checkout' } } });
              }
            }}
          >
            Proceed to checkout →
          </button>
          <Link to="/products" className="btn" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}>
            Continue shopping
          </Link>

          <div style={{ marginTop: 16, display: 'grid', gap: 6 }}>
            {['🔒 SSL encrypted checkout', '📱 MTN MoMo & Airtel Money', '🚚 Delivery across Rwanda'].map((t) => (
              <div key={t} className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
