import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminOrders, updateOrderStatus } from '../services/admin';

const STATUSES = ['Pending','Confirmed','Packaging','Shipped','Delivered','Cancelled'];
const statusClass: Record<string,string> = {
  Pending:'status-pending', Confirmed:'status-confirmed', Packaging:'status-confirmed',
  Shipped:'status-confirmed', Delivered:'status-delivered', Cancelled:'status-cancelled',
};

export default function OrdersAdminPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function Inner() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string|null>(null);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [updating,setUpdating]= useState<string|null>(null);

  useEffect(() => {
    let ok = true;
    fetchAdminOrders()
      .then(d => { if (ok) setOrders(d.orders || []); })
      .catch(e => { if (ok) setError(e?.message || 'Failed to load orders'); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  async function onStatusChange(id: string, status: string) {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch = search === '' || String(o._id).toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div className="accent-bar" />
      <div className="h1" style={{marginBottom:4}}>Orders</div>
      <p className="p" style={{marginBottom:20}}>Manage and update all customer orders.</p>

      {/* Filters */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
        <input className="input" style={{maxWidth:260}} placeholder="Search by order ID or customer…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="input" style={{maxWidth:160}} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <div className="badge" style={{alignSelf:'center'}}>{filtered.length} orders</div>
      </div>

      {loading && <div className="skeleton" style={{height:200}} />}
      {error   && <div className="badge" style={{borderColor:'rgba(220,38,38,.3)',color:'#dc2626',background:'rgba(220,38,38,.08)'}}>{error}</div>}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Date</th>
                <th>Items</th><th>Total</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',padding:24,color:'var(--muted)'}}>No orders found.</td></tr>
              )}
              {filtered.map(o => (
                <tr key={o._id}>
                  <td style={{fontWeight:700,fontSize:12}}>#{String(o._id).slice(-8).toUpperCase()}</td>
                  <td>
                    <div style={{fontWeight:600}}>{o.customer?.fullName || '—'}</div>
                    <div className="small">{o.customer?.email || ''}</div>
                  </td>
                  <td className="small">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge">{o.items?.length || 0}</span></td>
                  <td style={{fontWeight:700,color:'#c2410c'}}>RWF {Number(o.total).toLocaleString()}</td>
                  <td><span className={`status-badge ${statusClass[o.status]||'status-pending'}`}>{o.status}</span></td>
                  <td>
                    <select
                      className="input" style={{width:130,padding:'6px 10px',fontSize:12}}
                      value={o.status}
                      disabled={updating === o._id}
                      onChange={e => onStatusChange(o._id, e.target.value)}
                    >
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
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
