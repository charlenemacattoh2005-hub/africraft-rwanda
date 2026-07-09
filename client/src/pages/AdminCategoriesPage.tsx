import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../services/admin';

export default function AdminCategoriesPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const EMPTY = { name: '', description: '', imageUrl: '', isActive: true };

function CatModal({ title, form, setForm, onSave, onClose, saving }: {
  title: string; form: any; setForm: (f: any) => void;
  onSave: () => void; onClose: () => void; saving: boolean;
}) {
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 480 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="admin-field">
            <label>Category Name *</label>
            <input className="input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Baskets" />
          </div>
          <div className="admin-field">
            <label>Description</label>
            <textarea className="input admin-textarea" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Short description…" />
          </div>
          <div className="admin-field">
            <label>Image URL</label>
            <input className="input" value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…" />
          </div>
          <label className="admin-checkbox-label">
            <input type="checkbox" checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            Active (visible to customers)
          </label>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="preview"
              style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [creating,   setCreating]   = useState(false);
  const [editing,    setEditing]    = useState<any>(null);
  const [form,       setForm]       = useState<any>(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    fetchAdminCategories()
      .then(d => setCategories(d.categories || []))
      .catch(e => setError(e?.message || 'Failed'))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function onSaveCreate() {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const res = await createAdminCategory(form);
      if (res.category) {
        setCategories(p => [res.category, ...p]);
        setCreating(false);
        showToast('Category created');
      } else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing || !form.name.trim()) { showToast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const res = await updateAdminCategory(editing._id, form);
      if (res.category) {
        setCategories(p => p.map(c => c._id === editing._id ? res.category : c));
        setEditing(null);
        showToast('Category updated');
      } else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onDelete(cat: any) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCategory(cat._id);
      setCategories(p => p.filter(c => c._id !== cat._id));
      showToast('Category deleted');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {creating && <CatModal title="New Category" form={form} setForm={setForm} onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} />}
      {editing  && <CatModal title="Edit Category" form={form} setForm={setForm} onSave={onSaveEdit} onClose={() => setEditing(null)} saving={saving} />}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Categories</div>
          <p className="admin-page-sub">Organise products into categories visible on the store.</p>
        </div>
        <button className="btn primary" onClick={() => { setForm(EMPTY); setCreating(true); }}>＋ Add Category</button>
      </div>

      {error && <div className="admin-error-banner">⚠️ {error}</div>}
      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 }}>
          {categories.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#a8a29e' }}>
              No categories yet. Create your first one.
            </div>
          )}
          {categories.map(cat => (
            <div key={cat._id} className="dash-card" style={{ marginBottom: 0, overflow: 'hidden' }}>
              {cat.imageUrl
                ? <img src={cat.imageUrl} alt={cat.name}
                    style={{ width: '100%', height: 130, objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : <div style={{ width: '100%', height: 130, background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📂</div>
              }
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1c1917' }}>{cat.name}</div>
                  <span className={`status-badge ${cat.isActive ? 'status-active' : 'status-inactive'}`}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                {cat.description && (
                  <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, lineHeight: 1.5 }}>
                    {cat.description.slice(0, 80)}{cat.description.length > 80 ? '…' : ''}
                  </p>
                )}
                <div className="admin-action-btns" style={{ marginTop: 12 }}>
                  <button className="admin-btn-edit"
                    onClick={() => { setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '', isActive: cat.isActive }); setEditing(cat); }}>
                    ✏️ Edit
                  </button>
                  <button className="admin-btn-delete" onClick={() => onDelete(cat)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
