import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchSiteStats } from '../services/admin';

export default function AdminAnalyticsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function pct(a: number, b: number) {
  if (!b) return '+0%';
  const d = ((a - b) / b) * 100;
  return (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
}

function BarChart({ data, color = '#f97316' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="an-bar-chart">
      {data.map(d => (
        <div key={d.label} className="an-bar-col">
          <div className="an-bar-wrap">
            <div className="an-bar" style={{ height: `${Math.max((d.value / max) * 100, 3)}%`, background: color }}
              title={`RWF ${d.value.toLocaleString()}`} />
          </div>
          <div className="an-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const R = 40; const C = 2 * Math.PI * R;
  return (
    <div className="an-donut-wrap">
      <svg viewBox="0 0 100 100" className="an-donut-svg">
        {data.map((d, i) => {
          const dash = (d.value / total) * C;
          const el = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth="18"
            strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />;
          offset += dash;
          return el;
        })}
        <circle cx="50" cy="50" r="28" fill="#fff" />
      </svg>
      <div className="an-donut-legend">
        {data.map(d => (
          <div key={d.label} className="an-legend-row">
            <span className="an-legend-dot" style={{ background: d.color }} />
            <span className="an-legend-label">{d.label}</span>
            <span className="an-legend-val">RWF {d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CAT_COLORS = ['#f97316','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#14b8a6','#ef4444'];

function Inner() {
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetchSiteStats()
      .then(d => setStats(d))
      .catch(e => setError(e?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const revenueGrowth = stats ? pct(stats.thisMonth?.revenue, stats.lastMonth?.revenue) : '—';
  const ordersGrowth  = stats ? pct(stats.thisMonth?.orders,  stats.lastMonth?.orders)  : '—';
  const revenueUp     = stats ? stats.thisMonth?.revenue >= stats.lastMonth?.revenue : true;
  const ordersUp      = stats ? stats.thisMonth?.orders  >= stats.lastMonth?.orders  : true;

  const dailyData = (stats?.ordersByDay || []).map((d: any) => ({ label: d._id?.slice(5) || '', value: d.revenue || 0 }));
  const catData   = (stats?.revenueByCategory || []).map((d: any, i: number) => ({
    label: d._id || 'Other', value: d.revenue || 0, color: CAT_COLORS[i % CAT_COLORS.length],
  }));

  const kpis = [
    { label: 'Total Revenue',     value: `RWF ${Number(stats?.totalRevenue || 0).toLocaleString()}`,        icon: '💰', cls: 'kpi-revenue' },
    { label: 'This Month',        value: `RWF ${Number(stats?.thisMonth?.revenue || 0).toLocaleString()}`,  icon: '📅', cls: 'kpi-orders',    change: revenueGrowth, up: revenueUp },
    { label: 'Total Orders',      value: String(stats?.totalOrders   || 0), icon: '📦', cls: 'kpi-customers' },
    { label: 'Orders This Month', value: String(stats?.thisMonth?.orders || 0), icon: '🛒', cls: 'kpi-products', change: ordersGrowth, up: ordersUp },
    { label: 'Customers',         value: String(stats?.totalUsers    || 0), icon: '👥', cls: 'kpi-pending' },
    { label: 'Active Products',   value: String(stats?.totalProducts || 0), icon: '🛍️', cls: 'kpi-lowstock' },
  ];

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Analytics</div>
          <p className="admin-page-sub">Revenue trends, category performance and order insights.</p>
        </div>
      </div>

      {error && <div className="admin-error-banner">⚠️ {error}</div>}

      {loading ? (
        <div className="dash-kpi-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
        </div>
      ) : (
        <>
          <div className="dash-kpi-grid" style={{ marginBottom: 24 }}>
            {kpis.map(k => (
              <div key={k.label} className={`dash-kpi ${k.cls}`}>
                <div className="dash-kpi-stripe" />
                <div className="dash-kpi-top">
                  <div className="dash-kpi-icon">{k.icon}</div>
                  {k.change && <span className={`dash-kpi-change ${k.up ? 'up' : 'down'}`}>{k.up ? '▲' : '▼'} {k.change}</span>}
                </div>
                <div className="dash-kpi-value">{k.value}</div>
                <div className="dash-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="an-charts-grid">
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <div>
                  <div className="dash-chart-title">📅 Daily Revenue (Last 30 Days)</div>
                  <div className="dash-chart-subtitle">Revenue per day in RWF</div>
                </div>
              </div>
              <div className="dash-chart-body" style={{ minHeight: 220 }}>
                {dailyData.length > 0 ? <BarChart data={dailyData} color="#f97316" /> : <div className="an-empty">No order data yet.</div>}
              </div>
            </div>
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <div>
                  <div className="dash-chart-title">📂 Revenue by Category</div>
                  <div className="dash-chart-subtitle">Top categories by total revenue</div>
                </div>
              </div>
              <div className="dash-chart-body">
                {catData.length > 0 ? <DonutChart data={catData} /> : <div className="an-empty">No sales data yet.</div>}
              </div>
            </div>
          </div>

          {catData.length > 0 && (
            <div className="dash-card" style={{ marginTop: 18 }}>
              <div className="dash-card-header"><div className="dash-card-title">📊 Category Performance</div></div>
              <table className="dash-table">
                <thead><tr><th>#</th><th>Category</th><th>Revenue</th><th>Units Sold</th><th>Share</th></tr></thead>
                <tbody>
                  {(stats.revenueByCategory || []).map((c: any, i: number) => {
                    const totalRev = stats.revenueByCategory.reduce((s: number, x: any) => s + x.revenue, 0) || 1;
                    const share = ((c.revenue / totalRev) * 100).toFixed(1);
                    return (
                      <tr key={c._id}>
                        <td style={{ color: '#a8a29e', fontWeight: 700 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], display: 'inline-block' }} />
                            {c._id || 'Unknown'}
                          </div>
                        </td>
                        <td style={{ fontWeight: 800, color: '#c2410c' }}>RWF {Number(c.revenue).toLocaleString()}</td>
                        <td>{c.qty}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'rgba(194,65,12,.1)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${share}%`, height: '100%', background: CAT_COLORS[i % CAT_COLORS.length], borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#78716c', minWidth: 36 }}>{share}%</span>
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
      )}
    </>
  );
}
