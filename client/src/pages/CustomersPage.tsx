import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminCustomers, fetchAdminOrders } from '../services/admin';

export default function CustomersPage() {
  return <RequireAuth roles={['admin']}><AdminLayout><Inner /></AdminLayout></RequireAuth>;
}

function CustomerDrawer({ customer, orders, onClose }: { customer: any; orders: any[]; onClose: () => void }) {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const customerOrders = orders.filter(o => o.customer?.email === customer.email);
  const totalSpent = customerOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const initials = (customer.fullName || customer.email || '?')[0].toUpperCase();

  return (
    <div className="order-drawer-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="order-drawer">
        <div className="order-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="cust-drawer-avatar">{initials}</div>
            <div>
              <div className="order-drawer-title">{customer.fullName || '—'}</div>
              <div style={{ fontSize: 12, color: '#78716c' }}>{customer.email}</div>
            </div>
          </div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="order-drawer-body">
          {/* Stats */}
          <div className="cust-stats-row">
            <div className="cust-stat"><div className="cust-stat-val">{customerOrders.length}</div><div className="cust-stat-label">Orders</div></div>
            <div className="cust-stat"><div className="cust-stat-val">RWF {totalSpent.toLocaleString()}</div><div className="cust-stat-label">Total Spent</div></div>
            <div className="cust-stat"><div className="cust-stat-val">{new Date(customer.createdAt).toLocaleDateString()}</div><div className="cust-stat-label">Joined</div></div>
          </div>

          {/* Contact */}
          <div className="order-section">
            <div className="order-section-title">📞 Contact Details</div>
            <div className="order-info-grid">
              <div className="order-info-item"><span>Phone</span><strong>{customer.phone || '—'}</strong></div>
              <div className="order-info-item"><span>Address</span><strong>{customer.address || '—'}</strong></div>
            </div>
          </div>

          {/* Order history */}
          <div className="order-section">
            <div className="order-section-title">📦 Order History</div>
            {customerOrders.length === 0 ? (
              <div className="dash-panel-empty">No orders yet.</div>
            ) : (
              <table className="dash-table" style={{ marginTop: 8 }}>
                <thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {customerOrders.map(o => (
                    <tr key={o._id}>
                      <td><span className="admin-order-id-cell">#{String(o._id).slice(-8).toUpperCase()}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="admin-price-cell">RWF {Number(o.total).toLocaleString()}</td>
                      <td><span className={`status-badge status-${o.status === 'completed' ? 'delivered' : o.status === 'cancelled' ? 'cancelled' : 'pending'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          <div className="order-section">
            <div className="order-section-title">📝 Admin Notes</div>
            {notes.map((n, i) => (
              <div key={i} className="cust-note">{n}</div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input className="input" style={{ flex: 1 }} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note…" onKeyDown={e => { if (e.key === 'Enter' && note.trim()) { setNotes(p => [...p, note.trim()]); setNote(''); } }} />
              <button className="btn primary" onClick={() => { if (note.trim()) { setNotes(p => [...p, note.trim()]); setNote(''); } }}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders,    setOrders]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState<any>(null);

  useEffect(() => {
    Promise.all([fetchAdminCustomers(), fetchAdminOrders()])
      .then(([cd, od]) => { setCustomers(cd.users || []); setOrders(od.orders || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    search === '' ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  function getSpend(c: any) {
    return orders.filter(o => o.customer?.email === c.email).reduce((s, o) => s + Number(o.total || 0), 0);
  }
  function getOrderCount(c: any) {
    return orders.filter(o => o.customer?.email === c.email).length;
  }

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Customers</div>
          <p className="admin-page-sub">View profiles, order history and spending for all customers.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 300 }} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <span className="admin-toolbar-count">{filtered.length} customers</span>
      </div>

      {selected && <CustomerDrawer customer={selected} orders={orders} onClose={() => setSelected(null)} />}

      {loading ? (
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      ) : (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="dash-table-empty">No customers found.</td></tr>}
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="admin-name-cell">
                      <div className="admin-avatar">{c.fullName?.[0]?.toUpperCase() || '?'}</div>
                      <span style={{ fontWeight: 700 }}>{c.fullName}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>{c.email}</td>
                  <td style={{ fontSize: 12 }}>{c.phone || '—'}</td>
                  <td><span className="admin-items-badge">{getOrderCount(c)}</span></td>
                  <td className="admin-price-cell">RWF {getSpend(c).toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td><button className="admin-btn-edit" onClick={() => setSelected(c)}>👁 View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
