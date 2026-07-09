import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchInventory, adjustStock } from '../services/admin';

export default function AdminInventoryPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function AdjustModal({ product, onSave, onClose }: { product: any; onSave: (adj: number, reason: string) => void; onClose: () => void }) {
  const [adjustment, setAdjustment] = useState('');
  const [reason,     setReason]     = useState('');
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 420 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Adjust Stock — {product.name}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 14, background: 'rgba(194,65,12,.05)', borderRadius: 12, fontSize: 13 }}>
            Current stock: <strong>{product.stock}</strong>
          </div>
          <div className="admin-field">
            <label>Adjustment (positive to add, negative to remove)</label>
            <input className="input" type="number" value={adjustment} onChange={e => setAdjustment(e.target.value)} placeholder="e.g. +10 or -5" />
          </div>
          <div className="admin-field">
            <label>Reason</label>
            <input className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Restock, damage, return…" />
          </div>
          {adjustment && (
            <div style={{ fontSize: 13, color: '#78716c' }}>
              New stock will be: <strong>{Math.max(0, product.stock + Number(adjustment))}</strong>
            </div>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(Number(adjustment), reason)} disabled={!adjustment}>Save</button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [products,  setProducts]  = useState<any[]>([]);
  const [summary,   setSummary]   = useState<any>({});
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [adjusting, setAdjusting] = useState<any>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  useEffect(() => { load(); }, [filter]);

  function load() {
    setLoading(true);
    fetchInventory(filter)
      .then(d => { setProducts(d.products || []); setSummary({ totalProducts: d.totalProducts, outOfStock: d.outOfStock, lowStock: d.lowStock, totalValue: d.totalValue }); })
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  async function onAdjust(adj: number, reason: string) {
    if (!adjusting) return;
    try {
      const res = await adjustStock(adjusting._id, adj, reason);
      if (res.product) { setProducts(p => p.map(x => x._id === adjusting._id ? { ...x, stock: res.newStock } : x)); setAdjusting(null); showToast('Stock adjusted'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  const filtered = products.filter(p =>
    search === '' || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const stockCls = (s: number) => s === 0 ? 'stock-out' : s <= 10 ? 'stock-low' : 'stock-ok';

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {adjusting && <AdjustModal product={adjusting} onSave={onAdjust} onClose={() => setAdjusting(null)} />}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Inventory</div>
          <p className="admin-page-sub">Monitor stock levels and adjust inventory.</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Products', value: summary.totalProducts || 0, icon: '📦', color: '#1d4ed8' },
          { label: 'Out of Stock',   value: summary.outOfStock    || 0, icon: '❌', color: '#dc2626' },
          { label: 'Low Stock',      value: summary.lowStock      || 0, icon: '⚠️', color: '#d97706' },
          { label: 'Inventory Value',value: `RWF ${Number(summary.totalValue || 0).toLocaleString()}`, icon: '💰', color: '#15803d' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(194,65,12,.09)', padding: '18px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#78716c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 260 }} placeholder="Search products…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Stock</option>
          <option value="out">Out of Stock</option>
          <option value="low">Low Stock (≤10)</option>
          <option value="ok">In Stock (&gt;10)</option>
        </select>
        <span className="admin-toolbar-count">{filtered.length} products</span>
      </div>

      {loading && <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />}
      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Value</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="dash-table-empty">No products found.</td></tr>}
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="admin-product-cell">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" /> : <div className="admin-product-thumb-placeholder">🛍️</div>}
                      <div className="admin-product-name-text">{p.name}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#78716c', fontFamily: 'monospace' }}>{p.sku || '—'}</td>
                  <td><span className="admin-cat-pill">{p.category}</span></td>
                  <td className="admin-price-cell">RWF {Number(p.price).toLocaleString()}</td>
                  <td>
                    <span className={stockCls(p.stock)} style={{ fontSize: 14, fontWeight: 900 }}>
                      {p.stock === 0 ? 'OUT' : p.stock}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 700 }}>RWF {Number(p.price * p.stock).toLocaleString()}</td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => setAdjusting(p)}>📊 Adjust</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
