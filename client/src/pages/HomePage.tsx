import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchBestSellers, fetchNewArrivals } from '../services/products';

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [featuredData, bestData, newData] = await Promise.all([
          fetchFeaturedProducts(),
          fetchBestSellers(),
          fetchNewArrivals(),
        ]);
        if (!mounted) return;
        setFeatured(featuredData.items || []);
        setBestSellers((bestData.items || []).slice(0, 6));
        setNewArrivals((newData.items || []).slice(0, 6));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Unable to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container page">
      <div className="card classic-hero" style={{ padding: 28, overflow: 'hidden' }}>
        <div className="grid" style={{ alignItems: 'center' }}>
          <div className="col-8" style={{ padding: 6 }}>
            <div className="badge classic-pill">Handcrafted in Rwanda</div>
            <div className="h1 classic-title">A timeless collection of artisan treasures.</div>
            <p className="p classic-lead">
              Support local makers, discover meaningful gifts, and enjoy a beautifully simple shopping journey from browsing to delivery.
            </p>
            <div className="classic-cta-row">
              <Link to="/products" className="btn primary">
                Browse products
              </Link>
              <Link to="/cart" className="btn">
                Go to cart
              </Link>
              <Link to="/login" className="btn">
                Login
              </Link>
            </div>
            <div className="classic-highlights">
              <span>🌿 Ethically made</span>
              <span>✨ Curated gifts</span>
              <span>🚚 Local delivery</span>
            </div>
          </div>
          <div className="col-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="classic-spotlight">
              <div className="classic-spotlight-label">Featured this week</div>
              <div className="classic-spotlight-title">Basket weave collection</div>
              <div className="small" style={{ marginTop: 8 }}>Freshly sourced from Kigali artisans and styled for modern homes.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="classic-feature-grid">
        {[
          { title: 'Verified artisans', text: 'Every maker is spotlighted with story and origin.' },
          { title: 'Fast local delivery', text: 'Reliable delivery across Rwanda with tracking updates.' },
          { title: 'Secure checkout', text: 'Choose mobile money or cash on delivery with ease.' },
        ].map((item) => (
          <div key={item.title} className="card classic-feature-card">
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
            <div className="small">{item.text}</div>
          </div>
        ))}
      </div>

      <div className="stat-grid">
        {[
          { value: '500+', label: 'Products' },
          { value: '150+', label: 'Local artisans' },
          { value: '5,000+', label: 'Happy customers' },
          { value: '30', label: 'Districts served' },
        ].map((item) => (
          <div key={item.label} className="card stat-card">
            <div className="stat-number">{item.value}</div>
            <div className="small">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="classic-collections">
        {[
          { title: 'Home décor', text: 'Warm, handcrafted pieces that bring soul to every room.' },
          { title: 'Wearables', text: 'Expressive accessories made with color, texture, and care.' },
          { title: 'Gifting', text: 'Thoughtful gifts that feel personal and timeless.' },
        ].map((item) => (
          <div key={item.title} className="card classic-collection-card">
            <div className="classic-collection-title">{item.title}</div>
            <div className="small">{item.text}</div>
          </div>
        ))}
      </div>

      <div className="card classic-section-card" style={{ padding: 18, marginTop: 20 }}>
        <div className="h1 classic-section-title">Featured artisans</div>
        <p className="p">Meet the makers behind the work and the stories that define each piece.</p>
        <div className="artisan-grid">
          {[
            { name: 'Imani Nkurunziza', district: 'Kicukiro', specialty: 'Basket weaving', bio: 'Crafting bold, contemporary baskets with heritage techniques.', img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=400&q=80' },
            { name: 'Grace Mukamana', district: 'Muhanga', specialty: 'Pottery', bio: 'Creating earthy ceramics with texture and timeless form.', img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80' },
            { name: 'Jean Bosco', district: 'Nyagatare', specialty: 'Wood carving', bio: 'Bringing sculptural energy to daily objects and decor.', img: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=400&q=80' },
          ].map((artisan) => (
            <div key={artisan.name} className="card artisan-card">
              <img src={artisan.img} alt={artisan.specialty} />
              <div style={{ fontWeight: 800 }}>{artisan.name}</div>
              <div className="small">{artisan.district}</div>
              <div className="small" style={{ marginTop: 6 }}>{artisan.specialty}</div>
              <div className="small" style={{ marginTop: 8 }}>{artisan.bio}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
        <div className="card classic-section-card" style={{ padding: 18 }}>
          <div className="h1 classic-section-title">Stay in the loop</div>
          <p className="p">Get updates on new artisan arrivals, seasonal collections, and special offers.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <input className="input" type="email" placeholder="Enter your email" style={{ maxWidth: 280 }} />
            <button className="btn primary">Subscribe</button>
          </div>
        </div>

        <div className="card classic-section-card" style={{ padding: 18 }}>
          <div className="h1 classic-section-title">What our customers say</div>
          <p className="p">Shoppers love the authentic stories, fast delivery, and quality craftsmanship.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
            {[
              { name: 'Aline', quote: 'The basket I bought arrived beautifully packaged and feels truly special.' },
              { name: 'Eric', quote: 'I found the perfect gift for my family and the checkout was effortless.' },
              { name: 'Mina', quote: 'It is wonderful to support local artisans while shopping from home.' },
            ].map((item) => (
              <div key={item.name} className="card classic-testimonial-card">
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.name}</div>
                <div className="small">“{item.quote}”</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card classic-section-card" style={{ padding: 18 }}>
          <div className="h1 classic-section-title">New arrivals</div>
          <p className="p">Fresh additions from Rwandan artisans — just landed.</p>

          {newArrivals.length === 0 ? (
            <div className="small">New arrivals will appear here soon.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
              {newArrivals.map((item: any) => (
                <div key={item._id} className="card home-product-card">
                  <div className="classic-product-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span>✦</span>
                    )}
                  </div>
                  <div className="classic-product-body">
                    <div className="classic-product-name">{item.name}</div>
                    <div className="small">{item.category}</div>
                    <div className="classic-price">RWF {Number(item.price).toLocaleString()}</div>
                    <Link className="btn" to={`/products/${item._id}`}>View details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card classic-section-card" style={{ padding: 18 }}>
          <p className="p">A handpicked selection of our latest artisan pieces.</p>

          {loading ? (
            <div className="small">Loading featured products...</div>
          ) : error ? (
            <div className="small">{error}</div>
          ) : featured.length === 0 ? (
            <div className="small">No featured products available right now.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
              {featured.map((item: any) => (
                <div key={item._id} className="card home-product-card">
                  <div className="classic-product-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span>✦</span>
                    )}
                  </div>
                  <div className="classic-product-body">
                    <div className="classic-product-name">{item.name}</div>
                    <div className="small">{item.category}</div>
                    <div className="classic-price">RWF {Number(item.price).toLocaleString()}</div>
                    <Link className="btn" to={`/products/${item._id}`}>
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card classic-section-card" style={{ padding: 18 }}>
          <div className="h1 classic-section-title">Best sellers</div>
          <p className="p">Most-loved products from artisans across Rwanda.</p>

          {bestSellers.length === 0 ? (
            <div className="small">Best seller picks will appear here soon.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
              {bestSellers.map((item: any) => (
                <div key={item._id} className="card home-product-card">
                  <div className="classic-product-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span>✦</span>
                    )}
                  </div>
                  <div className="classic-product-body">
                    <div className="classic-product-name">{item.name}</div>
                    <div className="small">{item.category}</div>
                    <div className="classic-price">RWF {Number(item.price).toLocaleString()}</div>
                    <Link className="btn" to={`/products/${item._id}`}>View details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card classic-section-card" style={{ padding: 18, marginTop: 20 }}>
        <div className="h1 classic-section-title">Limited-time offers</div>
        <p className="p">Seasonal picks and artisan bundles available for a short window.</p>
        <div className="classic-feature-grid" style={{ marginTop: 12 }}>
          {[
            { title: 'Festival basket bundle', text: 'Save 15% on curated basket sets.' },
            { title: 'Handmade gift box', text: 'Complimentary wrapping on selected gifts.' },
            { title: 'Early access to new arrivals', text: 'Join the newsletter for first access.' },
          ].map((offer) => (
            <div key={offer.title} className="card classic-feature-card">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{offer.title}</div>
              <div className="small">{offer.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card classic-section-card" style={{ padding: 18, marginTop: 20 }}>
        <div className="h1 classic-section-title">Frequently asked questions</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {[
            { question: 'Do you ship outside Rwanda?', answer: 'Yes, we support select international deliveries for curated pieces.' },
            { question: 'Can I order custom artisan pieces?', answer: 'Absolutely — contact us for bespoke and wholesale requests.' },
            { question: 'Is payment secure?', answer: 'Yes, our checkout supports secure mobile money and delivery options.' },
          ].map((faq) => (
            <div key={faq.question} className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 800 }}>{faq.question}</div>
              <div className="small" style={{ marginTop: 6 }}>{faq.answer}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card classic-section-card" style={{ padding: 18, marginTop: 20 }}>
        <div className="h1 classic-section-title">Gallery</div>
        <p className="p">A glimpse into the tactile beauty of the artisan world.</p>
        <div className="gallery-grid">
          {[
            { url: 'https://afrotidecrafts.com/wp-content/uploads/2024/07/Rwandese-Grass-Agaseke-Peace-basket.jpg', label: 'Agaseke Peace Basket' },
            { url: 'https://rwandamart.rw/wp-content/uploads/2026/02/UKC-1-3.png', label: 'Handwoven Sisal Basket' },
            { url: 'https://i.etsystatic.com/57769269/r/il/011fa6/7224459470/il_570xN.7224459470_4eq1.jpg', label: 'Decorative Woven Wall Basket' },
            { url: 'https://trovewarehouse.com/cdn/shop/products/33024.jpg?v=1649348106&width=1080', label: 'Banana Fiber Basket' },
            { url: 'https://cdn.boeddha-beelden.com/wp-content/uploads/2024/02/Majestueuze-Gorilla-beeld-%E2%80%93-Winterhard-85cm-5.jpg', label: 'Wooden Gorilla Sculpture' },
            { url: 'https://annakaytes.com/cdn/shop/files/IMG-7618.jpg', label: 'Beaded Bracelet Set' },
            { url: 'https://i.etsystatic.com/35749210/r/il/755caa/7676774768/il_fullxfull.7676774768_gdce.jpg', label: 'African Throw Pillow Cover' },
            { url: 'https://www.jackalberry.co.za/jb/wp-content/uploads/2017/07/ChatGPT-Image-Oct-14-2025-at-11_38_49-AM.jpg', label: 'Leather Handbag' },
          ].map((item) => (
            <div key={item.url} className="card gallery-card">
              <img src={item.url} alt={item.label} />
            </div>
          ))}
        </div>
      </div>

      <div className="card classic-section-card" style={{ padding: 18, marginTop: 20 }}>
        <div className="h1 classic-section-title">Stay updated</div>
        <p className="p">Subscribe for new handmade collections, limited releases, and artisan stories.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <input className="input" type="email" placeholder="Email address" style={{ maxWidth: 280 }} />
          <button className="btn primary">Subscribe</button>
        </div>
      </div>

      <div className="card classic-section-card" style={{ padding: 18, marginTop: 20 }}>
        <div className="h1 classic-section-title">Sample partners</div>
        <p className="p">Demo partner marks shown for the presentation experience.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          {['Kigali Craft Hub', 'Rwanda Makers Collective', 'Artisan Export Lab', 'Heritage Market'].map((partner) => (
            <div key={partner} className="badge">{partner}</div>
          ))}
        </div>
      </div>

      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>

      <footer className="card classic-footer" style={{ marginTop: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800 }}>DellCraft Rwanda</div>
            <div className="small" style={{ marginTop: 6 }}>Authentic handmade goods from Rwanda.</div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/products" className="small">Products</Link>
            <Link to="/categories" className="small">Categories</Link>
            <Link to="/login" className="small">Login</Link>
          </div>
          <div className="small">hello@dellcraft.rw</div>
        </div>
      </footer>
    </div>
  );
}

