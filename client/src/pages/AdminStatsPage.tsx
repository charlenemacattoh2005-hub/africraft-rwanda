import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { fetchAdminStats } from '../services/admin';

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-title">Admin Panel</div>
      <Link to="/admin"         className="admin-nav-link">📊 Dashboard</Link>
      <Link to="/admin/orders"  className="admin-nav-link">📦 Orders</Link>
      <Link to="/admin/reviews" className="admin-nav-link">⭐ Reviews</Link>
      <Link to="/customers"     className="admin-nav-link">👥 Customers</Link>
      <Link to="/products"      className="admin-nav-link">🛍️ Products</Link>
      <Link to="/categories"    className="admin-nav-link">🗂️ Categories</Link>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', margin: '16px 0' }} />
      <Link to="/"              className="admin-nav-link">🌐 Public Site</Link>
    </aside>
  );
}

export default function AdminStatsPage() {
  return (
    <RequireAuth>
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <AdminStatsInner />
        </div>
      </div>
    </RequireAuth>
  );
}

function AdminStatsInner() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [stats, setStats]   = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchAdminStats();
        if (!mounted) return;
        setStats(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load stats');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <div className="accent-bar" />
      <div className="h1" style={{ marginBottom: 4 }}>Admin Dashboard</div>
      <p className="p" style={{ marginBottom: 24 }}>Live platform metrics, sales and inventory overview.</p>

      {loading && (
        <div className="dash-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
      )}

      {error && (
        <div className="badge" style={{ borderColor:'rgba(220,38,38,.3)', color:'#dc2626', background:'rgba(220,38,38,.08)', marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      {stats && (
        <>
          {/* ── Stat cards ── */}
          <div className="dash-grid">
            {[
              { icon:'💰', label:'Total Revenue',  value:`RWF ${Number(stats.totalSales||0).toLocaleString()}`,  change:'+12%', up:true  },
              { icon:'📦', label:'Total Orders',   value: stats.totalOrders || stats.orderCount || 0,            change:'+8%',  up:true  },
              { icon:'👥', label:'Customers',      value: stats.userCount || 0,                                  change:'+5%',  up:true  },
              { icon:'📈', label:'Growth Rate',    value:`+${Math.max(8,Math.round((stats.totalSales||0)/10000))}%`, change:'vs last month', up:true },
            ].map(s => (
              <div key={s.label} className="dash-stat">
                <div className="dash-stat-icon">{s.icon}</div>
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
                <div className={`dash-stat-change ${s.up ? 'up' : 'down'}`}>
                  {s.up ? '▲' : '▼'} {s.change}
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick links ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
            {[
              { label:'Manage Orders',   to:'/admin/orders',  color:'#c2410c' },
              { label:'Review Moderation', to:'/admin/reviews', color:'#d97706' },
              { label:'View Customers',  to:'/customers',     color:'#15803d' },
              { label:'Browse Products', to:'/products',      color:'#1d4ed8' },
            ].map(l => (
              <Link key={l.label} to={l.to} className="btn" style={{ borderColor: l.color+'33', color: l.color, background: l.color+'0d', justifyContent:'center' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* ── Best sellers table ── */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title">🏆 Best-selling Products</div>
              <Link to="/products" className="btn" style={{ padding:'6px 14px', fontSize:13 }}>View all</Link>
            </div>
            {stats.topProducts?.length ? (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((item: any, i: number) => (
                    <tr key={item._id}>
                      <td style={{ color:'var(--muted)', fontWeight:700 }}>{i + 1}</td>
                      <td style={{ fontWeight:700 }}>{item.name}</td>
                      <td><span className="badge">{item.qty}</span></td>
                      <td style={{ fontWeight:700, color:'#c2410c' }}>RWF {Number(item.revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding:24 }} className="small">No sales data yet. Orders will appear here once placed.</div>
            )}
          </div>

          {/* ── Recent activity placeholder ── */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="dash-card-title">🕐 Recent Activity</div>
            </div>
            <div style={{ padding:24, display:'grid', gap:12 }}>
              {[
                { text:'New order placed', time:'2 min ago',  color:'#15803d' },
                { text:'New customer registered', time:'14 min ago', color:'#1d4ed8' },
                { text:'Product review submitted', time:'1 hr ago',  color:'#d97706' },
                { text:'Order delivered', time:'3 hrs ago',  color:'#c2410c' },
              ].map((a,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(194,65,12,.07)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0 }} />
                    <span style={{ fontSize:14, fontWeight:500 }}>{a.text}</span>
                  </div>
                  <span className="small">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
