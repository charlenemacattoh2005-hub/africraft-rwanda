import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import ImageUpload from '../components/ImageUpload';
import {
  fetchVendorStats, fetchVendorProducts, createVendorProduct,
  updateVendorProduct, deleteVendorProduct, fetchVendorOrders, fetchVendorPayout,
} from '../services/admin';
import { getAuthPayload } from '../services/api';

export default function VendorDashboardPage() {
  return (
    <RequireAuth roles={['vendor', 'admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const CATEGORIES = ['Baskets','Paintings','Wood Carvings','Kitchen','Jewelry','Pottery','Home Décor','Bags','Gifts','Games','Storage','Musical Instruments'];
const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: CATEGORIES[0], imageUrl: '', badge: '', featured: false, discountPrice: '' };

const STATUS_COLORS: Record<string, string> = {
  pending: '#d97706', confirmed: '#1d4ed8', paid: '#6366f1',
  shipped: '#0891b2', completed: '#15803d', cancelled: '#dc2626', delivered: '#22c55e',
};

function ProductModal({ title, form, setForm, onSave, onClose, saving }: {
  title: string; form: any; setForm: (f: any) => void;
  onSave: () => void; onClose: () => void; saving: boolean;
}) {
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal admin-modal-wide">
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-modal-col">
            <div className="admin-field"><label>Product Name *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Agaseke Peace Basket" />
            </div>
            <div className="admin-field"><label>Description *</label>
              <textarea className="input admin-textarea" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your product…" />
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field"><label>Price (RWF) *</label>
                <input className="input" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45000" />
              </div>
              <div className="admin-field"><label>Sale Price (RWF)</label>
                <input className="input" type="number" min="0" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field"><label>Stock *</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="50" />
              </div>
              <div className="admin-field"><label>Badge</label>
                <input className="input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. New Arrival" />
              </div>
            </div>
            <div className="admin-field"><label>Category *</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field"><label>Product Image</label>
              <ImageUpload
                value={form.imageUrl}
                onChange={url => setForm({ ...form, imageUrl: url })}
                label="Product image"
              />
            </div>
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
              Request featured on homepage
            </label>
          </div>
          <div className="admin-modal-preview">
            <div className="admin-preview-label">Preview</div>
            {form.imageUrl
              ? <img src={form.imageUrl} alt="preview" className="admin-preview-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              : <div className="admin-preview-placeholder">🛍️<br /><span>No image</span></div>}
            <div className="admin-preview-name">{form.name || 'Product name'}</div>
            <div className="admin-preview-price">{form.price ? `RWF ${Number(form.price).toLocaleString()}` : 'RWF —'}</div>
            <div className="admin-preview-meta">
              <span className="admin-preview-cat">{form.category}</span>
              {form.badge && <span className="admin-preview-badge">{form.badge}</span>}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#d97706', background: '#fef3c7', padding: '4px 10px', borderRadius: 6 }}>
              ⏳ Pending admin approval
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Submit Product'}</button>
        </div>
      </div>
    </div>
  );
}

type Tab = 'dashboard' | 'products' | 'orders' | 'analytics';

function Inner() {
  const location = useLocation();

  // Sync tab from URL path: /vendor/products → products tab, etc.
  const getTabFromPath = (): Tab => {
    if (location.pathname.includes('/products')) return 'products';
    if (location.pathname.includes('/orders'))   return 'orders';
    if (location.pathname.includes('/analytics'))return 'analytics';
    return 'dashboard';
  };

  const [tab,       setTab]       = useState<Tab>(getTabFromPath);
  const [stats,     setStats]     = useState<any>(null);
  const [payout,    setPayout]    = useState<any>(null);
  const [products,  setProducts]  = useState<any[]>([]);
  const [orders,    setOrders]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [creating,  setCreating]  = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState<any>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const payload    = getAuthPayload();
  const vendorName = payload?.name || payload?.email || 'Vendor';

  // Keep tab in sync when sidebar nav links change the URL
  useEffect(() => { setTab(getTabFromPath()); }, [location.pathname]);

  // Load all vendor data on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchVendorStats(),
      fetchVendorProducts(),
      fetchVendorOrders(),
      fetchVendorPayout(),
    ])
      .then(([s, pd, od, py]) => {
        setStats(s);
        setProducts(pd.products || []);
        setOrders(od.orders || []);
        setPayout(py);
      })
      .catch(e => setError(e?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setCreating(true);
  }

  function openEdit(p: any) {
    setForm({
      ...EMPTY_FORM,
      ...p,
      price:         String(p.price ?? ''),
      stock:         String(p.stock ?? ''),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : '',
    });
    setEditing(p);
  }

  async function onSaveCreate() {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock) {
      showToast('Name, description, price and stock are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        stock:         Number(form.stock),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      };
      const res = await createVendorProduct(payload);
      if (res.product) {
        setProducts(p => [res.product, ...p]);
        setCreating(false);
        showToast('Product submitted for admin review ✓');
      } else {
        showToast(res.message || 'Failed to create product', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function onSaveEdit() {
    if (!editing) return;
    if (!form.name.trim() || !form.price || !form.stock) {
      showToast('Name, price and stock are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        stock:         Number(form.stock),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      };
      const res = await updateVendorProduct(editing._id, payload);
      if (res.product) {
        setProducts(p => p.map(x => x._id === editing._id ? res.product : x));
        setEditing(null);
        showToast('Product updated ✓');
      } else {
        showToast(res.message || 'Failed to update', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteVendorProduct(id);
      setProducts(p => p.filter(x => x._id !== id));
      showToast('Product deleted');
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(null);
    }
  }

  // Derived values — prefer real payout data, fall back to stats
  const totalRevenue   = payout?.grossRevenue  ?? stats?.totalRevenue  ?? 0;
  const netEarnings    = payout?.netEarnings   ?? totalRevenue * 0.85;
  const platformFee    = payout?.platformFee   ?? totalRevenue * 0.15;
  const feePercent     = payout?.platformFeePercent ?? 15;
  const orderCount     = payout?.orderCount    ?? stats?.orderCount    ?? 0;
  const pendingOrders  = payout?.pendingOrders ?? stats?.pendingOrders ?? 0;
  const productCount   = stats?.productCount   ?? products.length;
  const activeProducts = products.filter(p => p.isActive).length;

  const kpis = [
    { icon: '💰', label: 'Gross Revenue',   value: `RWF ${Number(totalRevenue).toLocaleString()}`,  color: '#c2410c' },
    { icon: '💵', label: 'Net Earnings',    value: `RWF ${Number(netEarnings).toLocaleString()}`,   color: '#15803d' },
    { icon: '📦', label: 'Total Orders',    value: String(orderCount),                              color: '#1d4ed8' },
    { icon: '⏳', label: 'Pending Orders',  value: String(pendingOrders),                           color: '#d97706' },
    { icon: '🛍️', label: 'Products Listed', value: String(productCount),                            color: '#7c3aed' },
    { icon: '✅', label: 'Active Listings', value: String(activeProducts),                          color: '#0891b2' },
  ];

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'dashboard', icon: '⊞',  label: 'Dashboard'   },
    { key: 'products',  icon: '📦',  label: 'My Products' },
    { key: 'orders',    icon: '🧾',  label: 'My Orders'   },
    { key: 'analytics', icon: '📈',  label: 'Analytics'   },
  ];

  return (
    <>
      <div className="accent-bar" />

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Modals */}
      {creating && <ProductModal title="Add New Product" form={form} setForm={setForm} onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} />}
      {editing  && <ProductModal title="Edit Product"    form={form} setForm={setForm} onSave={onSaveEdit}   onClose={() => setEditing(null)}   saving={saving} />}

      {/* Store profile card */}
      <div className="vendor-store-card">
        <div className="vendor-store-avatar">{vendorName[0]?.toUpperCase()}</div>
        <div className="vendor-store-info">
          <div className="vendor-store-name">{vendorName}'s Store</div>
          <div className="vendor-store-meta">{products.length} product{products.length !== 1 ? 's' : ''} · {orderCount} order{orderCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="vendor-store-actions">
          <button className="btn primary" onClick={openCreate}>＋ Add Product</button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="admin-error-banner" role="alert">
          ⚠️ {error}
          <button
            onClick={() => { setError(null); setLoading(true); Promise.all([fetchVendorStats(), fetchVendorProducts(), fetchVendorOrders(), fetchVendorPayout()]).then(([s,pd,od,py]) => { setStats(s); setProducts(pd.products||[]); setOrders(od.orders||[]); setPayout(py); }).catch(e => setError(e?.message||'Failed')).finally(() => setLoading(false)); }}
            style={{ marginLeft: 12, fontWeight: 700, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Payout card — uses real server data */}
      <div className="vendor-payout-card">
        <div className="vendor-payout-label">Available Balance</div>
        <div className="vendor-payout-amount">
          {loading ? '—' : `RWF ${Number(netEarnings).toLocaleString()}`}
        </div>
        <div className="vendor-payout-sub">
          After {feePercent}% platform fee · Gross: RWF {Number(totalRevenue).toLocaleString()} · {orderCount} orders
        </div>
        <button className="vendor-payout-btn">💳 Request Payout</button>
      </div>

      {/* Tab bar */}
      <div className="vendor-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`vendor-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />}

      {/* ── Dashboard tab ── */}
      {!loading && tab === 'dashboard' && (
        <>
          <div className="vendor-kpi-row">
            {kpis.map(k => (
              <div key={k.label} className="vendor-kpi">
                <div className="vendor-kpi-icon">{k.icon}</div>
                <div className="vendor-kpi-val" style={{ color: k.color }}>{k.value}</div>
                <div className="vendor-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <span className="dash-panel-title">🕐 Recent Orders</span>
              <button className="dash-panel-link" onClick={() => setTab('orders')}>View all</button>
            </div>
            <div className="dash-panel-body">
              {orders.length === 0 ? (
                <div className="dash-panel-empty">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  No orders yet. Orders will appear here once customers purchase your products.
                </div>
              ) : (
                orders.slice(0, 5).map(o => (
                  <div key={o._id} className="dash-order-row">
                    <div>
                      <div className="dash-order-id">#{String(o._id).slice(-6).toUpperCase()}</div>
                      <div className="dash-order-date">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</div>
                    </div>
                    <div>
                      <div className="dash-order-customer">{o.customer?.fullName || 'Customer'}</div>
                      <div className="dash-order-amount">RWF {Number(o.total).toLocaleString()}</div>
                    </div>
                    <span className="status-badge" style={{ background: (STATUS_COLORS[o.status]||'#6b7280')+'20', color: STATUS_COLORS[o.status]||'#6b7280', border: `1px solid ${STATUS_COLORS[o.status]||'#6b7280'}40` }}>
                      {o.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent products */}
          {products.length > 0 && (
            <div className="dash-panel" style={{ marginTop: 16 }}>
              <div className="dash-panel-header">
                <span className="dash-panel-title">🛍️ My Latest Products</span>
                <button className="dash-panel-link" onClick={() => setTab('products')}>View all</button>
              </div>
              <div className="dash-panel-body">
                {products.slice(0, 4).map(p => (
                  <div key={p._id} className="dash-product-row">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="dash-product-img" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      : <div className="dash-product-img-placeholder">🛍️</div>}
                    <div className="dash-product-info">
                      <div className="dash-product-name">{p.name}</div>
                      <div className="dash-product-meta">
                        {p.category} · {p.stock} in stock
                      </div>
                    </div>
                    <div className="dash-product-revenue">
                      RWF {Number(p.price).toLocaleString()}
                    </div>
                    <span className={`status-badge ${p.isActive ? 'status-active' : 'status-draft'}`} style={{ marginLeft: 8 }}>
                      {p.isActive ? 'Live' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Products tab ── */}
      {!loading && tab === 'products' && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">My Products ({products.length})</div>
            <button className="btn primary" style={{ fontSize: 12 }} onClick={openCreate}>
              ＋ Add Product
            </button>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1c1917', marginBottom: 6 }}>No products yet</div>
              <p style={{ color: '#78716c', fontSize: 13, marginBottom: 20 }}>Add your first product and it will appear here after admin approval.</p>
              <button className="btn primary" onClick={openCreate}>＋ Add your first product</button>
            </div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="admin-product-cell">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                          : <div className="admin-product-thumb-placeholder">🛍️</div>}
                        <div>
                          <div className="admin-product-name-text">{p.name}</div>
                          {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                          {p.discountPrice && (
                            <div style={{ fontSize: 10, color: '#15803d', marginTop: 2 }}>
                              Sale: RWF {Number(p.discountPrice).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="admin-cat-pill">{p.category}</span></td>
                    <td className="admin-price-cell">
                      {p.discountPrice ? (
                        <div>
                          <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: 11 }}>
                            RWF {Number(p.price).toLocaleString()}
                          </span>
                          <div>RWF {Number(p.discountPrice).toLocaleString()}</div>
                        </div>
                      ) : `RWF ${Number(p.price).toLocaleString()}`}
                    </td>
                    <td>
                      <span className={p.stock === 0 ? 'stock-out' : p.stock < 10 ? 'stock-low' : 'stock-ok'}>
                        {p.stock === 0 ? 'Out' : p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${p.isActive ? 'status-active' : 'status-draft'}`}>
                        {p.isActive ? 'Active' : 'Pending Review'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button
                          className="admin-btn-edit"
                          onClick={() => openEdit(p)}
                          disabled={deleting === p._id}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => onDelete(p._id, p.name)}
                          disabled={deleting === p._id}
                          aria-label="Delete product"
                        >
                          {deleting === p._id ? '…' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Orders tab ── */}
      {!loading && tab === 'orders' && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">My Orders ({orders.length})</div>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1c1917', marginBottom: 6 }}>No orders yet</div>
              <p style={{ color: '#78716c', fontSize: 13 }}>Orders for your products will appear here.</p>
            </div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td><span className="admin-order-id-cell">#{String(o._id).slice(-8).toUpperCase()}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{o.customer?.fullName || 'Customer'}</div>
                      {o.customer?.email && <div style={{ fontSize: 11, color: '#a8a29e' }}>{o.customer.email}</div>}
                    </td>
                    <td><span className="admin-items-badge">{o.items?.length || 0}</span></td>
                    <td className="admin-price-cell">RWF {Number(o.total).toLocaleString()}</td>
                    <td>
                      <span className="status-badge" style={{ background: (STATUS_COLORS[o.status]||'#6b7280')+'20', color: STATUS_COLORS[o.status]||'#6b7280', border: `1px solid ${STATUS_COLORS[o.status]||'#6b7280'}40` }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#78716c' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Analytics tab ── */}
      {!loading && tab === 'analytics' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Gross Revenue',     value: `RWF ${Number(totalRevenue).toLocaleString()}`,  icon: '💰', color: '#c2410c' },
              { label: `Net Earnings (${100 - feePercent}%)`, value: `RWF ${Number(netEarnings).toLocaleString()}`,  icon: '💵', color: '#15803d' },
              { label: `Platform Fee (${feePercent}%)`,      value: `RWF ${Number(platformFee).toLocaleString()}`,  icon: '🏛️', color: '#6b7280' },
              { label: 'Total Orders',      value: String(orderCount),                              icon: '📦', color: '#1d4ed8' },
              { label: 'Pending Orders',    value: String(pendingOrders),                           icon: '⏳', color: '#d97706' },
              { label: 'Products Listed',   value: String(productCount),                            icon: '🛍️', color: '#7c3aed' },
            ].map(k => (
              <div key={k.label} className="dash-kpi" style={{ borderTop: `3px solid ${k.color}` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: '#78716c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 4 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Breakdown info */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(194,65,12,.09)', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>Earnings Breakdown</div>
            {[
              { label: 'Orders Completed', value: String(orderCount), unit: '' },
              { label: 'Earnings per Platform Fee', value: `${feePercent}%`, unit: '' },
              { label: 'Gross Revenue', value: Number(totalRevenue).toLocaleString(), unit: 'RWF' },
              { label: `Platform Fee (${feePercent}%)`, value: Number(platformFee).toLocaleString(), unit: 'RWF' },
              { label: 'Net Payout', value: Number(netEarnings).toLocaleString(), unit: 'RWF' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(194,65,12,.06)' }}>
                <span style={{ fontSize: 13, color: '#78716c' }}>{r.label}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#1c1917' }}>
                  {r.unit && <span style={{ fontSize: 11, color: '#a8a29e', marginRight: 3 }}>{r.unit}</span>}
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
