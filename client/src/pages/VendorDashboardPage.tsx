import React, { useEffect, useState, useRef } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchVendorStats, fetchVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct, fetchVendorOrders, fetchVendorPayout } from '../services/admin';
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
  const imgRef = useRef<HTMLInputElement>(null);
  async function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, imageUrl: reader.result as string });
    reader.readAsDataURL(file);
  }
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
              <div className="admin-field"><label>Stock *</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="50" />
              </div>
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field"><label>Category *</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field"><label>Badge</label>
                <input className="input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. New Arrival" />
              </div>
            </div>
            <div className="admin-field"><label>Product Image</label>
              <div className="product-img-input-row">
                <input className="input" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Paste URL or upload…" />
                <button type="button" className="btn" onClick={() => imgRef.current?.click()}>📁 Upload</button>
              </div>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
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
  const [tab,       setTab]       = useState<Tab>('dashboard');
  const [stats,     setStats]     = useState<any>(null);
  const [products,  setProducts]  = useState<any[]>([]);
  const [orders,    setOrders]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState<any>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const payload   = getAuthPayload();
  const vendorName = payload?.name || payload?.email || 'Vendor';

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchVendorStats(), fetchVendorProducts(), fetchVendorOrders()])
      .then(([s, pd, od]) => { setStats(s); setProducts(pd.products || []); setOrders(od.orders || []); })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  async function onSaveCreate() {
    if (!form.name || !form.description || !form.price || !form.stock) { showToast('Name, description, price and stock are required', 'error'); return; }
    setSaving(true);
    try {
      const res = await createVendorProduct(form);
      if (res.product) { setProducts(p => [res.product, ...p]); setCreating(false); showToast('Product submitted for review'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await updateVendorProduct(editing._id, { ...form, price: Number(form.price), stock: Number(form.stock) });
      if (res.product) { setProducts(p => p.map(x => x._id === editing._id ? res.product : x)); setEditing(null); showToast('Product updated'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteVendorProduct(id); setProducts(p => p.filter(x => x._id !== id)); showToast('Product deleted'); }
    catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  const totalRevenue   = stats?.totalRevenue  || 0;
  const orderCount     = stats?.orderCount    || 0;
  const pendingOrders  = stats?.pendingOrders || 0;
  const productCount   = stats?.productCount  || products.length;
  const activeProducts = products.filter(p => p.isActive).length;

  const kpis = [
    { icon: '💰', label: 'Revenue',          value: `RWF ${Number(totalRevenue).toLocaleString()}` },
    { icon: '📦', label: 'Total Orders',     value: String(orderCount) },
    { icon: '⏳', label: 'Pending Orders',   value: String(pendingOrders) },
    { icon: '🛍️', label: 'Total Products',   value: String(productCount) },
    { icon: '✅', label: 'Active Listings',   value: String(activeProducts) },
  ];

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'dashboard', icon: '⊞',  label: 'Dashboard' },
    { key: 'products',  icon: '📦',  label: 'My Products' },
    { key: 'orders',    icon: '🧾',  label: 'My Orders' },
    { key: 'analytics', icon: '📈',  label: 'Analytics' },
  ];

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {creating && <ProductModal title="Add New Product" form={form} setForm={setForm} onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} />}
      {editing  && <ProductModal title="Edit Product"    form={form} setForm={setForm} onSave={onSaveEdit}   onClose={() => setEditing(null)}   saving={saving} />}

      {/* Store profile card */}
      <div className="vendor-store-card">
        <div className="vendor-store-avatar">{vendorName[0]?.toUpperCase()}</div>
        <div className="vendor-store-info">
          <div className="vendor-store-name">{vendorName}'s Store</div>
          <div className="vendor-store-meta">{products.length} products · {orderCount} orders</div>
        </div>
        <div className="vendor-store-actions">
          <button className="btn" onClick={() => { setForm(EMPTY_FORM); setCreating(true); }}>＋ Add Product</button>
        </div>
      </div>

      {/* Payout card */}
      <div className="vendor-payout-card">
        <div className="vendor-payout-label">Available Balance</div>
        <div className="vendor-payout-amount">RWF {Number(totalRevenue * 0.85).toLocaleString()}</div>
        <div className="vendor-payout-sub">After 15% platform fee · {orderCount} orders processed</div>
        <button className="vendor-payout-btn">💳 Request Payout</button>
      </div>

      {/* Tabs */}
      <div className="vendor-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`vendor-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />}

      {!loading && tab === 'dashboard' && (
        <>
          <div className="vendor-kpi-row">
            {kpis.map(k => (
              <div key={k.label} className="vendor-kpi">
                <div className="vendor-kpi-icon">{k.icon}</div>
                <div className="vendor-kpi-val">{k.value}</div>
                <div className="vendor-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
          {/* Recent orders preview */}
          <div className="dash-panel">
            <div className="dash-panel-header">
              <span className="dash-panel-title">🕐 Recent Orders</span>
              <button className="dash-panel-link" onClick={() => setTab('orders')}>View all</button>
            </div>
            <div className="dash-panel-body">
              {orders.length === 0 && <div className="dash-panel-empty">No orders yet.</div>}
              {orders.slice(0, 5).map(o => (
                <div key={o._id} className="dash-order-row">
                  <div>
                    <div className="dash-order-id">#{String(o._id).slice(-6).toUpperCase()}</div>
                    <div className="dash-order-date">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</div>
                  </div>
                  <div>
                    <div className="dash-order-customer">{o.customer?.fullName || 'Customer'}</div>
                    <div className="dash-order-amount">RWF {Number(o.total).toLocaleString()}</div>
                  </div>
                  <span className="status-badge" style={{ background: (STATUS_COLORS[o.status] || '#6b7280') + '20', color: STATUS_COLORS[o.status] || '#6b7280', border: `1px solid ${STATUS_COLORS[o.status] || '#6b7280'}40` }}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && tab === 'products' && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">My Products ({products.length})</div>
            <button className="btn primary" style={{ fontSize: 12 }} onClick={() => { setForm(EMPTY_FORM); setCreating(true); }}>＋ Add Product</button>
          </div>
          <table className="dash-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={6} className="dash-table-empty">No products yet. Add your first!</td></tr>}
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="admin-product-cell">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" /> : <div className="admin-product-thumb-placeholder">🛍️</div>}
                      <div>
                        <div className="admin-product-name-text">{p.name}</div>
                        {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-cat-pill">{p.category}</span></td>
                  <td className="admin-price-cell">RWF {Number(p.price).toLocaleString()}</td>
                  <td><span className={p.stock === 0 ? 'stock-out' : p.stock < 10 ? 'stock-low' : 'stock-ok'}>{p.stock === 0 ? 'Out' : p.stock}</span></td>
                  <td><span className={`status-badge ${p.isActive ? 'status-active' : 'status-draft'}`}>{p.isActive ? 'Active' : 'Pending Review'}</span></td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn-edit" onClick={() => { setForm({ ...p, price: String(p.price), stock: String(p.stock), discountPrice: p.discountPrice != null ? String(p.discountPrice) : '' }); setEditing(p); }}>✏️ Edit</button>
                      <button className="admin-btn-delete" onClick={() => onDelete(p._id, p.name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'orders' && (
        <div className="dash-card">
          <div className="dash-card-header"><div className="dash-card-title">My Orders ({orders.length})</div></div>
          <table className="dash-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={6} className="dash-table-empty">No orders yet.</td></tr>}
              {orders.map(o => (
                <tr key={o._id}>
                  <td><span className="admin-order-id-cell">#{String(o._id).slice(-8).toUpperCase()}</span></td>
                  <td>{o.customer?.fullName || 'Customer'}</td>
                  <td><span className="admin-items-badge">{o.items?.length || 0}</span></td>
                  <td className="admin-price-cell">RWF {Number(o.total).toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={{ background: (STATUS_COLORS[o.status] || '#6b7280') + '20', color: STATUS_COLORS[o.status] || '#6b7280', border: `1px solid ${STATUS_COLORS[o.status] || '#6b7280'}40` }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
          {[
            { label: 'Total Revenue',    value: `RWF ${Number(totalRevenue).toLocaleString()}`,    icon: '💰', color: '#c2410c' },
            { label: 'Net Earnings',     value: `RWF ${Number(totalRevenue * 0.85).toLocaleString()}`, icon: '💵', color: '#15803d' },
            { label: 'Platform Fee',     value: `RWF ${Number(totalRevenue * 0.15).toLocaleString()}`, icon: '🏛️', color: '#6b7280' },
            { label: 'Total Orders',     value: String(orderCount),   icon: '📦', color: '#1d4ed8' },
            { label: 'Pending Orders',   value: String(pendingOrders), icon: '⏳', color: '#d97706' },
            { label: 'Products Listed',  value: String(productCount),  icon: '🛍️', color: '#7c3aed' },
          ].map(k => (
            <div key={k.label} className="dash-kpi" style={{ borderTop: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: '#78716c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
