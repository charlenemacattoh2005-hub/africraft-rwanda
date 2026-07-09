import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchRiderStats, fetchRiderDeliveries, updateDeliveryStatus } from '../services/admin';
import { getAuthPayload } from '../services/api';

export default function RiderDashboardPage() {
  return (
    <RequireAuth roles={['rider', 'admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const STATUS_FLOW: Record<string, string> = {
  shipped: 'out_for_delivery',
  out_for_delivery: 'delivered',
};
const STATUS_LABELS: Record<string, string> = {
  shipped: 'Picked Up', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
};

function Inner() {
  const [tab,        setTab]       = useState<'active' | 'history' | 'earnings'>('active');
  const [stats,      setStats]     = useState<any>(null);
  const [deliveries, setDeliveries]= useState<any[]>([]);
  const [history,    setHistory]   = useState<any[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [updating,   setUpdating]  = useState<string | null>(null);
  const [toast,      setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const payload  = getAuthPayload();
  const riderName = payload?.name || payload?.email || 'Rider';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRiderStats(),
      fetchRiderDeliveries('shipped,out_for_delivery'),
      fetchRiderDeliveries('delivered'),
    ])
      .then(([s, active, done]) => {
        setStats(s);
        setDeliveries(active.orders || []);
        setHistory(done.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  async function onAdvance(order: any) {
    const next = STATUS_FLOW[order.status];
    if (!next) return;
    setUpdating(order._id);
    try {
      const res = await updateDeliveryStatus(order._id, next);
      if (res.order) {
        if (next === 'delivered') {
          setDeliveries(p => p.filter(o => o._id !== order._id));
          setHistory(p => [res.order, ...p]);
        } else {
          setDeliveries(p => p.map(o => o._id === order._id ? res.order : o));
        }
        showToast(`Status updated to ${STATUS_LABELS[next] || next}`);
      } else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setUpdating(null); }
  }

  const total     = stats?.total     || 0;
  const delivered = stats?.delivered || 0;
  const pending   = stats?.pending   || 0;
  const earnings  = stats?.earnings  || 0;

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}

      {/* Earnings card */}
      <div className="rider-earnings-card">
        <div className="rider-earnings-label">Total Earnings</div>
        <div className="rider-earnings-amount">RWF {Number(earnings).toLocaleString()}</div>
        <div className="rider-earnings-grid">
          <div className="rider-earnings-stat">
            <div className="rider-earnings-stat-val">{delivered}</div>
            <div className="rider-earnings-stat-label">Completed</div>
          </div>
          <div className="rider-earnings-stat">
            <div className="rider-earnings-stat-val">{pending}</div>
            <div className="rider-earnings-stat-label">In Progress</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="rider-kpi-row">
        {[
          { icon: '🗺️', label: 'Total Deliveries', value: total },
          { icon: '✅', label: 'Completed',         value: delivered },
          { icon: '🚴', label: 'In Progress',       value: pending },
          { icon: '💰', label: 'Earnings (RWF)',    value: Number(earnings).toLocaleString() },
        ].map(k => (
          <div key={k.label} className="rider-kpi">
            <div className="rider-kpi-icon">{k.icon}</div>
            <div className="rider-kpi-val">{k.value}</div>
            <div className="rider-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="vendor-tabs" style={{ marginBottom: 20 }}>
        <button className={`vendor-tab${tab === 'active'   ? ' active' : ''}`} onClick={() => setTab('active')}>
          🚴 Active ({deliveries.length})
        </button>
        <button className={`vendor-tab${tab === 'history'  ? ' active' : ''}`} onClick={() => setTab('history')}>
          📋 History ({history.length})
        </button>
        <button className={`vendor-tab${tab === 'earnings' ? ' active' : ''}`} onClick={() => setTab('earnings')}>
          💰 Earnings
        </button>
      </div>

      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />}

      {!loading && tab === 'active' && (
        <>
          {deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#a8a29e' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛵</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>No active deliveries</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>New deliveries will appear here when assigned.</div>
            </div>
          ) : (
            <div className="delivery-grid">
              {deliveries.map(o => (
                <div key={o._id} className="delivery-card">
                  <div className="delivery-card-header">
                    <span className="delivery-id">#{String(o._id).slice(-8).toUpperCase()}</span>
                    <span className={`status-badge status-${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span>
                  </div>
                  <div className="delivery-card-body">
                    <div className="delivery-address">📍 {o.customer?.address || 'Address not specified'}</div>
                    <div className="delivery-meta">👤 {o.customer?.fullName || 'Customer'}</div>
                    <div className="delivery-meta">📞 {o.customer?.phone || '—'}</div>
                    <div className="delivery-meta">📦 {o.items?.length || 0} item(s) · RWF {Number(o.total).toLocaleString()}</div>
                    {o.customer?.deliveryNotes && (
                      <div style={{ fontSize: 11, color: '#d97706', background: '#fffbeb', padding: '5px 10px', borderRadius: 6, marginTop: 6 }}>
                        📝 {o.customer.deliveryNotes}
                      </div>
                    )}
                  </div>
                  {STATUS_FLOW[o.status] && (
                    <div className="delivery-card-actions">
                      <button className="btn primary" style={{ width: '100%', fontSize: 13 }}
                        disabled={updating === o._id}
                        onClick={() => onAdvance(o)}>
                        {updating === o._id ? 'Updating…' : o.status === 'shipped' ? '🚴 Start Delivery' : '✅ Mark Delivered'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && tab === 'history' && (
        <div className="dash-card">
          <div className="dash-card-header"><div className="dash-card-title">Delivery History ({history.length})</div></div>
          <table className="dash-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Address</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={5} className="dash-table-empty">No completed deliveries yet.</td></tr>}
              {history.map(o => (
                <tr key={o._id}>
                  <td><span className="admin-order-id-cell">#{String(o._id).slice(-8).toUpperCase()}</span></td>
                  <td>{o.customer?.fullName || '—'}</td>
                  <td style={{ fontSize: 12, color: '#78716c', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.customer?.address || '—'}
                  </td>
                  <td className="admin-price-cell">RWF {Number(o.total).toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'earnings' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(194,65,12,.09)', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Earnings Summary</div>
            {[
              { label: 'Total Deliveries Completed', value: delivered, unit: '' },
              { label: 'Earnings per Delivery',      value: '2,000', unit: 'RWF' },
              { label: 'Total Gross Earnings',       value: Number(earnings).toLocaleString(), unit: 'RWF' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(194,65,12,.06)' }}>
                <span style={{ fontSize: 13, color: '#78716c' }}>{r.label}</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#1c1917' }}>{r.unit && <span style={{ fontSize: 11, color: '#a8a29e', marginRight: 3 }}>{r.unit}</span>}{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
