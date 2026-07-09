import React, { useEffect, useState, useRef } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminProducts, updateProduct, deleteProduct, createProduct, bulkProductAction } from '../services/admin';

export default function AdminProductsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const CATEGORIES = [
  'Baskets','Paintings','Wood Carvings','Kitchen','Jewelry',
  'Pottery','Home Décor','Bags','Gifts','Games','Storage','Musical Instruments',
];
const STATUSES = ['active','draft','archived'];
const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '', stock: '',
  category: CATEGORIES[0], imageUrl: '', images: [] as string[],
  badge: '', sku: '', barcode: '', status: 'active', isActive: true, featured: false,
  variants: [] as { name: string; options: string[] }[],
};

function ProductModal({ title, form, setForm, onSave, onClose, saving }: {
  title: string; form: any; setForm: (f: any) => void;
  onSave: () => void; onClose: () => void; saving: boolean;
}) {
  const imgRef = useRef<HTMLInputElement>(null);

  async function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, imageUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  function addVariant() {
    setForm({ ...form, variants: [...(form.variants || []), { name: '', options: [] }] });
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
            <div className="admin-field">
              <label>Product Name *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Agaseke Peace Basket" />
            </div>
            <div className="admin-field">
              <label>Description *</label>
              <textarea className="input admin-textarea" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the product…" />
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Price (RWF) *</label>
                <input className="input" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45000" />
              </div>
              <div className="admin-field">
                <label>Sale Price (RWF)</label>
                <input className="input" type="number" min="0" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Stock *</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="50" />
              </div>
              <div className="admin-field">
                <label>SKU</label>
                <input className="input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="ACR-001" />
              </div>
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Category *</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Status</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value, isActive: e.target.value === 'active' })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label>Image</label>
              <div className="product-img-input-row">
                <input className="input" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="Paste URL or upload…" />
                <button type="button" className="btn" onClick={() => imgRef.current?.click()}>📁 Upload</button>
              </div>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
            </div>
            <div className="admin-field">
              <label>Badge</label>
              <input className="input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Best Seller" />
            </div>

            {/* Variants */}
            <div className="admin-field">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Variants
                <button type="button" style={{ fontSize: 11, color: '#c2410c', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }} onClick={addVariant}>＋ Add</button>
              </label>
              {(form.variants || []).map((v: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input className="input" style={{ flex: '0 0 100px' }} placeholder="Name" value={v.name}
                    onChange={e => { const vs = [...form.variants]; vs[i] = { ...v, name: e.target.value }; setForm({ ...form, variants: vs }); }} />
                  <input className="input" placeholder="Options (comma-separated)" value={v.options.join(', ')}
                    onChange={e => { const vs = [...form.variants]; vs[i] = { ...v, options: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }; setForm({ ...form, variants: vs }); }} />
                  <button type="button" className="admin-btn-delete" onClick={() => { const vs = form.variants.filter((_: any, j: number) => j !== i); setForm({ ...form, variants: vs }); }}>✕</button>
                </div>
              ))}
            </div>

            <div className="admin-field-row">
              <label className="admin-checkbox-label">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                Featured on homepage
              </label>
            </div>
          </div>

          <div className="admin-modal-preview">
            <div className="admin-preview-label">Preview</div>
            {form.imageUrl
              ? <img src={form.imageUrl} alt="preview" className="admin-preview-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              : <div className="admin-preview-placeholder">🛍️<br /><span>No image</span></div>}
            <div className="admin-preview-name">{form.name || 'Product name'}</div>
            <div className="admin-preview-price">
              {form.discountPrice && <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: 12, marginRight: 6 }}>RWF {Number(form.price).toLocaleString()}</span>}
              RWF {Number(form.discountPrice || form.price || 0).toLocaleString()}
            </div>
            <div className="admin-preview-meta">
              <span className="admin-preview-cat">{form.category}</span>
              {form.badge && <span className="admin-preview-badge">{form.badge}</span>}
            </div>
            <span className={`status-badge status-${form.status}`} style={{ marginTop: 8 }}>{form.status}</span>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [products,   setProducts]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('All');
  const [statFilter, setStatFilter] = useState('All');
  const [editing,    setEditing]    = useState<any>(null);
  const [creating,   setCreating]   = useState(false);
  const [form,       setForm]       = useState<any>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [selected,   setSelected]   = useState<string[]>([]);
  const [toast,      setToast]      = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    fetchAdminProducts()
      .then(d => setProducts(d.products || []))
      .catch(e => setError(e?.message || 'Failed'))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  async function onSaveCreate() {
    if (!form.name || !form.description || !form.price || !form.stock) { showToast('Name, description, price and stock are required', 'error'); return; }
    setSaving(true);
    try {
      const res = await createProduct(form);
      if (res.product) { setProducts(p => [res.product, ...p]); setCreating(false); showToast('Product created'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await updateProduct(editing._id, { ...form, price: Number(form.price), stock: Number(form.stock), discountPrice: form.discountPrice ? Number(form.discountPrice) : null });
      if (res.product) { setProducts(p => p.map(x => x._id === editing._id ? res.product : x)); setEditing(null); showToast('Product updated'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteProduct(id); setProducts(p => p.filter(x => x._id !== id)); showToast('Deleted'); }
    catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  async function onBulk(action: string) {
    if (!selected.length) { showToast('Select products first', 'error'); return; }
    if (!confirm(`${action} ${selected.length} product(s)?`)) return;
    try {
      await bulkProductAction(selected, action);
      setSelected([]);
      load();
      showToast(`${selected.length} products ${action}d`);
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  const filtered = products.filter(p => {
    const ms = search === '' || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter  === 'All' || p.category === catFilter;
    const mst = statFilter === 'All' || p.status === statFilter;
    return ms && mc && mst;
  });

  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p._id));
  const stockCls = (s: number) => s === 0 ? 'stock-out' : s <= 10 ? 'stock-low' : 'stock-ok';

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {creating && <ProductModal title="Add Product" form={form} setForm={setForm} onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} />}
      {editing  && <ProductModal title="Edit Product" form={form} setForm={setForm} onSave={onSaveEdit}  onClose={() => setEditing(null)}   saving={saving} />}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Products</div>
          <p className="admin-page-sub">Manage listings, pricing, stock and categories.</p>
        </div>
        <button className="btn primary" onClick={() => { setForm(EMPTY_FORM); setCreating(true); }}>＋ Add Product</button>
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 260 }} placeholder="Search name or SKU…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="admin-filter-select" value={statFilter} onChange={e => setStatFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {selected.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onBulk('activate')}>✅ Activate</button>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onBulk('draft')}>📝 Draft</button>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px', color: '#dc2626' }} onClick={() => onBulk('delete')}>🗑️ Delete</button>
          </div>
        )}
        <span className="admin-toolbar-count">{filtered.length} products</span>
      </div>

      {error && <div className="admin-error-banner">⚠️ {error}</div>}
      {loading && <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={allSelected}
                    onChange={e => setSelected(e.target.checked ? filtered.map(p => p._id) : [])} />
                </th>
                <th>Product</th><th>Category</th><th>Price</th>
                <th>Stock</th><th>Status</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="dash-table-empty">No products found.</td></tr>}
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(p._id)}
                      onChange={e => setSelected(prev => e.target.checked ? [...prev, p._id] : prev.filter(id => id !== p._id))} />
                  </td>
                  <td>
                    <div className="admin-product-cell">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" />
                        : <div className="admin-product-thumb-placeholder">🛍️</div>}
                      <div>
                        <div className="admin-product-name-text">{p.name}</div>
                        {p.sku && <div style={{ fontSize: 10, color: '#a8a29e' }}>SKU: {p.sku}</div>}
                        {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-cat-pill">{p.category}</span></td>
                  <td className="admin-price-cell">
                    {p.discountPrice ? (
                      <div>
                        <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: 11 }}>RWF {Number(p.price).toLocaleString()}</span>
                        <div>RWF {Number(p.discountPrice).toLocaleString()}</div>
                      </div>
                    ) : `RWF ${Number(p.price).toLocaleString()}`}
                  </td>
                  <td><span className={stockCls(p.stock)}>{p.stock === 0 ? 'Out' : p.stock}</span></td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                  <td className="admin-center-cell">{p.featured ? '⭐' : '—'}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn-edit" onClick={() => { setForm({ ...p, price: String(p.price), stock: String(p.stock), discountPrice: p.discountPrice != null ? String(p.discountPrice) : '', variants: p.variants || [] }); setEditing(p); }}>✏️ Edit</button>
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
