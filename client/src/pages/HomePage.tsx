import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchBestSellers, fetchNewArrivals } from '../services/products';
import { ProductCard, LoadingSkeleton } from '../components/ui';

const FEATURES = [
  { icon: '🎨', title: 'Verified artisans',   text: 'Every maker is spotlighted with story and origin.' },
  { icon: '🚚', title: 'Fast local delivery', text: 'Reliable delivery across Rwanda with tracking updates.' },
  { icon: '🔒', title: 'Secure checkout',     text: 'Choose mobile money or cash on delivery with ease.' },
];
const STATS = [
  { value: '500+',   label: 'Products' },
  { value: '150+',   label: 'Local artisans' },
  { value: '5,000+', label: 'Happy customers' },
  { value: '30',     label: 'Districts served' },
];
const COLLECTIONS = [
  { icon: '🏠', title: 'Home décor',  text: 'Warm, handcrafted pieces that bring soul to every room.',    to: '/products?category=Home+Decor' },
  { icon: '💎', title: 'Wearables',   text: 'Expressive accessories made with color, texture, and care.', to: '/products?category=Jewelry' },
  { icon: '🎁', title: 'Gifting',     text: 'Thoughtful gifts that feel personal and timeless.',           to: '/products?category=Gifts' },
];
const ARTISANS = [
  { name: 'Imani Nkurunziza', district: 'Kicukiro',  specialty: 'Basket weaving', bio: 'Crafting bold, contemporary baskets with heritage techniques.', img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=400&q=80' },
  { name: 'Grace Mukamana',   district: 'Muhanga',   specialty: 'Pottery',        bio: 'Creating earthy ceramics with texture and timeless form.',       img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80' },
  { name: 'Jean Bosco',       district: 'Nyagatare', specialty: 'Wood carving',   bio: 'Bringing sculptural energy to daily objects and decor.',          img: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=400&q=80' },
];
const TESTIMONIALS = [
  { name: 'Aline K.', quote: 'The basket I bought arrived beautifully packaged and feels truly special.' },
  { name: 'Eric M.',  quote: 'I found the perfect gift for my family and the checkout was effortless.' },
  { name: 'Mina R.',  quote: 'Wonderful to support local artisans while shopping from home.' },
];
const GALLERY = [
  { url: 'https://afrotidecrafts.com/wp-content/uploads/2024/07/Rwandese-Grass-Agaseke-Peace-basket.jpg',                                                                  label: 'Agaseke Peace Basket' },
  { url: 'https://rwandamart.rw/wp-content/uploads/2026/02/UKC-1-3.png',                                                                                                   label: 'Handwoven Sisal Basket' },
  { url: 'https://i.etsystatic.com/57769269/r/il/011fa6/7224459470/il_570xN.7224459470_4eq1.jpg',                                                                          label: 'Woven Wall Basket' },
  { url: 'https://trovewarehouse.com/cdn/shop/products/33024.jpg?v=1649348106&width=1080',                                                                                  label: 'Banana Fiber Basket' },
  { url: 'https://cdn.boeddha-beelden.com/wp-content/uploads/2024/02/Majestueuze-Gorilla-beeld-%E2%80%93-Winterhard-85cm-5.jpg',                                           label: 'Wooden Gorilla Sculpture' },
  { url: 'https://annakaytes.com/cdn/shop/files/IMG-7618.jpg',                                                                                                              label: 'Beaded Bracelet Set' },
  { url: 'https://i.etsystatic.com/35749210/r/il/755caa/7676774768/il_fullxfull.7676774768_gdce.jpg',                                                                      label: 'African Throw Pillow' },
  { url: 'https://www.jackalberry.co.za/jb/wp-content/uploads/2017/07/ChatGPT-Image-Oct-14-2025-at-11_38_49-AM.jpg',                                                      label: 'Leather Handbag' },
];
const FAQS = [
  { q: 'Do you ship outside Rwanda?',       a: 'Yes, we support select international deliveries for curated pieces.' },
  { q: 'Can I order custom artisan pieces?', a: 'Absolutely — contact us for bespoke and wholesale requests.' },
  { q: 'Is payment secure?',                a: 'Yes, our checkout supports secure mobile money and delivery options.' },
];

function ProductGrid({ items, loading }: { items: any[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={6} variant="card" />;
  if (!items.length) return <p className="small" style={{ marginTop: 12 }}>No products available right now.</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginTop: 14 }}>
      {items.map((item) => <ProductCard key={item._id} product={item} variant="home" />)}
    </div>
  );
}

export default function HomePage() {
  const [featured,    setFeatured]    = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showTop,     setShowTop]     = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [f, b, n] = await Promise.all([fetchFeaturedProducts(), fetchBestSellers(), fetchNewArrivals()]);
        if (!mounted) return;
        setFeatured(f.items || []);
        setBestSellers((b.items || []).slice(0, 6));
        setNewArrivals((n.items || []).slice(0, 6));
      } catch {}
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="container page">

      {/* ── Hero ── */}
      <section className="card classic-hero" style={{ padding: '40px 32px', overflow: 'hidden' }} aria-label="Hero">
        <div className="grid" style={{ alignItems: 'center', gap: 24 }}>
          <div className="col-8" style={{ padding: '0 6px' }}>
            <span className="badge classic-pill">🌿 Handcrafted in Rwanda</span>
            <h1 className="classic-title">A timeless collection of artisan treasures.</h1>
            <p className="classic-lead">
              Support local makers, discover meaningful gifts, and enjoy a beautifully simple shopping journey from browsing to delivery.
            </p>
            <div className="classic-cta-row">
              <Link to="/products"   className="btn primary">Browse products</Link>
              <Link to="/categories" className="btn">Explore categories</Link>
              <Link to="/register"   className="btn">Join free</Link>
            </div>
            <div className="classic-highlights">
              <span>🌿 Ethically made</span>
              <span>✨ Curated gifts</span>
              <span>🚚 Local delivery</span>
              <span>🔒 Secure checkout</span>
            </div>
          </div>
          <div className="col-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="classic-spotlight anim-scale-in">
              <div className="classic-spotlight-label">Featured this week</div>
              <div className="classic-spotlight-title">Basket weave collection</div>
              <p className="small" style={{ marginTop: 8 }}>Freshly sourced from Kigali artisans and styled for modern homes.</p>
              <Link to="/products" className="btn primary" style={{ marginTop: 14, width: '100%' }}>Shop now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="classic-feature-grid" aria-label="Features" style={{ marginTop: 20 }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`card classic-feature-card anim-slide-up delay-${i + 1}`}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{f.title}</div>
            <div className="small">{f.text}</div>
          </div>
        ))}
      </section>

      {/* ── Stats ── */}
      <section className="stat-grid" aria-label="Statistics">
        {STATS.map((s) => (
          <div key={s.label} className="card stat-card">
            <div className="stat-number">{s.value}</div>
            <div className="small">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Collections ── */}
      <section className="classic-collections" aria-label="Collections">
        {COLLECTIONS.map((c) => (
          <Link key={c.title} to={c.to} style={{ textDecoration: 'none' }}>
            <div className="card classic-collection-card" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{c.icon}</div>
              <div className="classic-collection-title">{c.title}</div>
              <div className="small" style={{ marginTop: 6 }}>{c.text}</div>
            </div>
          </Link>
        ))}
      </section>

      {/* ── New arrivals ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 24 }} aria-label="New arrivals">
        <div className="h1 classic-section-title">New arrivals</div>
        <p className="p">Fresh additions from Rwandan artisans — just landed.</p>
        <ProductGrid items={newArrivals} loading={loading} />
      </section>

      {/* ── Featured products ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="Featured products">
        <div className="h1 classic-section-title">Featured products</div>
        <p className="p">A handpicked selection of our finest artisan pieces.</p>
        <ProductGrid items={featured} loading={loading} />
      </section>

      {/* ── Best sellers ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="Best sellers">
        <div className="h1 classic-section-title">Best sellers</div>
        <p className="p">Most-loved products from artisans across Rwanda.</p>
        <ProductGrid items={bestSellers} loading={loading} />
      </section>

      {/* ── Artisans ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="Featured artisans">
        <div className="h1 classic-section-title">Featured artisans</div>
        <p className="p">Meet the makers behind the work and the stories that define each piece.</p>
        <div className="artisan-grid">
          {ARTISANS.map((a) => (
            <div key={a.name} className="card artisan-card">
              <img src={a.img} alt={a.name} loading="lazy" />
              <div style={{ fontWeight: 800 }}>{a.name}</div>
              <div className="small">{a.district} · {a.specialty}</div>
              <div className="small" style={{ marginTop: 6 }}>{a.bio}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="Customer reviews">
        <div className="h1 classic-section-title">What our customers say</div>
        <p className="p">Shoppers love the authentic stories, fast delivery, and quality craftsmanship.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 16 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card classic-testimonial-card">
              <div style={{ fontSize: 20, marginBottom: 8 }}>⭐⭐⭐⭐⭐</div>
              <div className="small" style={{ fontStyle: 'italic', marginBottom: 10 }}>"{t.quote}"</div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>— {t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="Gallery">
        <div className="h1 classic-section-title">Gallery</div>
        <p className="p">A glimpse into the tactile beauty of the artisan world.</p>
        <div className="gallery-grid" style={{ marginTop: 16 }}>
          {GALLERY.map((g) => (
            <div key={g.url} className="card gallery-card">
              <img src={g.url} alt={g.label} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="FAQ">
        <div className="h1 classic-section-title">Frequently asked questions</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          {FAQS.map((f) => (
            <div key={f.q} className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>❓ {f.q}</div>
              <div className="small">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="card classic-section-card" style={{ padding: 24, marginTop: 16 }} aria-label="Partners">
        <div className="h1 classic-section-title">Our partners</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
          {['Kigali Craft Hub', 'Rwanda Makers Collective', 'Artisan Export Lab', 'Heritage Market'].map((p) => (
            <span key={p} className="badge">{p}</span>
          ))}
        </div>
      </section>

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
