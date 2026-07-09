import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminOrders, updateOrderStatus, addOrderNote } from '../services/admin';

export default function OrdersAdminPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const ALL_STATUSES = [
  'all','pending','confirmed','paid','processing','packed',
  'shipped','out_for_delivery','delivered','completed','cancelled','returned','refunded',
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', paid: 'Paid', processing: 'Processing',
  packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
  returned: 'Returned', refunded: 'Refunded',
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', paid: 'status-paid',
  processing: 'status-processing', packed: 'status-packed', shipped: 'status-shipped',
  out_for_delivery: 'status-out_for_delivery', delivered: 'status-delivered',
  completed: 'status-completed', cancelled: 'status-cancelled',
  returned: 'status-returned', refunded: 'status-refunded',
};

function NoteModal({ order, onSave, onClose }: { order: any; onSave: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState(order.adminNote || '');
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 480 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Order Note — #{String(order._id).slice(-6).toUpperCase()}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <textarea className="input admin-textarea" rows={5} value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add an internal note about this order…" style={{ width: '100%' }} />
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(note)}>Save Note</button>
        </div>
      </div>
    </div>
  );
}

function TimelineModal({ order, onClose }: { order: any; onClose: () => void }) {
  const timeline = order.timeline || [];
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 520 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Order Timeline — #{String(order._id).slice(-6).toUpperCase()}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {timeline.length === 0 && (
            <p style={{ color: '#a8a29e', fontSize: 13 }}>No timeline events yet. Update the order status to begin.</p>
          )}
          {[{ status: 'pending', note: 'Order created', by: 'system', at: order.createdAt }, ...timeline].map((ev: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 18, position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', background: '#c2410c',
                  border: '2px solid #fff', boxShadow: '0 0 0 2px #c2410c', zIndex: 1,
                }} />
                {i < timeline.length && (
                  <div style={{ width: 2, flex: 1, background: 'rgba(194,65,12,.15)', minHeight: 24 }} />
                )}
              </div>
              <div style={{ paddingTop: 0 }}>
                <span className={`status-badge ${STATUS_CLASS[ev.status] || 'status-pending'}`} style={{ marginBottom: 4, display: 'inline-flex' }}>
                  {STATUS_LABELS[ev.status] || ev.status}
                </span>
                {ev.note && <div style={{ fontSize: 12, color: '#1c1917', marginTop: 3 }}>{ev.note}</div>}
                <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>
                  {ev.by || 'system'} · {ev.at ? new Date(ev.at).toLocaleString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [orders,    setOrders]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [noteOrder, setNoteOrder] = useState<any>(null);
  const [tlOrder,   setTlOrder]   = useState<any>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);
    fetchAdminOrders(params.toString())
      .then(d => setOrders(d.orders || []))
      .catch(e => setError(e?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function onStatusChange(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await updateOrderStatus(id, status);
      if (res.order) {
        setOrders(prev => prev.map(o => o._id === id ? res.order : o));
        showToast(`Order updated to ${status}`);
      }
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setUpdating(null); }
  }

  async function onSaveNote(note: string) {
    if (!noteOrder) return;
    try {
      const res = await addOrderNote(noteOrder._id, note);
      if (res.order) { setOrders(prev => prev.map(o => o._id === noteOrder._id ? res.order : o)); }
      setNoteOrder(null);
      showToast('Note saved');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  const counts: Record<string, number> = { all: orders.length };
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {noteOrder && <NoteModal order={noteOrder} onSave={onSaveNote} onClose={() => setNoteOrder(null)} />}
      {tlOrder   && <TimelineModal order={tlOrder} onClose={() => setTlOrder(null)} />}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Orders</div>
          <p className="admin-page-sub">Manage, track and update all customer orders.</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {['all','pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
          <button key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${statusFilter === s ? '#c2410c' : 'rgba(194,65,12,.15)'}`,
              background: statusFilter === s ? '#c2410c' : '#fff',
              color: statusFilter === s ? '#fff' : '#78716c',
              whiteSpace: 'nowrap',
            }}>
            {s === 'all' ? 'All' : STATUS_LABELS[s]} {counts[s] ? `(${counts[s]})` : ''}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()} />
        <span className="admin-toolbar-count">{orders.length} orders</span>
      </div>

      {error && <div className="admin-error-banner">⚠️ {error}</div>}
      {loading && <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="dash-table-empty">No orders found.</td></tr>
              )}
              {orders.map(o => (
                <tr key={o._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span className="admin-order-id-cell">#{String(o._id).slice(-8).toUpperCase()}</span>
                      {o.adminNote && (
                        <span style={{ fontSize: 10, color: '#d97706', background: '#fffbeb', padding: '1px 6px', borderRadius: 4 }}>
                          📝 Has note
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="admin-customer-cell">
                      <div className="admin-customer-name">{o.customer?.fullName || '—'}</div>
                      <div className="admin-customer-email">{o.customer?.email || ''}</div>
                      {o.customer?.phone && <div className="admin-customer-email">{o.customer.phone}</div>}
                    </div>
                  </td>
                  <td><span className="admin-items-badge">{o.items?.length || 0}</span></td>
                  <td className="admin-price-cell">RWF {Number(o.total).toLocaleString()}</td>
                  <td>
                    <select className="admin-status-select"
                      value={o.status}
                      disabled={updating === o._id}
                      onChange={e => onStatusChange(o._id, e.target.value)}>
                      {ALL_STATUSES.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn-edit" onClick={() => setTlOrder(o)} title="View timeline">📋</button>
                      <button className="admin-btn-view" onClick={() => setNoteOrder(o)} title="Add note">📝</button>
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
