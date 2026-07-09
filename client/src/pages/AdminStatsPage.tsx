import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminStats, fetchActivityLog } from '../services/admin';

export default function AdminStatsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', paid: 'status-paid',
  processing: 'status-processing', packed: 'status-packed', shipped: 'status-shipped',
  out_for_delivery: 'status-out_for_delivery', delivered: 'status-delivered',
  completed: 'status-completed', cancelled: 'status-cancelled',
  returned: 'status-returned', refunded: 'status-refunded',
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="dash-bar-chart">
      {data.map(d => (
        <div key={d.label} className="dash-bar-col">
          <div className="dash-bar" style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            title={`RWF ${d.value.toLocaleString()}`}>
            <span className="dash-bar-label">{d.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="dash-kpi-grid">
      {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
    </div>
  );
}

function Inner() {
  const [stats,    setStats]    = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    Promise.all([fetchAdminStats(), fetchActivityLog()])
      .then(([s, a]) => { if (!ok) return; setStats(s); setActivity(a?.log || []); })
      .catch(e => { if (ok) { setError(e?.message || 'Failed to load dashboard'); setLoading(false); } })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const chartData = React.useMemo(() => {
    if (!stats?.recentOrders?.length)
      return MONTHS.slice(0, 7).map(l => ({ label: l, value: 0 }));
    const buckets: Record<string, number> = {};
    stats.recentOrders.forEach((o: any) => {
      const key = MONTHS[new Date(o.createdAt || Date.now()).getMonth()];
      buckets[key] = (buckets[key] || 0) + Number(o.total || 0);
    });
    return MONTHS.slice(0, 8).map(l => ({ label: l, value: buckets[l] || 0 }));
  }, [stats]);

  const statusCounts = React.useMemo(() => {
    if (!stats?.recentOrders) return [];
    const counts: Record<string, number> = {};
    stats.recentOrders.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    const colors: Record<string, string> = {
      pending: '#f59e0b', confirmed: '#3b82f6', paid: '#6366f1',
      shipped: '#0891b2', completed: '#15803d', cancelled: '#ef4444',
      delivered: '#22c55e', returned: '#f97316',
    };
    return Object.entries(counts).map(([name, count]) => ({
      name, count, color: colors[name] || '#6b7280',
    }));
  }, [stats]);

  const totalRevenue   = Number(stats?.totalSales || 0);
  const totalOrders    = Number(stats?.totalOrders || 0);
  const totalCustomers = Number(stats?.userCount || 0);
  const totalProducts  = Number(stats?.productCount || 0);
  const pendingOrders  = stats?.recentOrders?.filter((o: any) => o.status === 'pending').length ?? 0;
  const lowStockCount  = stats?.lowStock?.length ?? 0;

  const kpis = [
    { cls: 'kpi-revenue',   icon: '💰', label: 'Total Revenue',   value: `RWF ${totalRevenue.toLocaleString()}`,  change: '+12%',  up: true,  sub: 'all time' },
    { cls: 'kpi-orders',    icon: '📦', label: 'Total Orders',    value: String(totalOrders),    change: '+8%',   up: true,  sub: 'all time' },
    { cls: 'kpi-customers', icon: '👥', label: 'Customers',       value: String(totalCustomers), change: '+5%',   up: true,  sub: 'registered' },
    { cls: 'kpi-products',  icon: '🛍️', label: 'Products',        value: String(totalProducts),  change: 'live',  up: true,  sub: 'active listings' },
    { cls: 'kpi-pending',   icon: '⏳', label: 'Pending Orders',  value: String(pendingOrders),  change: pendingOrders > 0 ? 'action needed' : 'all clear', up: pendingOrders === 0, sub: 'awaiting' },
    { cls: 'kpi-lowstock',  icon: '⚠️', label: 'Low Stock',       value: String(lowStockCount),  change: lowStockCount > 0 ? 'restock' : 'all good', up: lowStockCount === 0, sub: 'below threshold' },
  ];

  return (
    <>
      <div className="accent-bar" />

      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">Dashboard Overview</div>
          <p className="dash-page-sub">Real-time platform metrics and activity.</p>
        </div>
        <div className="dash-header-actions">
          <Link to="/admin/products/new" className="btn primary" style={{ fontSize: 13 }}>＋ Add Product</Link>
          <Link to="/admin/orders" className="btn" style={{ fontSize: 13 }}>View Orders</Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-quick-actions">
        {[
          { to: '/admin/products/new', icon: '📦', label: 'Add Product' },
          { to: '/admin/users/create', icon: '👤', label: 'Add User'    },
          { to: '/admin/orders',       icon: '🧾', label: 'All Orders'  },
          { to: '/admin/inventory',    icon: '📊', label: 'Inventory'   },
          { to: '/admin/promotions/coupons', icon: '🎁', label: 'Coupons' },
          { to: '/admin/analytics',    icon: '📈', label: 'Analytics'   },
        ].map(a => (
          <Link key={a.to} to={a.to} className="admin-quick-action-btn">
            <span>{a.icon}</span>{a.label}
          </Link>
        ))}
      </div>

      {error && <div className="admin-error-banner">⚠️ {error} — showing cached data if available.</div>}

      {/* KPI Cards */}
      {loading ? <KpiSkeleton /> : (
        <div className="dash-kpi-grid">
          {kpis.map(c => (
            <div key={c.label} className={`dash-kpi ${c.cls}`}>
              <div className="dash-kpi-stripe" />
              <div className="dash-kpi-top">
                <div className="dash-kpi-icon">{c.icon}</div>
                <span className={`dash-kpi-change ${c.up ? 'up' : 'down'}`}>
                  {c.up ? '▲' : '▼'} {c.change}
                </span>
              </div>
              <div className="dash-kpi-value">{c.value}</div>
              <div className="dash-kpi-label">{c.label}</div>
              <div className="dash-kpi-sub">{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Chart + recent orders */}
          <div className="dash-main-grid">
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <div>
                  <div className="dash-chart-title">📈 Revenue by Month</div>
                  <div className="dash-chart-subtitle">Sales trend from recent orders</div>
                </div>
              </div>
              <div className="dash-chart-body"><BarChart data={chartData} /></div>
              {statusCounts.length > 0 && (
                <div className="dash-status-row">
                  {statusCounts.map(s => (
                    <div key={s.name} className="dash-status-item">
                      <div className="dash-status-dot" style={{ background: s.color }} />
                      <div className="dash-status-count">{s.count}</div>
                      <div className="dash-status-name">{s.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-side-grid">
              <div className="dash-panel">
                <div className="dash-panel-header">
                  <span className="dash-panel-title">🕐 Recent Orders</span>
                  <Link to="/admin/orders" className="dash-panel-link">View all</Link>
                </div>
                <div className="dash-panel-body">
                  {stats.recentOrders?.length ? stats.recentOrders.slice(0, 6).map((o: any) => (
                    <div key={o._id} className="dash-order-row">
                      <div>
                        <div className="dash-order-id">#{String(o._id).slice(-6).toUpperCase()}</div>
                        <div className="dash-order-date">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</div>
                      </div>
                      <div>
                        <div className="dash-order-customer">{o.customer?.fullName || 'Customer'}</div>
                        <div className="dash-order-amount">RWF {Number(o.total).toLocaleString()}</div>
                      </div>
                      <span className={`status-badge ${STATUS_CLASS[o.status] || 'status-pending'}`}>{o.status}</span>
                    </div>
                  )) : <div className="dash-panel-empty">No orders yet.</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom grid */}
          <div className="dash-bottom-grid">
            {/* Top products */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <span className="dash-panel-title">🏆 Top Products</span>
                <Link to="/admin/products" className="dash-panel-link">Manage</Link>
              </div>
              <div className="dash-panel-body">
                {stats.topProducts?.length ? stats.topProducts.map((p: any, i: number) => {
                  const maxQty = stats.topProducts[0]?.qty || 1;
                  return (
                    <div key={p._id} className="dash-product-row">
                      <div className="dash-product-rank">{i + 1}</div>
                      {p.image
                        ? <img src={p.image} alt={p.name} className="dash-product-img" />
                        : <div className="dash-product-img-placeholder">🛍️</div>}
                      <div className="dash-product-info">
                        <div className="dash-product-name">{p.name}</div>
                        <div className="dash-rank-bar-wrap">
                          <div className="dash-rank-bar" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                        </div>
                        <div className="dash-product-meta">{p.qty} sold</div>
                      </div>
                      <div className="dash-product-revenue">RWF {Number(p.revenue).toLocaleString()}</div>
                    </div>
                  );
                }) : <div className="dash-panel-empty">No sales data yet.</div>}
              </div>
            </div>

            {/* Low stock */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <span className="dash-panel-title">⚠️ Inventory Alerts</span>
                <Link to="/admin/inventory" className="dash-panel-link">Restock</Link>
              </div>
              <div className="dash-panel-body">
                {stats.lowStock?.length ? stats.lowStock.map((p: any) => (
                  <div key={p._id} className="dash-alert-row">
                    <div className={`dash-alert-dot ${p.stock === 0 ? 'out' : 'low'}`} />
                    <span className="dash-alert-name">{p.name}</span>
                    <span className={`dash-alert-stock ${p.stock === 0 ? 'out' : 'low'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </div>
                )) : (
                  <div className="dash-panel-empty">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    All products well stocked.
                  </div>
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <span className="dash-panel-title">📋 Activity Feed</span>
                <Link to="/admin/orders" className="dash-panel-link">View orders</Link>
              </div>
              <div className="dash-panel-body">
                {activity.length ? activity.slice(0, 8).map((a: any, i: number) => (
                  <div key={i} className="dash-customer-row">
                    <div className="dash-customer-avatar" style={{
                      background: a.type === 'order' ? 'linear-gradient(135deg,#c2410c,#f97316)'
                        : 'linear-gradient(135deg,#15803d,#4ade80)',
                      fontSize: 12,
                    }}>
                      {a.type === 'order' ? '📦' : '👤'}
                    </div>
                    <div className="dash-customer-info">
                      <div className="dash-customer-name" style={{ fontSize: 12 }}>{a.message}</div>
                      <div className="dash-customer-email">{a.time ? new Date(a.time).toLocaleString() : ''}</div>
                    </div>
                    {a.status && (
                      <span className={`status-badge ${STATUS_CLASS[a.status] || 'status-pending'}`} style={{ fontSize: 10 }}>
                        {a.status}
                      </span>
                    )}
                  </div>
                )) : (
                  <div className="dash-panel-empty">No recent activity.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="dash-bottom-grid">
          {[1,2,3].map(i => (
            <div key={i} className="dash-panel">
              <div className="dash-panel-header"><div className="skeleton" style={{ height: 14, width: 120, borderRadius: 4 }} /></div>
              <div className="dash-panel-body">
                {[1,2,3,4].map(j => (
                  <div key={j} className="dash-skeleton-row">
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div className="skeleton" style={{ height: 11, width: '60%', borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 9, width: '40%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
