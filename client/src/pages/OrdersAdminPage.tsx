import React, { useEffect, useState, useCallback } from 'react';
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
  'pending','confirmed','paid','processing','packed',
  'shipped','out_for_delivery','delivered','completed','cancelled','returned','refunded',
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', paid: 'Paid', processing: 'Processing',
  packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
  returned: 'Returned', refunded: 'Refunded',
};

const STATUS_META: Record<string, { color: string; bg: string }> = {
  pending:          { color: '#d97706', bg: '#fffbeb' },
  confirmed:        { color: '#1d4ed8', bg: '#eff6ff' },
  paid:             { color: '#15803d', bg: '#f0fdf4' },
  processing:       { color: '#7c3aed', bg: '#f5f3ff' },
  packed:           { color: '#b45309', bg: '#fef3c7' },
  shipped:          { color: '#0891b2', bg: '#ecfeff' },
  out_for_delivery: { color: '#ea580c', bg: '#fff7ed' },
  delivered:        { color: '#15803d', bg: '#f0fdf4' },
  completed:        { color: '#15803d', bg: '#f0fdf4' },
  cancelled:        { color: '#dc2626', bg: '#fef2f2' },
  returned:         { color: '#9333ea', bg: '#faf5ff' },
  refunded:         { color: '#0891b2', bg: '#ecfeff' },
};

/* ── Order detail drawer ─────────────────────────────────────── */
function OrderDetailDrawer({ order, onClose, onStatusChange, updating }: {
  order: any;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  updating: string | null;
}) {
  const meta = STATUS_META[order.status] || { color: '#6b7280', bg: '#f3f4f6' };

  return (
    <div className="aod-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aod-drawer">

        {/* Header */}
        <div className="aod-drawer-header">
          <div>
            <div className="aod-drawer-title">
              Order #{String(order._id).slice(-8).toUpperCase()}
            </div>
            <div className="aod-drawer-sub">
              {new Date(order.createdAt).toLocaleDateString('en-RW', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}{' '}
              at {new Date(order.createdAt).toLocaleTimeString('en-RW', {
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="aod-status-badge" style={{ background: meta.bg, color: meta.color, borderColor: meta.color + '40' }}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <button className="aod-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="aod-drawer-body">

          {/* Status update */}
          <div className="aod-section">
            <div className="aod-section-title">Update Status</div>
            <select
              className="input"
              style={{ maxWidth: 260 }}
              value={order.status}
              disabled={updating === order._id}
              onChange={e => onStatusChange(order._id, e.target.value)}
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Items with images */}
          <div className="aod-section">
            <div className="aod-section-title">
              Items Ordered
              <span className="aod-pill">{order.items?.length || 0}</span>
            </div>
            <div className="aod-items">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="aod-item-row">
                  <div className="aod-item-img">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} />
                      : <span>🛍️</span>}
                  </div>
                  <div className="aod-item-info">
                    <div className="aod-item-name">{item.name}</div>
                    <div className="aod-item-meta">
                      Qty: <strong>{item.quantity}</strong>
                      &nbsp;·&nbsp;
                      Unit: <strong>RWF {Number(item.unitPrice).toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="aod-item-total">
                    RWF {Number(item.lineTotal).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-column: delivery + summary */}
          <div className="aod-two-col">

            {/* Delivery info */}
            <div className="aod-section">
              <div className="aod-section-title">Delivery Information</div>
              <div className="aod-info-grid">
                {[
                  ['Full Name',  order.customer?.fullName],
                  ['Phone',      order.customer?.phone],
                  ['Email',      order.customer?.email],
                  ['District',   order.customer?.district],
                  ['Sector',     order.customer?.sector],
                  ['Address',    order.customer?.address],
                  ['Payment',    order.customer?.paymentMethod || order.paymentMethod],
                ].map(([label, value]) => value ? (
                  <div key={label} className="aod-info-row">
                    <span className="aod-info-label">{label}</span>
                    <span className="aod-info-value">{value}</span>
                  </div>
                ) : null)}
                {order.customer?.deliveryNotes && (
                  <div className="aod-info-row aod-info-full">
                    <span className="aod-info-label">Notes</span>
                    <span className="aod-info-value">{order.customer.deliveryNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="aod-section">
              <div className="aod-section-title">Order Summary</div>
              <div className="aod-summary">
                <div className="aod-summary-row">
                  <span>Subtotal</span>
                  <span>RWF {Number(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="aod-summary-row">
                  <span>Delivery fee</span>
                  <span>{Number(order.deliveryFee || 0) === 0 ? 'Free' : `RWF ${Number(order.deliveryFee).toLocaleString()}`}</span>
                </div>
                <div className="aod-summary-row aod-summary-total">
                  <span>Total</span>
                  <span>RWF {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin note */}
          {order.adminNote && (
            <div className="aod-section">
              <div className="aod-section-title">Admin Note</div>
              <div className="aod-note-box">{order.adminNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Note modal ──────────────────────────────────────────────── */
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

/* ── Main inner component ────────────────────────────────────── */
function Inner() {
  const [orders,       setOrders]       = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating,     setUpdating]     = useState<string | null>(null);
  const [selected,     setSelected]     = useState<any>(null);
  const [noteOrder,    setNoteOrder]    = useState<any>(null);
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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
        // keep drawer in sync
        setSelected((prev: any) => prev?._id === id ? res.order : prev);
        showToast(`Status updated to ${STATUS_LABELS[status] || status}`);
      }
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setUpdating(null); }
  }

  async function onSaveNote(note: string) {
    if (!noteOrder) return;
    try {
      const res = await addOrderNote(noteOrder._id, note);
      if (res.order) {
        setOrders(prev => prev.map(o => o._id === noteOrder._id ? res.order : o));
        setSelected((prev: any) => prev?._id === noteOrder._id ? res.order : prev);
      }
      setNoteOrder(null);
      showToast('Note saved');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  const counts: Record<string, number> = { all: orders.length };
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  return (
    <>
      <div className="accent-bar" />
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      {noteOrder && <NoteModal order={noteOrder} onSave={onSaveNote} onClose={() => setNoteOrder(null)} />}
      {selected  && (
        <OrderDetailDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={onStatusChange}
          updating={updating}
        />
      )}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Orders</div>
          <p className="admin-page-sub">Manage, track and update all customer orders.</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 4 }}>
        {['all','pending','confirmed','processing','shipped','delivered','cancelled'].map(s => {
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${active ? '#c2410c' : 'rgba(194,65,12,.15)'}`,
              background: active ? '#c2410c' : '#fff',
              color: active ? '#fff' : '#78716c',
              whiteSpace: 'nowrap',
            }}>
              {s === 'all' ? 'All' : STATUS_LABELS[s]}{counts[s] ? ` (${counts[s]})` : ''}
            </button>
          );
        })}
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
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="dash-table-empty">No orders found.</td></tr>
              )}
              {orders.map(o => {
                const meta = STATUS_META[o.status] || { color: '#6b7280', bg: '#f3f4f6' };
                return (
                  <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>
                          #{String(o._id).slice(-8).toUpperCase()}
                        </span>
                        {o.adminNote && (
                          <span style={{ fontSize: 10, color: '#d97706', background: '#fffbeb', padding: '1px 6px', borderRadius: 4, width: 'fit-content' }}>
                            📝 Has note
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{o.customer?.fullName || '—'}</span>
                        <span style={{ fontSize: 11, color: '#78716c' }}>{o.customer?.email || ''}</span>
                        {o.customer?.phone && <span style={{ fontSize: 11, color: '#78716c' }}>{o.customer.phone}</span>}
                      </div>
                    </td>
                    {/* Item thumbnails */}
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {(o.items || []).slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} style={{
                            width: 36, height: 36, borderRadius: 7,
                            border: '1px solid #e5e7eb', overflow: 'hidden',
                            background: '#f5f5f4', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                          }}>
                            {item.imageUrl
                              ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : '🛍️'}
                          </div>
                        ))}
                        {(o.items?.length || 0) > 3 && (
                          <span style={{ fontSize: 11, color: '#78716c', fontWeight: 700 }}>
                            +{o.items.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: '#c2410c', fontSize: 13 }}>
                      RWF {Number(o.total).toLocaleString()}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="admin-status-select"
                        value={o.status}
                        disabled={updating === o._id}
                        onChange={e => onStatusChange(o._id, e.target.value)}
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: '#78716c' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="admin-action-btns">
                        <button className="admin-btn-view" title="View details" onClick={() => setSelected(o)}>👁️</button>
                        <button className="admin-btn-edit" title="Add note" onClick={() => setNoteOrder(o)}>📝</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
