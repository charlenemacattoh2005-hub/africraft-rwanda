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

type Range = 'today' | 'week' | 'month' | 'year';

const STATUS_CLASS: Record<string, string> = {
  pending:    'status-pending',
  confirmed:  'status-confirmed',
  paid:       'status-confirmed',
  processing: 'status-processing',
  shipped:    'status-shipped',
  completed:  'status-delivered',
  cancelled:  'status-cancelled',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function SkeletonKpi() {
  return (
    <div className="dash-kpi-grid">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
      ))}
    </div>
  );
}

function SkeletonRows({ n = 4 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="dash-skeleton-row">
          <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div className="skeleton" style={{ height: 11, width: '60%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 9, width: '40%', borderRadius: 4 }} />
          </div>
          <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 999 }} />
        </div>
      ))}
    </>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="dash-bar-chart">
      {data.map(d => (
        <div key={d.label} className="dash-bar-col">
          <div
            className="dash-bar"
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            title={`RWF ${d.value.toLocaleString()}`}
          >
            <span className="dash-bar-label">{d.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Inner() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [stats, setStats]     = useState<any>(null);
  const [range, setRange]     = useState<Range>('month');

  useEffect(() => {
    let ok = true;
    fetchAdminStats()
      .then(d => { if (ok) setStats(d); })
      .catch(e => { if (ok) setError(e?.message || 'Failed to load stats'); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  // Build chart data from recentOrders grouped by month
  const chartData = React.useMemo(() => {
    if (!stats?.recentOrders?.length) {
      return MONTHS.slice(0, 7).map(l => ({ label: l, value: 0 }));
    }
    const buckets: Record<string, number> = {};
    stats.recentOrders.forEach((o: any) => {
      const d = new Date(o.createdAt || o.date || Date.now());
      const key = MONTHS[d.getMonth()];
      buckets[key] = (buckets[key] || 0) + Number(o.total || 0);
    });
    return MONTHS.slice(0, 8).map(l => ({ label: l, value: buckets[l] || 0 }));
  }, [stats]);

  const totalRevenue  = Number(stats?.totalSales || 0);
  const totalOrders   = Number(stats?.totalOrders || stats?.orderCount || 0);
  const totalCustomers= Number(stats?.userCount || 0);
  const totalProducts = Number(stats?.productCount || 0);
  const pendingOrders = stats?.recentOrders?.filter((o: any) => o.status === 'pending').length ?? 0;
  const lowStockItems = stats?.lowStock?.length ?? 0;

  const kpiCards = [
    {
      cls: 'kpi-revenue',
      icon: '💰',
      label: 'Total Revenue',
      value: `RWF ${totalRevenue.toLocaleString()}`,
      change: '+12%', up: true,
      sub: 'vs last period',
    },
    {
      cls: 'kpi-orders',
      icon: '📦',
      label: 'Total Orders',
      value: String(totalOrders),
      change: '+8%', up: true,
      sub: 'all time',
    },
    {
      cls: 'kpi-customers',
      icon: '👥',
      label: 'Total Customers',
      value: String(totalCustomers),
      change: '+5%', up: true,
      sub: 'registered users',
    },
    {
      cls: 'kpi-products',
      icon: '🛍️',
      label: 'Total Products',
      value: String(totalProducts),
      change: 'live', up: true,
      sub: 'active listings',
    },
    {
      cls: 'kpi-pending',
      icon: '⏳',
      label: 'Pending Orders',
      value: String(pendingOrders),
      change: pendingOrders > 0 ? 'needs action' : 'all clear',
      up: pendingOrders === 0,
      sub: 'awaiting processing',
    },
    {
      cls: 'kpi-lowstock',
      icon: '⚠️',
      label: 'Low Stock Items',
      value: String(lowStockItems),
      change: lowStockItems > 0 ? 'restock soon' : 'all good',
      up: lowStockItems === 0,
      sub: 'below threshold',
    },
  ];

  const orderStatusCounts = React.useMemo(() => {
    if (!stats?.recentOrders) return [];
    const counts: Record<string, number> = {};
    stats.recentOrders.forEach((o: any) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    const colors: Record<string, string> = {
      pending: '#d97706', confirmed: '#1d4ed8', paid: '#1d4ed8',
      shipped: '#0891b2', completed: '#15803d', cancelled: '#dc2626',
    };
    return Object.entries(counts).map(([name, count]) => ({
      name, count, color: colors[name] || '#6b7280',
    }));
  }, [stats]);

  const RANGES: { key: Range; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week',  label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year',  label: 'This Year' },
  ];

  return (
    <>
      <div className="accent-bar" />

      {/* ── Page header ── */}
      <div className="dash-page-header">
        <div>
          <div className="dash-page-title">Dashboard</div>
          <p className="dash-page-sub">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="dash-header-actions">
          <div className="dash-range-tabs">
            {RANGES.map(r => (
              <button
                key={r.key}
                className={`dash-range-tab${range === r.key ? ' active' : ''}`}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Link to="/products" className="btn">🛍️ View Store</Link>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="badge" style={{ borderColor: 'rgba(220,38,38,.3)', color: '#dc2626', background: 'rgba(220,38,38,.08)', marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      {loading ? <SkeletonKpi /> : (
        <div className="dash-kpi-grid">
          {kpiCards.map(c => (
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

      {/* ── Main grid: chart + side panels ── */}
      {!loading && stats && (
        <>
          <div className="dash-main-grid">
            {/* Revenue chart */}
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <div>
                  <div className="dash-chart-title">📈 Sales Analytics</div>
                  <div className="dash-chart-subtitle">Revenue trend by month</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', background: 'rgba(21,128,61,.1)', padding: '3px 10px', borderRadius: 999 }}>
                  ▲ +12% overall
                </span>
              </div>
              <div className="dash-chart-body">
                <BarChart data={chartData} />
              </div>
              {/* Order status breakdown */}
              {orderStatusCounts.length > 0 && (
                <div className="dash-status-row">
                  {orderStatusCounts.map(s => (
                    <div key={s.name} className="dash-status-item">
                      <div className="dash-status-dot" style={{ background: s.color }} />
                      <div className="dash-status-count">{s.count}</div>
                      <div className="dash-status-name">{s.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side: Recent Orders */}
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
                        <div className="dash-order-date">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="dash-order-customer">{o.customer?.fullName || 'Customer'}</div>
                        <div className="dash-order-amount">RWF {Number(o.total).toLocaleString()}</div>
                      </div>
                      <span className={`status-badge ${STATUS_CLASS[o.status] || 'status-pending'}`}>
                        {o.status}
                      </span>
                    </div>
                  )) : <div className="dash-panel-empty">No orders yet.</div>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom grid: Products, Alerts, Customers ── */}
          <div className="dash-bottom-grid">
            {/* Best-selling products */}
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
                        : <div className="dash-product-img-placeholder">🛍️</div>
                      }
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

            {/* Low stock alerts */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <span className="dash-panel-title">⚠️ Inventory Alerts</span>
                <Link to="/admin/products" className="dash-panel-link">Restock</Link>
              </div>
              <div className="dash-panel-body">
                {stats.lowStock?.length ? stats.lowStock.map((p: any) => {
                  const isOut = p.stock === 0;
                  return (
                    <div key={p._id} className="dash-alert-row">
                      <div className={`dash-alert-dot ${isOut ? 'out' : 'low'}`} />
                      <span className="dash-alert-name">{p.name}</span>
                      <span className={`dash-alert-stock ${isOut ? 'out' : 'low'}`}>
                        {isOut ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="dash-panel-empty">
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    All products are well stocked.
                  </div>
                )}
              </div>
            </div>

            {/* Customer activity */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <span className="dash-panel-title">👥 Customer Activity</span>
                <Link to="/admin/customers" className="dash-panel-link">View all</Link>
              </div>
              <div className="dash-panel-body">
                {stats.recentCustomers?.length ? stats.recentCustomers.slice(0, 6).map((c: any) => {
                  const name = c.fullName || c.email || 'User';
                  const initials = name[0].toUpperCase();
                  return (
                    <div key={c._id} className="dash-customer-row">
                      <div className="dash-customer-avatar">{initials}</div>
                      <div className="dash-customer-info">
                        <div className="dash-customer-name">{name}</div>
                        <div className="dash-customer-email">{c.email}</div>
                      </div>
                      <div className="dash-customer-date">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  );
                }) : (
                  stats.recentOrders?.slice(0, 5).map((o: any) => {
                    const name = o.customer?.fullName || 'Customer';
                    return (
                      <div key={o._id} className="dash-customer-row">
                        <div className="dash-customer-avatar">{name[0].toUpperCase()}</div>
                        <div className="dash-customer-info">
                          <div className="dash-customer-name">{name}</div>
                          <div className="dash-customer-email">Order #{String(o._id).slice(-6).toUpperCase()}</div>
                        </div>
                        <div className="dash-customer-date">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    );
                  }) || <div className="dash-panel-empty">No customer data yet.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading skeleton for panels */}
      {loading && (
        <div className="dash-bottom-grid">
          {[1,2,3].map(i => (
            <div key={i} className="dash-panel">
              <div className="dash-panel-header">
                <div className="skeleton" style={{ height: 14, width: 120, borderRadius: 4 }} />
              </div>
              <div className="dash-panel-body"><SkeletonRows /></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
