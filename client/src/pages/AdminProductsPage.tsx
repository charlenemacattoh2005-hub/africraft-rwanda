import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminProducts, updateProduct, deleteProduct, createProduct } from '../services/admin';

export default function AdminProductsPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const CATEGORIES = [
  'Baskets','Paintings','Wood Carvings','Kitchen','Jewelry',
  'Pottery','Home Décor','Bags','Gifts','Games','Storage','Musical Instruments',
];

const BADGES = ['', '⭐ Featured', 'Best Seller', 'New Arrival', 'Handmade', 'Made in Rwanda'];

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '',
  category: CATEGORIES[0], imageUrl: '', badge: '', isActive: true, featured: false,
};

function ProductModal({
  title, form, setForm, onSave, onClose, saving,
}: {
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
          {/* Left column */}
          <div className="admin-modal-col">
            <div className="admin-field">
              <label>Product Name *</label>
              <input className="input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Agaseke Peace Basket" />
            </div>
            <div className="admin-field">
              <label>Description *</label>
              <textarea className="input admin-textarea" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the product…" rows={4} />
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Price (RWF) *</label>
                <input className="input" type="number" min="0" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="45000" />
              </div>
              <div className="admin-field">
                <label>Stock *</label>
                <input className="input" type="number" min="0" value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  placeholder="50" />
              </div>
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Category *</label>
                <select className="input" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Badge</label>
                <select className="input" value={form.badge}
                  onChange={e => setForm({ ...form, badge: e.target.value })}>
                  {BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label>Image URL</label>
              <input className="input" value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…" />
            </div>
            <div className="admin-field-row">
              <label className="admin-checkbox-label">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active (visible to customers)
              </label>
              <label className="admin-checkbox-label">
                <input type="checkbox" checked={form.featured}
                  onChange={e => setForm({ ...form, featured: e.target.checked })} />
                Featured on homepage
              </label>
            </div>
          </div>

          {/* Right column — preview */}
          <div className="admin-modal-preview">
            <div className="admin-preview-label">Preview</div>
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="preview" className="admin-preview-img"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="admin-preview-placeholder">🛍️<br /><span>No image</span></div>
            )}
            <div className="admin-preview-name">{form.name || 'Product name'}</div>
            <div className="admin-preview-price">
              {form.price ? `RWF ${Number(form.price).toLocaleString()}` : 'RWF —'}
            </div>
            <div className="admin-preview-meta">
              <span className="admin-preview-cat">{form.category}</span>
              {form.badge && <span className="admin-preview-badge">{form.badge}</span>}
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [editing,  setEditing]  = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState<any>(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    fetchAdminProducts()
      .then(d => setProducts(d.products || []))
      .catch(e => setError(e?.message || 'Failed'))
      .finally(() => setLoading(false));
  }

  function openCreate() { setForm(EMPTY_FORM); setCreating(true); }
  function openEdit(p: any) { setForm({ ...p, price: String(p.price), stock: String(p.stock) }); setEditing(p); }

  async function onSaveCreate() {
    if (!form.name || !form.description || !form.price || !form.stock) {
      alert('Name, description, price and stock are required.'); return;
    }
    setSaving(true);
    try {
      const res = await createProduct(form);
      if (res.product) { setProducts(prev => [res.product, ...prev]); setCreating(false); }
      else alert(res.message || 'Failed to create');
    } catch (e: any) { alert(e?.message || 'Failed'); }
    finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await updateProduct(editing._id, {
        name: form.name, description: form.description,
        price: Number(form.price), stock: Number(form.stock),
        category: form.category, imageUrl: form.imageUrl,
        badge: form.badge, isActive: form.isActive, featured: form.featured,
      });
      if (res.product) {
        setProducts(prev => prev.map(p => p._id === editing._id ? res.product : p));
        setEditing(null);
      } else alert(res.message || 'Failed');
    } catch (e: any) { alert(e?.message || 'Failed'); }
    finally { setSaving(false); }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (e: any) { alert(e?.message || 'Failed to delete'); }
  }

  const filtered = products.filter(p => {
    const matchSearch = search === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const stockClass = (s: number) => s === 0 ? 'stock-out' : s < 10 ? 'stock-low' : 'stock-ok';

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Products</div>
          <p className="admin-page-sub">Manage listings, prices, stock and categories.</p>
        </div>
        <button className="btn primary" onClick={openCreate}>＋ Add Product</button>
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search products…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="admin-toolbar-count">{filtered.length} products</span>
      </div>

      {error && <div className="admin-error-banner">⚠️ {error}</div>}
      {loading && <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />}

      {/* Create modal */}
      {creating && (
        <ProductModal title="Add New Product" form={form} setForm={setForm}
          onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} />
      )}

      {/* Edit modal */}
      {editing && (
        <ProductModal title="Edit Product" form={form} setForm={setForm}
          onSave={onSaveEdit} onClose={() => setEditing(null)} saving={saving} />
      )}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th>
                <th>Stock</th><th>Status</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="dash-table-empty">No products found.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="admin-product-cell">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" />
                        : <div className="admin-product-thumb-placeholder">🛍️</div>
                      }
                      <div>
                        <div className="admin-product-name-text">{p.name}</div>
                        {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-cat-pill">{p.category}</span></td>
                  <td className="admin-price-cell">RWF {Number(p.price).toLocaleString()}</td>
                  <td><span className={stockClass(p.stock)}>{p.stock === 0 ? 'Out' : p.stock}</span></td>
                  <td>
                    <span className={`status-badge ${p.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin-center-cell">{p.featured ? '⭐' : '—'}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn-edit" onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className="admin-btn-delete" onClick={() => onDelete(p._id, p.name)}>🗑️</button>
                    </div>
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
