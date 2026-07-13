import React, { useEffect, useState, useCallback } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import ImageUpload from '../components/ImageUpload';
import {
  fetchAdminProducts, updateProduct, deleteProduct,
  createProduct, bulkProductAction, fetchVendorList,
} from '../services/admin';

export default function AdminProductsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

/* ── Constants ─────────────────────────────────────────────── */
const CATEGORIES = [
  'Baskets','Paintings','Wood Carvings','Kitchen','Jewelry',
  'Pottery','Home Décor','Bags','Gifts','Games','Storage','Musical Instruments',
];
const STATUSES = ['active','draft','archived'];
const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '', stock: '',
  category: CATEGORIES[0], imageUrl: '',
  badge: '', sku: '', barcode: '',
  status: 'active', isActive: true, featured: false,
  variants: [] as { name: string; options: string[] }[],
  vendorId: '',  // admin can assign product to a vendor
};

/* ── Product Modal ─────────────────────────────────────────── */
interface ModalProps {
  title:   string;
  form:    any;
  setForm: (f: any) => void;
  onSave:  () => void;
  onClose: () => void;
  saving:  boolean;
  vendors: { _id: string; fullName: string; email: string }[];
}

function ProductModal({ title, form, setForm, onSave, onClose, saving, vendors }: ModalProps) {

  function addVariant() {
    setForm({ ...form, variants: [...(form.variants || []), { name: '', options: [] }] });
  }
  function removeVariant(i: number) {
    setForm({ ...form, variants: form.variants.filter((_: any, j: number) => j !== i) });
  }
  function updateVariantName(i: number, name: string) {
    const vs = [...form.variants]; vs[i] = { ...vs[i], name }; setForm({ ...form, variants: vs });
  }
  function updateVariantOptions(i: number, raw: string) {
    const vs = [...form.variants];
    vs[i] = { ...vs[i], options: raw.split(',').map((s: string) => s.trim()).filter(Boolean) };
    setForm({ ...form, variants: vs });
  }

  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal admin-modal-wide">

        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-col">

            {/* Name */}
            <div className="admin-field">
              <label>Product Name *</label>
              <input className="input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Agaseke Peace Basket" />
            </div>

            {/* Description */}
            <div className="admin-field">
              <label>Description *</label>
              <textarea className="input admin-textarea" rows={4} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the product…" />
            </div>

            {/* Price + Sale price */}
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Price (RWF) *</label>
                <input className="input" type="number" min="0" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45000" />
              </div>
              <div className="admin-field">
                <label>Sale Price (RWF)</label>
                <input className="input" type="number" min="0" value={form.discountPrice}
                  onChange={e => setForm({ ...form, discountPrice: e.target.value })} placeholder="Optional" />
              </div>
            </div>

            {/* Stock + SKU */}
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Stock *</label>
                <input className="input" type="number" min="0" value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="50" />
              </div>
              <div className="admin-field">
                <label>SKU</label>
                <input className="input" value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="ACR-001" />
              </div>
            </div>

            {/* Category + Status */}
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Category *</label>
                <select className="input" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Status</label>
                <select className="input" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value, isActive: e.target.value === 'active' })}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vendor selector — admin assigns product to a vendor */}
            <div className="admin-field">
              <label>Assign to Vendor (optional)</label>
              <select className="input" value={form.vendorId}
                onChange={e => setForm({ ...form, vendorId: e.target.value })}>
                <option value="">— Admin-owned product —</option>
                {vendors.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.fullName} ({v.email})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>
                Leave blank to create product under the admin account.
              </span>
            </div>

            {/* Image upload — Cloudinary, no URL input */}
            <div className="admin-field">
              <label>Product Image</label>
              <ImageUpload
                value={form.imageUrl}
                onChange={url => setForm({ ...form, imageUrl: url })}
                label="Product image"
              />
            </div>

            {/* Badge */}
            <div className="admin-field">
              <label>Badge</label>
              <input className="input" value={form.badge}
                onChange={e => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. Best Seller" />
            </div>

            {/* Variants */}
            <div className="admin-field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Variants
                <button type="button"
                  style={{ fontSize: 11, color: '#c2410c', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={addVariant}>
                  ＋ Add variant
                </button>
              </label>
              {(form.variants || []).length === 0 && (
                <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>No variants yet.</p>
              )}
              {(form.variants || []).map((v: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input className="input" style={{ flex: '0 0 110px' }} placeholder="e.g. Color"
                    value={v.name} onChange={e => updateVariantName(i, e.target.value)} />
                  <input className="input" placeholder="Options — comma separated"
                    value={v.options.join(', ')} onChange={e => updateVariantOptions(i, e.target.value)} />
                  <button type="button" className="admin-btn-delete"
                    onClick={() => removeVariant(i)} aria-label="Remove variant">✕</button>
                </div>
              ))}
            </div>

            {/* Featured checkbox */}
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })} />
              Feature on homepage
            </label>

          </div>

          {/* Preview pane */}
          <div className="admin-modal-preview">
            <div className="admin-preview-label">Preview</div>
            {form.imageUrl
              ? <img src={form.imageUrl} alt="preview" className="admin-preview-img"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              : <div className="admin-preview-placeholder">🛍️<br /><span>No image yet</span></div>}
            <div className="admin-preview-name">{form.name || 'Product name'}</div>
            <div className="admin-preview-price">
              {form.discountPrice && (
                <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: 12, marginRight: 6 }}>
                  RWF {Number(form.price || 0).toLocaleString()}
                </span>
              )}
              RWF {Number(form.discountPrice || form.price || 0).toLocaleString()}
            </div>
            <div className="admin-preview-meta">
              <span className="admin-preview-cat">{form.category}</span>
              {form.badge && <span className="admin-preview-badge">{form.badge}</span>}
            </div>
            <span className={`status-badge status-${form.status}`} style={{ marginTop: 8 }}>
              {form.status}
            </span>
            {form.vendorId && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#0891b2',
                background: 'rgba(8,145,178,.08)', padding: '3px 10px', borderRadius: 6 }}>
                🏪 Assigned to vendor
              </div>
            )}
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

/* ── Inner page ────────────────────────────────────────────── */
function Inner() {
  const [products,   setProducts]   = useState<any[]>([]);
  const [vendors,    setVendors]    = useState<any[]>([]);
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

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminProducts()
      .then(d => setProducts(d.products || []))
      .catch(e => setError(e?.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Load vendor list for dropdown
    fetchVendorList()
      .then(d => setVendors(d.vendors || []))
      .catch(() => {}); // Non-critical — dropdown just stays empty
  }, [load]);

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
      price:         String(p.price),
      stock:         String(p.stock),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : '',
      variants:      Array.isArray(p.variants) ? p.variants : [],
      vendorId:      p.vendor?._id || p.vendor || '',
    });
    setEditing(p);
  }

  async function onSaveCreate() {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock) {
      showToast('Name, description, price and stock are required', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        stock:         Number(form.stock),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        vendorId:      form.vendorId || undefined,
      };
      const res = await createProduct(payload);
      if (res.product) {
        setProducts(p => [res.product, ...p]);
        setCreating(false);
        showToast('Product created successfully');
      } else {
        showToast(res.message || 'Failed to create product', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to create product', 'error');
    } finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        stock:         Number(form.stock),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        vendorId:      form.vendorId || undefined,
      };
      const res = await updateProduct(editing._id, payload);
      if (res.product) {
        setProducts(p => p.map(x => x._id === editing._id ? res.product : x));
        setEditing(null);
        showToast('Product updated');
      } else {
        showToast(res.message || 'Failed to update product', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setProducts(p => p.filter(x => x._id !== id));
      showToast('Product deleted');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  async function onBulk(action: string) {
    if (!selected.length) { showToast('Select at least one product', 'error'); return; }
    const label = { activate: 'activate', draft: 'set to draft', delete: 'delete', archive: 'archive' }[action] || action;
    if (!confirm(`${label} ${selected.length} product(s)?`)) return;
    try {
      await bulkProductAction(selected, action);
      setSelected([]);
      load();
      showToast(`${selected.length} products ${label}d`);
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  /* Filtered view */
  const filtered = products.filter(p => {
    const ms  = search === '' || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const mc  = catFilter  === 'All' || p.category === catFilter;
    const mst = statFilter === 'All' || p.status   === statFilter;
    return ms && mc && mst;
  });

  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p._id));
  const stockCls    = (s: number) => s === 0 ? 'stock-out' : s <= 10 ? 'stock-low' : 'stock-ok';

  const vendorName = (p: any) => {
    if (!p.vendor) return null;
    const vid = typeof p.vendor === 'object' ? p.vendor._id : p.vendor;
    const v   = vendors.find(x => x._id === vid);
    return v ? v.fullName : 'Vendor';
  };

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
      {creating && (
        <ProductModal title="Add Product" form={form} setForm={setForm}
          onSave={onSaveCreate} onClose={() => setCreating(false)}
          saving={saving} vendors={vendors} />
      )}
      {editing && (
        <ProductModal title="Edit Product" form={form} setForm={setForm}
          onSave={onSaveEdit} onClose={() => setEditing(null)}
          saving={saving} vendors={vendors} />
      )}

      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Products</div>
          <p className="admin-page-sub">
            Manage listings, pricing, stock and categories.
            Admin can create products and assign them to vendors.
          </p>
        </div>
        <button className="btn primary" onClick={openCreate}>＋ Add Product</button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 260 }}
          placeholder="Search by name or SKU…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-filter-select" value={catFilter}
          onChange={e => setCatFilter(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="admin-filter-select" value={statFilter}
          onChange={e => setStatFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {selected.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onBulk('activate')}>✅ Activate</button>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onBulk('draft')}>📝 Draft</button>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onBulk('archive')}>📦 Archive</button>
            <button className="btn" style={{ fontSize: 12, padding: '6px 12px', color: '#dc2626', borderColor: 'rgba(220,38,38,.3)' }} onClick={() => onBulk('delete')}>🗑️ Delete</button>
          </div>
        )}
        <span className="admin-toolbar-count">{filtered.length} products</span>
      </div>

      {error && <div className="admin-error-banner" role="alert">⚠️ {error}</div>}
      {loading && <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={allSelected}
                    onChange={e => setSelected(e.target.checked ? filtered.map(p => p._id) : [])}
                    aria-label="Select all" />
                </th>
                <th>Product</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="dash-table-empty">
                  No products found. Click "Add Product" to create your first listing.
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(p._id)}
                      onChange={e => setSelected(prev =>
                        e.target.checked ? [...prev, p._id] : prev.filter(id => id !== p._id)
                      )} />
                  </td>
                  <td>
                    <div className="admin-product-cell">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <div className="admin-product-thumb-placeholder">🛍️</div>}
                      <div>
                        <div className="admin-product-name-text">{p.name}</div>
                        {p.sku && <div style={{ fontSize: 10, color: '#a8a29e' }}>SKU: {p.sku}</div>}
                        {p.badge && <span className="admin-badge-pill">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: vendorName(p) ? '#0891b2' : '#a8a29e' }}>
                    {vendorName(p) || '— Admin —'}
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
                    <span className={stockCls(p.stock)}>
                      {p.stock === 0 ? 'Out' : p.stock}
                    </span>
                  </td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                  <td className="admin-center-cell">{p.featured ? '⭐' : '—'}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn-edit" onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className="admin-btn-delete" onClick={() => onDelete(p._id, p.name)} aria-label="Delete">🗑️</button>
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
