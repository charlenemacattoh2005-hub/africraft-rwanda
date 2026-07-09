import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../services/admin';

export default function AdminDiscountsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const EMPTY = { code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', startDate: '', endDate: '', isActive: true, description: '' };

function DiscountModal({ title, form, setForm, onSave, onClose, saving }: {
  title: string; form: any; setForm: (f: any) => void;
  onSave: () => void; onClose: () => void; saving: boolean;
}) {
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 500 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="admin-modal-grid2">
            <div className="admin-field">
              <label>Coupon Code *</label>
              <input className="input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" />
            </div>
            <div className="admin-field">
              <label>Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (RWF)</option>
              </select>
            </div>
          </div>
          <div className="admin-modal-grid2">
            <div className="admin-field">
              <label>Value *</label>
              <input className="input" type="number" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? '20' : '5000'} />
            </div>
            <div className="admin-field">
              <label>Min Order (RWF)</label>
              <input className="input" type="number" min="0" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="admin-modal-grid2">
            <div className="admin-field">
              <label>Max Uses (0 = unlimited)</label>
              <input className="input" type="number" min="0" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="0" />
            </div>
            <div className="admin-field">
              <label>Start Date</label>
              <input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
          </div>
          <div className="admin-field">
            <label>End Date</label>
            <input className="input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Description</label>
            <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Internal note…" />
          </div>
          <label className="admin-checkbox-label">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            Active (can be used by customers)
          </label>
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save Coupon'}</button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState<any>(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  useEffect(() => {
    fetchDiscounts().then(d => setDiscounts(d.discounts || [])).finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  async function onSaveCreate() {
    if (!form.code || !form.value) { showToast('Code and value are required', 'error'); return; }
    setSaving(true);
    try {
      const res = await createDiscount(form);
      if (res.discount) { setDiscounts(p => [res.discount, ...p]); setCreating(false); showToast('Coupon created'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await updateDiscount(editing._id, form);
      if (res.discount) { setDiscounts(p => p.map(d => d._id === editing._id ? res.discount : d)); setEditing(null); showToast('Coupon updated'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onDelete(d: any) {
    if (!confirm(`Delete coupon "${d.code}"?`)) return;
    try {
      await deleteDiscount(d._id);
      setDiscounts(p => p.filter(x => x._id !== d._id));
      showToast('Coupon deleted');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {creating && <DiscountModal title="Create Coupon" form={form} setForm={setForm} onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} />}
      {editing  && <DiscountModal title="Edit Coupon"   form={form} setForm={setForm} onSave={onSaveEdit}   onClose={() => setEditing(null)}   saving={saving} />}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Coupons & Discounts</div>
          <p className="admin-page-sub">Create and manage promotional coupon codes.</p>
        </div>
        <button className="btn primary" onClick={() => { setForm(EMPTY); setCreating(true); }}>＋ Create Coupon</button>
      </div>

      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />}
      {!loading && (
        <div className="coupon-grid">
          {discounts.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 24px', color: '#a8a29e' }}>
              No coupons yet. Create your first one.
            </div>
          )}
          {discounts.map(d => (
            <div key={d._id} className="coupon-card">
              <div className="coupon-icon">🎁</div>
              <div className="coupon-info">
                <div className="coupon-code">{d.code}</div>
                <div className="coupon-details">
                  {d.type === 'percentage' ? `${d.value}% off` : `RWF ${Number(d.value).toLocaleString()} off`}
                  {d.minOrder > 0 ? ` · min RWF ${Number(d.minOrder).toLocaleString()}` : ''}
                </div>
                <div className="coupon-usage">{d.uses || 0}{d.maxUses > 0 ? ` / ${d.maxUses}` : ''} uses{d.endDate ? ` · expires ${new Date(d.endDate).toLocaleDateString()}` : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <span className={`status-badge ${d.isActive ? 'status-active' : 'status-inactive'}`}>{d.isActive ? 'Active' : 'Inactive'}</span>
                <span className={`discount-type-badge ${d.type}`}>{d.type}</span>
                <div className="coupon-actions">
                  <button className="admin-btn-edit" onClick={() => { setForm({ ...d, value: String(d.value), minOrder: String(d.minOrder), maxUses: String(d.maxUses) }); setEditing(d); }}>✏️</button>
                  <button className="admin-btn-delete" onClick={() => onDelete(d)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
