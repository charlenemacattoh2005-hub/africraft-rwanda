import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminProducts } from '../services/admin';

export default function AdminCategoriesPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const DEFAULT_CATEGORIES = [
  'Baskets','Paintings','Wood Carvings','Kitchen','Jewelry',
  'Pottery','Home Décor','Bags','Gifts','Games','Storage','Musical Instruments',
];

const CAT_ICONS: Record<string, string> = {
  'Baskets': '🧺', 'Paintings': '🖼️', 'Wood Carvings': '🪵',
  'Kitchen': '🍳', 'Jewelry': '💍', 'Pottery': '🏺',
  'Home Décor': '🏠', 'Bags': '👜', 'Gifts': '🎁',
  'Games': '🎲', 'Storage': '📦', 'Musical Instruments': '🥁',
};

function Inner() {
  const [products,    setProducts]    = useState<any[]>([]);
  const [categories,  setCategories]  = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading,     setLoading]     = useState(true);
  const [newCat,      setNewCat]      = useState('');
  const [editingCat,  setEditingCat]  = useState<string | null>(null);
  const [editVal,     setEditVal]     = useState('');

  useEffect(() => {
    fetchAdminProducts()
      .then(d => {
        const prods = d.products || [];
        setProducts(prods);
        // merge any categories from products not in default list
        const fromProducts = [...new Set(prods.map((p: any) => p.category).filter(Boolean))] as string[];
        setCategories(prev => [...new Set([...prev, ...fromProducts])]);
      })
      .finally(() => setLoading(false));
  }, []);

  const countFor = (cat: string) => products.filter(p => p.category === cat).length;
  const revenueFor = (cat: string) => products.filter(p => p.category === cat).reduce((s, p) => s + Number(p.price || 0), 0);

  function addCategory() {
    const trimmed = newCat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories(prev => [...prev, trimmed]);
    setNewCat('');
  }

  function deleteCategory(cat: string) {
    if (countFor(cat) > 0) { alert(`Cannot delete "${cat}" — it has ${countFor(cat)} products.`); return; }
    if (!confirm(`Delete category "${cat}"?`)) return;
    setCategories(prev => prev.filter(c => c !== cat));
  }

  function saveEdit(old: string) {
    const trimmed = editVal.trim();
    if (!trimmed || (trimmed !== old && categories.includes(trimmed))) return;
    setCategories(prev => prev.map(c => c === old ? trimmed : c));
    setEditingCat(null);
  }

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Categories</div>
          <p className="admin-page-sub">Manage product categories used across the store.</p>
        </div>
      </div>

      {/* Add category */}
      <div className="admin-toolbar" style={{ marginBottom: 24 }}>
        <input className="input" style={{ maxWidth: 280 }} placeholder="New category name…"
          value={newCat} onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCategory()} />
        <button className="btn primary" onClick={addCategory}>＋ Add Category</button>
        <span className="admin-toolbar-count">{categories.length} categories</span>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      ) : (
        <div className="cat-grid">
          {categories.map(cat => {
            const count   = countFor(cat);
            const revenue = revenueFor(cat);
            const icon    = CAT_ICONS[cat] || '📦';
            return (
              <div key={cat} className="cat-card">
                <div className="cat-card-icon">{icon}</div>
                <div className="cat-card-body">
                  {editingCat === cat ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input className="input" style={{ flex: 1, padding: '4px 8px', fontSize: 13 }}
                        value={editVal} onChange={e => setEditVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat); if (e.key === 'Escape') setEditingCat(null); }}
                        autoFocus />
                      <button className="btn primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => saveEdit(cat)}>✓</button>
                      <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setEditingCat(null)}>✕</button>
                    </div>
                  ) : (
                    <div className="cat-card-name">{cat}</div>
                  )}
                  <div className="cat-card-meta">
                    <span>{count} product{count !== 1 ? 's' : ''}</span>
                    {revenue > 0 && <span>RWF {revenue.toLocaleString()} listed</span>}
                  </div>
                </div>
                <div className="cat-card-actions">
                  <button className="admin-btn-edit" onClick={() => { setEditingCat(cat); setEditVal(cat); }}>✏️</button>
                  <button className="admin-btn-delete" onClick={() => deleteCategory(cat)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
