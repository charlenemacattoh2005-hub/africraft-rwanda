import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminProducts, updateProduct, deleteProduct } from '../services/admin';

export default function AdminProductsPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function Inner() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string|null>(null);
  const [search,   setSearch]   = useState('');
  const [editing,  setEditing]  = useState<any>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetchAdminProducts()
      .then(d => setProducts(d.products || []))
      .catch(e => setError(e?.message || 'Failed'))
      .finally(() => setLoading(false));
  }

  async function onSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateProduct(editing._id, {
        name: editing.name,
        price: Number(editing.price),
        stock: Number(editing.stock),
        isActive: editing.isActive,
      });
      setProducts(prev => prev.map(p => p._id === editing._id ? { ...p, ...editing } : p));
      setEditing(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  }

  const filtered = products.filter(p =>
    search === '' || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="accent-bar" />
      <div className="h1" style={{ marginBottom:4 }}>Products</div>
      <p className="p" style={{ marginBottom:20 }}>Manage product listings, prices and stock.</p>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <input className="input" style={{ maxWidth:300 }} placeholder="Search products…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="badge" style={{ alignSelf:'center' }}>{filtered.length} products</div>
      </div>

      {loading && <div className="skeleton" style={{ height:200 }} />}
      {error && <div className="badge" style={{ borderColor:'rgba(220,38,38,.3)', color:'#dc2626', background:'rgba(220,38,38,.08)' }}>{error}</div>}

      {/* Edit modal */}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="card" style={{ padding:28, width:'min(480px,94vw)', display:'grid', gap:14 }}>
            <div className="h1" style={{ fontSize:20 }}>Edit Product</div>
            <div>
              <label className="small">Name</label>
              <input className="input" value={editing.name} onChange={e => setEditing({...editing, name:e.target.value})} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label className="small">Price (RWF)</label>
                <input className="input" type="number" value={editing.price} onChange={e => setEditing({...editing, price:e.target.value})} />
              </div>
              <div>
                <label className="small">Stock</label>
                <input className="input" type="number" value={editing.stock} onChange={e => setEditing({...editing, stock:e.target.value})} />
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="active" checked={editing.isActive} onChange={e => setEditing({...editing, isActive:e.target.checked})} />
              <label htmlFor="active" className="small">Active (visible to customers)</label>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--muted)' }}>No products found.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} style={{ width:40, height:40, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                        : <div style={{ width:40, height:40, borderRadius:8, background:'linear-gradient(135deg,#fff3e0,#ffe0b2)', flexShrink:0 }} />
                      }
                      <span style={{ fontWeight:700 }}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge">{p.category}</span></td>
                  <td style={{ fontWeight:700, color:'#c2410c' }}>RWF {Number(p.price).toLocaleString()}</td>
                  <td>
                    <span className="badge" style={{ borderColor: p.stock < 10 ? 'rgba(220,38,38,.3)' : undefined, color: p.stock < 10 ? '#dc2626' : undefined }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${p.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => setEditing({...p})}>✏️ Edit</button>
                      <button className="btn danger" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => onDelete(p._id, p.name)}>🗑️</button>
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
