import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFeaturedProducts, fetchBestSellers, fetchNewArrivals } from '../services/products';
import { fetchCategories } from '../services/categories';
import { ProductCard, LoadingSkeleton } from '../components/ui';

// ─── Product grid section ────────────────────────────────────
function ProductSection({ title, subtitle, items, loading, to }: {
  title: string; subtitle: string;
  items: any[]; loading: boolean; to: string;
}) {
  return (
    <section className="home-section" aria-label={title}>
      <div className="home-section-header">
        <div>
          <h2 className="home-section-title">{title}</h2>
          <p className="home-section-sub">{subtitle}</p>
        </div>
        <Link to={to} className="home-section-link">View all →</Link>
      </div>
      {loading ? (
        <LoadingSkeleton count={4} variant="card" />
      ) : items.length === 0 ? (
        <div className="home-empty">No products available right now.</div>
      ) : (
        <div className="home-product-grid">
          {items.slice(0, 8).map(p => <ProductCard key={p._id} product={p} variant="home" />)}
        </div>
      )}
    </section>
  );
}

// ─── Stat ticker ─────────────────────────────────────────────
function StatBar({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="home-stat-bar" aria-label="Platform statistics">
      {stats.map(s => (
        <div key={s.label} className="home-stat-item">
          <span className="home-stat-val">{s.value}</span>
          <span className="home-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [featured,    setFeatured]    = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [categories,  setCategories]  = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [heroSearch,  setHeroSearch]  = useState('');
  const [showTop,     setShowTop]     = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchFeaturedProducts(),
      fetchBestSellers(),
      fetchNewArrivals(),
      fetchCategories(),
    ])
      .then(([f, b, n, c]) => {
        if (!mounted) return;
        setFeatured(f.items || []);
        setBestSellers((b.items || []).slice(0, 8));
        setNewArrivals((n.items || []).slice(0, 8));
        setCategories((c.categories || []).filter((cat: any) => cat.isActive).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function onHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/products?q=${encodeURIComponent(heroSearch.trim())}`);
    else navigate('/products');
  }

  const CATEGORY_ICONS: Record<string, string> = {
    Baskets: '🧺', Pottery: '🏺', Jewelry: '💎', Textiles: '🧵',
    'Wood Carvings': '🪵', Paintings: '🎨', 'Home Décor': '🏠',
    Bags: '👜', Gifts: '🎁', Kitchen: '🍳', Games: '🎲',
    Storage: '📦', Jewelry2: '📿', 'Musical Instruments': '🎵',
  };

  const platformStats = [
    { value: `${Math.max(featured.length + bestSellers.length + newArrivals.length, 50)}+`, label: 'Products' },
    { value: `${Math.max(categories.length, 8)}+`,  label: 'Categories' },
    { value: '5,000+', label: 'Happy Customers' },
    { value: '30',     label: 'Districts Served' },
  ];

  return (
    <div className="home-page">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="home-hero" aria-label="Hero">
        <div className="container">
          <div className="home-hero-inner">
            <div className="home-hero-content">
              <span className="home-hero-pill">🌿 Handcrafted in Rwanda</span>
              <h1 className="home-hero-title">
                Discover authentic<br />artisan treasures
              </h1>
              <p className="home-hero-lead">
                Support local makers, find meaningful gifts, and enjoy a beautifully
                simple shopping journey — from browsing to your doorstep.
              </p>

              {/* Search bar */}
              <form onSubmit={onHeroSearch} className="home-hero-search" role="search">
                <input
                  type="search"
                  placeholder="Search baskets, jewelry, wood carvings…"
                  value={heroSearch}
                  onChange={e => setHeroSearch(e.target.value)}
                  aria-label="Search products"
                />
                <button type="submit" className="btn primary">Search</button>
              </form>

              <div className="home-hero-actions">
                <Link to="/products"   className="btn primary">Shop now</Link>
                <Link to="/categories" className="btn">Browse categories</Link>
              </div>

              <div className="home-hero-badges">
                <span>🌿 Ethically made</span>
                <span>✨ Curated gifts</span>
                <span>🚚 Fast local delivery</span>
                <span>🔒 Secure checkout</span>
              </div>
            </div>

            <div className="home-hero-visual" aria-hidden="true">
              <div className="home-hero-card">
                <div className="home-hero-card-label">Featured this week</div>
                <div className="home-hero-card-title">Basket weave collection</div>
                <p style={{ fontSize: 12, color: '#78716c', marginTop: 8 }}>
                  Freshly sourced from Kigali artisans — styled for modern homes.
                </p>
                <Link to="/products?category=Baskets" className="btn primary" style={{ marginTop: 14, width: '100%', textAlign: 'center' }}>
                  Shop baskets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="container">
        <StatBar stats={platformStats} />

        {/* ── Category grid (from DB) ───────────────────── */}
        {categories.length > 0 && (
          <section className="home-section" aria-label="Shop by category">
            <div className="home-section-header">
              <div>
                <h2 className="home-section-title">Shop by category</h2>
                <p className="home-section-sub">Find exactly what you're looking for</p>
              </div>
              <Link to="/categories" className="home-section-link">All categories →</Link>
            </div>
            <div className="home-cat-grid">
              {categories.map(cat => (
                <Link key={cat._id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="home-cat-card">
                  {cat.imageUrl
                    ? <img src={cat.imageUrl} alt={cat.name} className="home-cat-img"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div className="home-cat-icon">{CATEGORY_ICONS[cat.name] || '🎨'}</div>}
                  <div className="home-cat-name">{cat.name}</div>
                  {cat.description && <div className="home-cat-desc">{cat.description.slice(0, 50)}</div>}
                </Link>
              ))}
              {/* Show text fallbacks if DB has no categories yet */}
              {categories.length === 0 && !loading && [
                { name: 'Baskets',      icon: '🧺', to: '/products?category=Baskets' },
                { name: 'Jewelry',      icon: '💎', to: '/products?category=Jewelry' },
                { name: 'Pottery',      icon: '🏺', to: '/products?category=Pottery' },
                { name: 'Paintings',    icon: '🎨', to: '/products?category=Paintings' },
                { name: 'Wood Carvings',icon: '🪵', to: '/products?category=Wood+Carvings' },
                { name: 'Home Décor',   icon: '🏠', to: '/products?category=Home+Décor' },
              ].map(c => (
                <Link key={c.name} to={c.to} className="home-cat-card">
                  <div className="home-cat-icon">{c.icon}</div>
                  <div className="home-cat-name">{c.name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── New arrivals ──────────────────────────────── */}
        <ProductSection
          title="New arrivals"
          subtitle="Fresh additions just landed from Rwandan artisans"
          items={newArrivals}
          loading={loading}
          to="/products?badge=New+Arrival"
        />

        {/* ── Featured products ─────────────────────────── */}
        {(loading || featured.length > 0) && (
          <ProductSection
            title="Featured products"
            subtitle="A handpicked selection of our finest artisan pieces"
            items={featured}
            loading={loading}
            to="/products?featured=true"
          />
        )}

        {/* ── Best sellers ──────────────────────────────── */}
        <ProductSection
          title="Best sellers"
          subtitle="Most-loved products from artisans across Rwanda"
          items={bestSellers}
          loading={loading}
          to="/products?badge=Best+Seller"
        />

        {/* ── Why shop with us ──────────────────────────── */}
        <section className="home-section" aria-label="Why shop with us">
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">Why AfriCraft Rwanda?</h2>
              <p className="home-section-sub">Every purchase makes a difference</p>
            </div>
          </div>
          <div className="home-features-grid">
            {[
              { icon: '🎨', title: 'Verified artisans',   text: 'Every maker is verified with story and origin — no mass-produced goods.' },
              { icon: '🚚', title: 'Fast local delivery',  text: 'Reliable delivery across Rwanda with real-time tracking updates.' },
              { icon: '🔒', title: 'Secure checkout',      text: 'Mobile money, cash on delivery, and safe payment processing.' },
              { icon: '🌿', title: 'Ethical sourcing',     text: 'Fair prices paid directly to artisans — your purchase matters.' },
            ].map(f => (
              <div key={f.title} className="home-feature-card">
                <div className="home-feature-icon">{f.icon}</div>
                <div className="home-feature-title">{f.title}</div>
                <div className="home-feature-text">{f.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────── */}
        <section className="home-cta-banner" aria-label="Call to action">
          <div className="home-cta-content">
            <h2 className="home-cta-title">Are you a local artisan?</h2>
            <p className="home-cta-sub">Join hundreds of makers already selling on AfriCraft Rwanda — reach customers across the country.</p>
            <div className="home-cta-actions">
              <Link to="/register" className="btn primary">Start selling today</Link>
              <Link to="/contact"  className="btn" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}>Contact us</Link>
            </div>
          </div>
        </section>
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
