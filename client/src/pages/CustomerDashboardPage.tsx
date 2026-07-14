import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { fetchMyOrders } from '../services/orders';
import { fetchWishlist, removeWishlist } from '../services/wishlist';
import { fetchProfile, updateProfile, changePassword } from '../services/user';
import { fetchProductById } from '../services/products';
import { getAuthPayload } from '../services/api';

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

const STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  pending:          { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
  confirmed:        { bg: '#eff6ff', color: '#1d4ed8', label: 'Confirmed' },
  paid:             { bg: '#f0fdf4', color: '#15803d', label: 'Paid' },
  processing:       { bg: '#f5f3ff', color: '#7c3aed', label: 'Processing' },
  packed:           { bg: '#fef3c7', color: '#b45309', label: 'Packed' },
  shipped:          { bg: '#ecfeff', color: '#0891b2', label: 'Shipped' },
  out_for_delivery: { bg: '#fff7ed', color: '#ea580c', label: 'Out for Delivery' },
  delivered:        { bg: '#f0fdf4', color: '#15803d', label: 'Delivered' },
  completed:        { bg: '#f0fdf4', color: '#15803d', label: 'Completed' },
  cancelled:        { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

type Tab = 'overview' | 'orders' | 'wishlist' | 'profile';

export default function CustomerDashboardPage() {
  return <RequireAuth><Dashboard /></RequireAuth>;
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const payload = getAuthPayload();
  const initials = payload?.name
    ? payload.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="cust-dash">
      {/* Sidebar */}
      <aside className="cust-sidebar">
        <div className="cust-sidebar-profile">
          <div className="cust-avatar">{initials}</div>
          <div>
            <div className="cust-sidebar-name">{payload?.name || 'My Account'}</div>
            <div className="cust-sidebar-role">Customer</div>
          </div>
        </div>
        <nav className="cust-nav">
          {([
            { id: 'overview', icon: '🏠', label: 'Overview' },
            { id: 'orders',   icon: '📦', label: 'My Orders' },
            { id: 'wishlist', icon: '❤️', label: 'Wishlist' },
            { id: 'profile',  icon: '👤', label: 'Profile' },
          ] as { id: Tab; icon: string; label: string }[]).map(item => (
            <button
              key={item.id}
              className={`cust-nav-item${tab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="cust-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="cust-sidebar-footer">
          <Link to="/products" className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
            🛍️ Browse Products
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="cust-main">
        {tab === 'overview'  && <OverviewTab  setTab={setTab} />}
        {tab === 'orders'    && <OrdersTab />}
        {tab === 'wishlist'  && <WishlistTab />}
        {tab === 'profile'   && <ProfileTab />}
      </main>
    </div>
  );
}

/* ─── Overview ─────────────────────────────────────────────── */
function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [wCount,  setWCount]  = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMyOrders().then(d => setOrders(d.orders || [])),
      fetchWishlist().then(d => setWCount((d.items || []).length)),
    ]).finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total || 0), 0);
  const recent = orders.slice(0, 3);

  return (
    <div className="cust-section">
      <div className="cust-section-title">Overview</div>

      {/* KPI row */}
      <div className="cust-kpi-row">
        <div className="cust-kpi">
          <div className="cust-kpi-value">{loading ? '—' : orders.length}</div>
          <div className="cust-kpi-label">Total Orders</div>
        </div>
        <div className="cust-kpi">
          <div className="cust-kpi-value">{loading ? '—' : orders.filter(o => o.status === 'delivered' || o.status === 'completed').length}</div>
          <div className="cust-kpi-label">Delivered</div>
        </div>
        <div className="cust-kpi">
          <div className="cust-kpi-value">{loading ? '—' : wCount}</div>
          <div className="cust-kpi-label">Wishlist Items</div>
        </div>
        <div className="cust-kpi">
          <div className="cust-kpi-value">{loading ? '—' : `RWF ${totalSpent.toLocaleString()}`}</div>
          <div className="cust-kpi-label">Total Spent</div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="cust-card">
        <div className="cust-card-header">
          <span>Recent Orders</span>
          <button className="cust-link" onClick={() => setTab('orders')}>View all →</button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="cust-empty">
            <span>📦</span>
            <p>No orders yet. <Link to="/products">Start shopping</Link></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {recent.map(o => <OrderRow key={o._id} order={o} />)}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="cust-quick-actions">
        <Link to="/products" className="cust-action-card">
          <span>🛍️</span><span>Browse Products</span>
        </Link>
        <button className="cust-action-card" onClick={() => setTab('wishlist')}>
          <span>❤️</span><span>My Wishlist</span>
        </button>
        <Link to="/cart" className="cust-action-card">
          <span>🛒</span><span>View Cart</span>
        </Link>
        <button className="cust-action-card" onClick={() => setTab('profile')}>
          <span>👤</span><span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Orders tab ────────────────────────────────────────────── */
function OrdersTab() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrders()
      .then(d => setOrders(d.orders || []))
      .catch(e => setError(e?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cust-section">
      <div className="cust-section-title">My Orders</div>
      {error && <div className="auth-error">⚠️ {error}</div>}
      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="cust-empty large">
          <span>📦</span>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {orders.map(o => (
            <div key={o._id} className="cust-order-card" onClick={() => navigate(`/orders/${o._id}`)}>
              <div className="cust-order-meta">
                <div className="cust-order-id">#{String(o._id).slice(-8).toUpperCase()}</div>
                <div className="cust-order-date">
                  {new Date(o.createdAt).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Item thumbnails */}
              <div className="cust-order-thumbs">
                {(o.items || []).slice(0, 4).map((item: any, idx: number) => (
                  <div key={idx} className="cust-order-thumb">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} />
                      : <span>🛍️</span>}
                  </div>
                ))}
                {(o.items?.length || 0) > 4 && (
                  <div className="cust-order-thumb more">+{o.items.length - 4}</div>
                )}
              </div>

              <div className="cust-order-right">
                <OrderStatusBadge status={o.status} />
                <div className="cust-order-total">RWF {Number(o.total).toLocaleString()}</div>
                <span className="cust-order-arrow">›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Wishlist tab ──────────────────────────────────────────── */
function WishlistTab() {
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
    Promise.all(
      items.map(i => fetchProductById(i.productId).then(d => [i.productId, d.item]).catch(() => [i.productId, null]))
    ).then(entries => {
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

  function onAddToCart(productId: string, name: string) {
    addToCart(productId);
    showToast(`${name} added to cart!`);
  }

  return (
    <div className="cust-section">
      {toast && (
        <div className="admin-toast success" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          ✅ {toast}
        </div>
      )}
      <div className="cust-section-title">
        Wishlist <span className="cust-count-pill">{items.length}</span>
      </div>

      {loading ? (
        <div className="cust-wishlist-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 14 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="cust-empty large">
          <span>❤️</span>
          <p>Your wishlist is empty. Save items you love!</p>
          <Link to="/products" className="btn primary">Browse Products</Link>
        </div>
      ) : (
        <div className="cust-wishlist-grid">
          {items.map(item => {
            const p = products[item.productId];
            return (
              <div key={item.productId} className="cust-wish-card">
                <Link to={`/products/${item.productId}`} className="cust-wish-img-wrap">
                  {p?.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="cust-wish-img" />
                    : <div className="cust-wish-img-placeholder">🛍️</div>}
                  {p?.badge && <span className="cust-wish-badge">{p.badge}</span>}
                </Link>
                <div className="cust-wish-body">
                  <Link to={`/products/${item.productId}`} className="cust-wish-name">
                    {p?.name || 'Loading…'}
                  </Link>
                  <div className="cust-wish-category">{p?.category || ''}</div>
                  <div className="cust-wish-price">RWF {p ? Number(p.price).toLocaleString() : '—'}</div>
                  <div style={{ fontSize: 12, marginBottom: 10 }}>
                    {p?.stock === 0
                      ? <span style={{ color: '#dc2626' }}>Out of stock</span>
                      : <span style={{ color: '#15803d' }}>✓ In stock ({p?.stock})</span>}
                  </div>
                  <div className="cust-wish-actions">
                    <button
                      className="btn primary"
                      style={{ flex: 1, fontSize: 12 }}
                      disabled={!p || p.stock === 0}
                      onClick={() => onAddToCart(item.productId, p?.name || 'Item')}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '8px 12px', color: '#dc2626', borderColor: 'rgba(220,38,38,.3)' }}
                      onClick={() => onRemove(item.productId)}
                      title="Remove"
                    >
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

/* ─── Profile tab ───────────────────────────────────────────── */
function ProfileTab() {
  const [form,    setForm]    = useState({ fullName: '', email: '', phone: '', address: '', bio: '', profilePhoto: '' });
  const [pwForm,  setPwForm]  = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(d => setForm({
        fullName: d.user.fullName || '', email: d.user.email || '',
        phone: d.user.phone || '', address: d.user.address || '',
        bio: d.user.bio || '', profilePhoto: d.user.profilePhoto || '',
      }))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ fullName: form.fullName, phone: form.phone, address: form.address, bio: form.bio, profilePhoto: form.profilePhoto });
      setForm(f => ({ ...f, ...res.user }));
      showToast('Profile updated ✓');
    } catch (err: any) { showToast(err?.message || 'Failed to update', 'error'); }
    finally { setSaving(false); }
  }

  async function onChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (pwForm.newPassword.length < 6) { showToast('Min 6 characters', 'error'); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed ✓');
    } catch (err: any) { showToast(err?.message || 'Failed to change password', 'error'); }
    finally { setPwSaving(false); }
  }

  const initials = form.fullName ? form.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';

  if (loading) return (
    <div style={{ display: 'grid', gap: 12 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />)}
    </div>
  );

  return (
    <div className="cust-section">
      {toast && (
        <div className={`admin-toast ${toast.type}`} style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      <div className="cust-section-title">Profile Settings</div>

      {/* Avatar row */}
      <div className="cust-profile-hero">
        <div className="cust-avatar large">{initials}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{form.fullName || 'Your name'}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{form.email}</div>
        </div>
      </div>

      <form onSubmit={onSave} className="cust-card" style={{ marginBottom: 20 }}>
        <div className="cust-card-header"><span>Personal Information</span></div>
        <div className="cust-form-grid">
          <div className="admin-field">
            <label>Full Name</label>
            <input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Your full name" />
          </div>
          <div className="admin-field">
            <label>Email</label>
            <input className="input" value={form.email} disabled style={{ opacity: .6 }} />
          </div>
          <div className="admin-field">
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" type="tel" />
          </div>
          <div className="admin-field">
            <label>Delivery Address</label>
            <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, district, Kigali" />
          </div>
        </div>
        <div className="admin-field" style={{ marginTop: 4 }}>
          <label>Bio</label>
          <textarea className="input admin-textarea" rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A short bio…" />
        </div>
        <button className="btn primary" type="submit" disabled={saving} style={{ marginTop: 12, maxWidth: 180 }}>
          {saving ? 'Saving…' : '💾 Save Changes'}
        </button>
      </form>

      <form onSubmit={onChangePw} className="cust-card">
        <div className="cust-card-header"><span>Change Password</span></div>
        <div style={{ display: 'grid', gap: 14, maxWidth: 440, marginTop: 4 }}>
          <div className="admin-field">
            <label>Current Password</label>
            <input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Current password" />
          </div>
          <div className="admin-field">
            <label>New Password</label>
            <input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 6 characters" />
          </div>
          <div className="admin-field">
            <label>Confirm New Password</label>
            <input className="input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" />
          </div>
        </div>
        <button className="btn primary" type="submit" disabled={pwSaving} style={{ marginTop: 12, maxWidth: 180 }}>
          {pwSaving ? 'Updating…' : '🔑 Update Password'}
        </button>
      </form>
    </div>
  );
}

/* ─── Shared sub-components ─────────────────────────────────── */
function OrderStatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}40`,
      borderRadius: 999, padding: '3px 10px',
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

function OrderRow({ order }: { order: any }) {
  const navigate = useNavigate();
  return (
    <div className="cust-order-card" onClick={() => navigate(`/orders/${order._id}`)}>
      <div className="cust-order-meta">
        <div className="cust-order-id">#{String(order._id).slice(-8).toUpperCase()}</div>
        <div className="cust-order-date">
          {new Date(order.createdAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div className="cust-order-thumbs">
        {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
          <div key={idx} className="cust-order-thumb">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>🛍️</span>}
          </div>
        ))}
      </div>
      <div className="cust-order-right">
        <OrderStatusBadge status={order.status} />
        <div className="cust-order-total">RWF {Number(order.total).toLocaleString()}</div>
        <span className="cust-order-arrow">›</span>
      </div>
    </div>
  );
}
