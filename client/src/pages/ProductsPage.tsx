import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/products';
import { fetchCategories } from '../services/categories';
import {
  SearchBar, ProductCard, LoadingSkeleton, EmptyState, Breadcrumb, Badge,
} from '../components/ui';

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
function saveCart(lines: CartLine[]) { localStorage.setItem(CART_KEY, JSON.stringify(lines)); }
function addToCartStorage(productId: string) {
  const lines = loadCart();
  const idx = lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) lines[idx].quantity += 1;
  else lines.push({ productId, quantity: 1 });
  saveCart(lines);
}

const CATEGORY_ICONS: Record<string, string> = {
  Baskets: '🧺', Pottery: '🏺', Jewelry: '💎', Textiles: '🧵',
  'Wood Carving': '🪵', Paintings: '🎨', Leather: '👜', Beadwork: '📿',
  'Home Decor': '🏠', Accessories: '✨', Gifts: '🎁', Clothing: '👗',
};

export default function ProductsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const params = useMemo(() => ({
    q: q.trim() || undefined,
    category: category.trim() || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort: sort || undefined,
  }), [q, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchProducts(params as any);
        if (!mounted) return;
        setItems(data.items || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load products');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [params]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!mounted) return;
        setCategories(data.categories?.map((c: any) => c.name) || []);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const handleAddToCart = (productId: string, productName: string) => {
    addToCartStorage(productId);
    setToast(productName);
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => { setCategory(''); setQ(''); setMinPrice(''); setMaxPrice(''); };
  const cartCount = loadCart().reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="products-page-wrapper">
      {/* Toast */}
      {toast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span className="toast-icon">🛒</span>
          <div className="toast-body">
            <div className="toast-title">Added to cart!</div>
            <div className="toast-sub">{toast}</div>
          </div>
          <div className="toast-actions">
            <Link to="/cart" className="btn primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setToast(null)}>View Cart</Link>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setToast(null)} aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="products-header">
        <div className="container">
          <div className="products-header-inner">
            <div>
              <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
              <h1 className="products-title">Rwandan Crafts</h1>
              <p className="products-subtitle">Handmade with love by local artisans</p>
            </div>
            <div className="products-header-stats">
              <div className="pstat"><span className="pstat-num">{items.length}</span><span className="pstat-label">Products</span></div>
              <div className="pstat"><span className="pstat-num">{categories.length}</span><span className="pstat-label">Categories</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen}>
              ☰ Filters {sidebarOpen ? '▲' : '▼'}
            </button>
            <SearchBar value={q} onChange={setQ} placeholder="Search products…" />
          </div>
          <div className="toolbar-right">
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option value="newest">Newest first</option>
              <option value="new_arrivals">New arrivals</option>
              <option value="lowest_price">Price: Low → High</option>
              <option value="highest_price">Price: High → Low</option>
            </select>
            <div className="view-toggle" role="group" aria-label="View mode">
              <button className={`view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'}>⊞</button>
              <button className={`view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'}>☰</button>
            </div>
            <Link to="/cart" className="cart-pill-btn" aria-label={`Cart, ${cartCount} items`}>
              🛒 <span>{cartCount}</span>
            </Link>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar */}
          <aside className={`products-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Product filters">
            <div className="sidebar-section">
              <div className="sidebar-title">Categories</div>
              <button className={`cat-item${category === '' ? ' active' : ''}`} onClick={() => setCategory('')}>
                <span className="cat-icon">🏪</span>
                <span>All Products</span>
                <span className="cat-count">{items.length}</span>
              </button>
              {categories.map((name) => (
                <button
                  key={name}
                  className={`cat-item${category === name ? ' active' : ''}`}
                  onClick={() => setCategory(category === name ? '' : name)}
                >
                  <span className="cat-icon">{CATEGORY_ICONS[name] || '🎨'}</span>
                  <span>{name}</span>
                  <span className="cat-count">{items.filter((p) => p.category === name).length}</span>
                </button>
              ))}
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">Price Range</div>
              <div className="price-range-inputs">
                <div className="price-field">
                  <label className="price-label">Min (RWF)</label>
                  <input className="input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
                </div>
                <div className="price-sep">—</div>
                <div className="price-field">
                  <label className="price-label">Max (RWF)</label>
                  <input className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" />
                </div>
              </div>
              {(minPrice || maxPrice) && (
                <button className="clear-price-btn" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                  Clear price filter
                </button>
              )}
            </div>

            {(category || q || minPrice || maxPrice) && (
              <div className="sidebar-section">
                <div className="sidebar-title">Active Filters</div>
                <div className="active-filters">
                  {category && <span className="filter-tag">{category} <button onClick={() => setCategory('')} aria-label={`Remove ${category} filter`}>✕</button></span>}
                  {q && <span className="filter-tag">"{q}" <button onClick={() => setQ('')} aria-label="Remove search filter">✕</button></span>}
                  {(minPrice || maxPrice) && <span className="filter-tag">RWF {minPrice || '0'} – {maxPrice || '∞'} <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} aria-label="Remove price filter">✕</button></span>}
                </div>
                <button className="clear-all-btn" onClick={clearFilters}>Clear all filters</button>
              </div>
            )}
          </aside>

          {/* Product grid */}
          <main className="products-main">
            {error && <div className="products-error" role="alert">⚠️ {error}</div>}

            {loading ? (
              <LoadingSkeleton count={8} variant="card" />
            ) : items.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No products found"
                description="Try adjusting your filters or search term."
                action={{ label: 'Clear filters', onClick: clearFilters }}
              />
            ) : (
              <>
                <div className="results-count">
                  Showing <strong>{items.length}</strong> product{items.length !== 1 ? 's' : ''}
                  {category && <> in <strong>{category}</strong></>}
                </div>
                <div className={`products-grid${viewMode === 'list' ? ' list-view' : ''}`}>
                  {items.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onAddToCart={handleAddToCart}
                      listView={viewMode === 'list'}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
