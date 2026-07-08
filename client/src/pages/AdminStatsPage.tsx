import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminStats } from '../services/admin';

export default function AdminStatsPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function Inner() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [stats, setStats]     = useState<any>(null);

  useEffect(() => {
    let ok = true;
    fetchAdminStats()
      .then(d => { if (ok) setStats(d); })
      .catch(e => { if (ok) setError(e?.message || 'Failed'); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const statCards = stats ? [
    { icon:'💰', label:'Total Revenue',  value:`RWF ${Number(stats.totalSales||0).toLocaleString()}`,  change:'+12%', up:true  },
    { icon:'📦', label:'Total Orders',   value: String(stats.totalOrders || stats.orderCount || 0),    change:'+8%',  up:true  },
    { icon:'👥', label:'Customers',      value: String(stats.userCount || 0),                          change:'+5%',  up:true  },
    { icon:'🛍️', label:'Active Products',value: String(stats.productCount || 0),                       change:'live', up:true  },
  ] : [];

  const statusClass: Record<string,string> = {
    Pending:'status-pending', Confirmed:'status-confirmed',
    Delivered:'status-delivered', Cancelled:'status-cancelled',
    Packaging:'status-confirmed', Shipped:'status-confirmed',
  };

  return (
    <>
      <div className="accent-bar" />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <div className="h1" style={{ marginBottom:4 }}>Dashboard</div>
          <p className="p">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/products" className="btn">🛍️ View Store</Link>
        </div>
      </div>

      {loading && <div className="dash-grid">{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:110}}/>)}</div>}
      {error   && <div className="badge" style={{borderColor:'rgba(220,38,38,.3)',color:'#dc2626',background:'rgba(220,38,38,.08)',marginBottom:16}}>⚠️ {error}</div>}

      {stats && (
        <>
          {/* Stat cards */}
          <div className="dash-grid">
            {statCards.map(s => (
              <div key={s.label} className="dash-stat">
                <div className="dash-stat-icon">{s.icon}</div>
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
                <div className={`dash-stat-change ${s.up?'up':'down'}`}>{s.up?'▲':'▼'} {s.change}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,margin:'20px 0'}}>
            {[
              {label:'📦 Orders',    to:'/admin/orders',   c:'#c2410c'},
              {label:'🛍️ Products',  to:'/admin/products', c:'#d97706'},
              {label:'👥 Customers', to:'/admin/customers',c:'#15803d'},
              {label:'⭐ Reviews',   to:'/admin/reviews',  c:'#1d4ed8'},
            ].map(l=>(
              <Link key={l.to} to={l.to} className="btn"
                style={{borderColor:l.c+'44',color:l.c,background:l.c+'11',justifyContent:'center',fontWeight:700}}>
                {l.label}
              </Link>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {/* Best sellers */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">🏆 Best Sellers</div>
              </div>
              {stats.topProducts?.length ? (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {stats.topProducts.map((p:any,i:number)=>(
                      <tr key={p._id}>
                        <td style={{color:'var(--muted)',fontWeight:700}}>{i+1}</td>
                        <td style={{fontWeight:700}}>{p.name}</td>
                        <td><span className="badge">{p.qty}</span></td>
                        <td style={{fontWeight:700,color:'#c2410c'}}>RWF {Number(p.revenue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div style={{padding:20}} className="small">No sales data yet.</div>}
            </div>

            {/* Recent orders */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">🕐 Recent Orders</div>
                <Link to="/admin/orders" className="btn" style={{padding:'6px 12px',fontSize:12}}>View all</Link>
              </div>
              {stats.recentOrders?.length ? (
                <table className="dash-table">
                  <thead><tr><th>Order</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recentOrders.map((o:any)=>(
                      <tr key={o._id}>
                        <td style={{fontWeight:700,fontSize:12}}>#{String(o._id).slice(-6).toUpperCase()}</td>
                        <td style={{fontWeight:700}}>RWF {Number(o.total).toLocaleString()}</td>
                        <td><span className={`status-badge ${statusClass[o.status]||'status-pending'}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div style={{padding:20}} className="small">No orders yet.</div>}
            </div>
          </div>
        </>
      )}
    </>
  );
}
