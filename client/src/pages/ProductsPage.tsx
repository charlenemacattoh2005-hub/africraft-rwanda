import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/products";
import { fetchCategories } from "../services/categories";

const CART_KEY = 'africraft_cart_v1';
type CartLine = { productId: string; quantity: number };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.productId === 'string') : [];
  } catch { return []; }
}

function saveCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

function addToCartStorage(productId: string) {
  const lines = loadCart();
  const idx = lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) {
    lines[idx].quantity += 1;
  } else {
    lines.push({ productId, quantity: 1 });
  }
  saveCart(lines);
}

export default function ProductsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<string>("newest");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      category: category.trim() || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: sort || undefined,
    }),
    [q, category, minPrice, maxPrice, sort],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts(params as any);
        if (!mounted) return;
        setItems(data.items || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!mounted) return;
        setCategories(data.categories?.map((c: any) => c.name) || []);
      } catch {
        // ignore category load errors
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = (productId: string, productName: string) => {
    addToCartStorage(productId);
    setToast(productName);
    setTimeout(() => setToast(null), 4000);
  };

  const cartLines = loadCart();
  const cartCount = cartLines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="container page">
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 999,
          background: '#fff', border: '1px solid rgba(139,94,60,.2)',
          borderRadius: 14, padding: '14px 18px', boxShadow: '0 12px 32px rgba(60,36,18,.15)',
          display: 'flex', alignItems: 'center', gap: 14, minWidth: 280,
        }}>
          <span style={{ fontSize: 22 }}>🛒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#4d2f17' }}>Added to cart!</div>
            <div className="small" style={{ marginTop: 2 }}>{toast}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Link to="/cart" className="btn primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setToast(null)}>View Cart</Link>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setToast(null)}>Dismiss</button>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Products</div>
        <p className="p">Browse authentic Rwandan crafts and artisan items.</p>

        <div className="grid" style={{ marginTop: 18 }}>
          <div className="col-4">
            <label className="small">Search</label>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product name"
            />
          </div>
          <div className="col-4">
            <label className="small">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-4">
            <label className="small">Sort</label>
            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="new_arrivals">New arrivals</option>
              <option value="lowest_price">Lowest price</option>
              <option value="highest_price">Highest price</option>
            </select>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 14 }}>
          <div className="col-6">
            <label className="small">Min price</label>
            <input
              className="input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-6">
            <label className="small">Max price</label>
            <input
              className="input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10000"
            />
          </div>
        </div>

        {error ? (
          <div
            className="badge"
            style={{ marginTop: 16, borderColor: "rgba(251,113,133,.45)" }}
          >
            {error}
          </div>
        ) : null}

        <div className="cart-pill" style={{ marginTop: 18 }}>
          <div>
            <div style={{ fontWeight: 800 }}>🛒 {cartCount} item{cartCount === 1 ? '' : 's'} in cart</div>
          </div>
          <Link to="/cart" className="btn primary">View cart</Link>
        </div>

        <div style={{ marginTop: 18 }}>
          {loading ? <div className="small">Loading...</div> : null}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {items.map((p) => (
              <div key={p._id} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    height: 160,
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#92400e',
                    textAlign: 'center',
                    padding: 0,
                    border: '1px solid rgba(217, 119, 6, 0.15)',
                  }}
                >
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    p.name
                  )}
                </div>

                <div style={{ fontWeight: 800 }}>{p.name}</div>
                <div className="small">{p.category}</div>
                <div style={{ fontWeight: 800, color: '#b45309' }}>RWF {Number(p.price).toLocaleString()}</div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {p.reviewCount > 0 ? (
                    <span className="badge">★ {p.averageRating} ({p.reviewCount})</span>
                  ) : (
                    <span className="badge">No reviews</span>
                  )}
                  <span className="badge">Stock: {p.stock}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link to={`/products/${p._id}`} className="btn" style={{ flex: 1, textAlign: 'center' }}>
                    View Details
                  </Link>
                  <button className="btn primary" style={{ flex: 1 }} onClick={() => handleAddToCart(p._id, p.name)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!loading && items.length === 0 && !error ? (
            <div className="small" style={{ marginTop: 14 }}>
              No products found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


