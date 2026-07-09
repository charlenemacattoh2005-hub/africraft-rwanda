import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuthToken, getAuthPayload } from '../services/api';
import { logout } from '../services/auth';

const CART_KEY = 'africraft_cart_v1';
function getCartCount() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.reduce((s: number, l: any) => s + (l.quantity || 0), 0) : 0;
  } catch { return 0; }
}

const NAV_LINKS = [
  { to: '/products',   label: 'Shop',       icon: '🛍️' },
  { to: '/categories', label: 'Categories', icon: '📂' },
  { to: '/contact',    label: 'Contact',    icon: '📞' },
];

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 38 38" fill="none" aria-hidden="true">
    <circle cx="19" cy="19" r="19" fill="#8b5e3c"/>
    <ellipse cx="19" cy="22" rx="11" ry="6" fill="#c89f65" stroke="#fff8ee" strokeWidth="0.8"/>
    <ellipse cx="19" cy="19" rx="11" ry="6" fill="#a0703a" stroke="#fff8ee" strokeWidth="0.8"/>
    <ellipse cx="19" cy="16" rx="8"  ry="4" fill="#c89f65" stroke="#fff8ee" strokeWidth="0.8"/>
    <ellipse cx="19" cy="13.5" rx="5" ry="2.5" fill="#a0703a" stroke="#fff8ee" strokeWidth="0.8"/>
    <path d="M16 13.5 Q19 8 22 13.5" stroke="#fff8ee" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = getAuthToken();
  const payload   = getAuthPayload();
  const role      = payload?.role;
  const isAdmin   = role === 'admin';
  const isVendor  = role === 'vendor';
  const isRider   = role === 'rider';

  const [menuOpen,  setMenuOpen]  = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [scrolled,  setScrolled]  = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Cart count polling
  useEffect(() => {
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener('storage', onStorage);
    const id = setInterval(() => setCartCount(getCartCount()), 800);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(id); };
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  function onLogout() { logout(); navigate('/'); }

  const isActive = (path: string) =>
    path === '/products'
      ? location.pathname.startsWith('/products')
      : location.pathname === path;

  // Which dashboard to link to based on role
  const dashboardLink = isAdmin ? '/admin' : isVendor ? '/vendor' : isRider ? '/rider' : null;
  const dashboardLabel = isAdmin ? 'Admin' : isVendor ? 'Vendor' : isRider ? 'Rider' : null;

  return (
    <div className="site-wrapper">

      {/* Announce bar */}
      <div className="announce-bar" role="banner">
        🌿 Free delivery on orders over RWF 20,000 &nbsp;·&nbsp; Authentic Rwandan crafts &nbsp;·&nbsp; Support local artisans
      </div>

      {/* Skip to main content */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Main nav */}
      <header className={`nav${scrolled ? ' nav-scrolled' : ''}`} ref={menuRef}>
        <div className="container navInner">

          {/* Brand */}
          <Link to="/" className="brand" aria-label="AfriCraft Rwanda home">
            <div className="logo-wrap"><Logo /></div>
            <span className="brand-name">AfriCraft Rwanda</span>
          </Link>

          {/* Desktop links */}
          <nav className="desktop-menu" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={`nav-link${isActive(to) ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="nav-actions">
            {!token ? (
              <>
                <Link to="/login"    className="nav-link hide-sm">Sign in</Link>
                <Link to="/register" className="btn primary nav-cta">Get started</Link>
              </>
            ) : (
              <>
                <Link to="/wishlist" className="nav-icon-btn hide-sm" aria-label="Wishlist">
                  <span aria-hidden="true">♡</span>
                </Link>
                <Link to="/orders"   className="nav-icon-btn hide-sm" aria-label="My orders">
                  <span aria-hidden="true">📦</span>
                </Link>
                {dashboardLink && (
                  <Link to={dashboardLink} className="nav-link hide-sm" style={{
                    background: 'rgba(194,65,12,.1)', color: '#c2410c',
                    border: '1px solid rgba(194,65,12,.2)', borderRadius: 8,
                    padding: '5px 12px', fontSize: 12, fontWeight: 700,
                  }}>
                    {dashboardLabel}
                  </Link>
                )}
                <Link to="/profile"  className="nav-icon-btn hide-sm" aria-label="My profile">
                  <span aria-hidden="true">👤</span>
                </Link>
                <button className="nav-logout hide-sm" onClick={onLogout} aria-label="Sign out">
                  Logout
                </button>
              </>
            )}

            <Link to="/cart" className="cart-btn" aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}>
              <span aria-hidden="true">🛒</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className={`ham-line${menuOpen ? ' open' : ''}`}/>
              <span className={`ham-line${menuOpen ? ' open' : ''}`}/>
              <span className={`ham-line${menuOpen ? ' open' : ''}`}/>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu" role="dialog" aria-label="Mobile navigation" aria-modal="true">
            <div className="mobile-menu-inner">
              <div className="mob-section-label">Shop</div>
              {NAV_LINKS.map(({ to, label, icon }) => (
                <Link key={to} to={to} className={`mob-link${isActive(to) ? ' active' : ''}`}>
                  {icon} {label}
                </Link>
              ))}
              <Link to="/cart" className="mob-link">
                🛒 Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/wishlist" className="mob-link">♡ Wishlist</Link>

              <div className="mob-divider"/>

              {!token ? (
                <>
                  <div className="mob-section-label">Account</div>
                  <Link to="/login"    className="mob-link">🔑 Sign in</Link>
                  <Link to="/register" className="mob-link mob-link-primary">✨ Create account</Link>
                </>
              ) : (
                <>
                  <div className="mob-section-label">My Account</div>
                  <Link to="/profile" className="mob-link">👤 My Profile</Link>
                  <Link to="/orders"  className="mob-link">📦 My Orders</Link>
                  {dashboardLink && (
                    <>
                      <div className="mob-divider"/>
                      <div className="mob-section-label">{dashboardLabel} Panel</div>
                      <Link to={dashboardLink} className="mob-link">⚙️ Dashboard</Link>
                    </>
                  )}
                  <div className="mob-divider"/>
                  <button className="mob-link mob-logout" onClick={onLogout}>🚪 Sign out</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="main-content" id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer className="site-footer" aria-label="Site footer">
        <div className="container">
          <div className="footer-grid">

            {/* Brand */}
            <div>
              <Link to="/" className="footer-brand" aria-label="AfriCraft Rwanda home">
                <svg width="28" height="28" viewBox="0 0 38 38" fill="none" aria-hidden="true">
                  <circle cx="19" cy="19" r="19" fill="#8b5e3c"/>
                  <ellipse cx="19" cy="22" rx="11" ry="6" fill="#c89f65" stroke="#fff8ee" strokeWidth="0.8"/>
                  <ellipse cx="19" cy="19" rx="11" ry="6" fill="#a0703a" stroke="#fff8ee" strokeWidth="0.8"/>
                  <ellipse cx="19" cy="16" rx="8"  ry="4" fill="#c89f65" stroke="#fff8ee" strokeWidth="0.8"/>
                </svg>
                <span>AfriCraft Rwanda</span>
              </Link>
              <p className="footer-tagline">
                Authentic handmade goods from Rwanda's finest artisans. Every purchase supports a local maker.
              </p>
              <div className="footer-socials">
                <a href="#" className="social-btn" aria-label="Facebook">📘</a>
                <a href="#" className="social-btn" aria-label="Instagram">📸</a>
                <a href="#" className="social-btn" aria-label="Twitter">🐦</a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <div className="footer-col-title">Shop</div>
              <nav className="footer-links" aria-label="Shop links">
                <Link to="/products">All Products</Link>
                <Link to="/products?featured=true">Featured</Link>
                <Link to="/categories">Categories</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/cart">Cart</Link>
              </nav>
            </div>

            {/* Account */}
            <div>
              <div className="footer-col-title">Account</div>
              <nav className="footer-links" aria-label="Account links">
                <Link to="/login">Sign In</Link>
                <Link to="/register">Register</Link>
                <Link to="/orders">My Orders</Link>
                <Link to="/profile">Profile</Link>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <div className="footer-col-title">Contact</div>
              <address className="footer-links" style={{ fontStyle: 'normal' }}>
                <a href="mailto:hello@africraft.rw">hello@africraft.rw</a>
                <a href="tel:+250794049090">+250 794 049 090</a>
                <Link to="/contact">Contact Us</Link>
                <span>Kigali, Rwanda</span>
              </address>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} AfriCraft Rwanda. All rights reserved.</span>
            <div className="footer-badges">
              <span className="footer-badge">🔒 Secure</span>
              <span className="footer-badge">🌿 Ethical</span>
              <span className="footer-badge">🇷🇼 Made in Rwanda</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
