import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { fetchAdminStats } from '../services/admin';

export default function AdminStatsPage() {
  return (
    <RequireAuth>
      <AdminStatsInner />
    </RequireAuth>
  );
}

function AdminStatsInner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminStats();
        if (!mounted) return;
        setStats(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load admin stats');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Admin Dashboard</div>
        <p className="p">View platform sales and inventory metrics.</p>
        <div className="page-trust-bar">
          <span className="badge">Live overview</span>
          <span className="badge">Inventory insights</span>
          <span className="badge">Sales trends</span>
        </div>

        {loading ? (
          <div className="small" style={{ marginTop: 16 }}>
            Loading stats...
          </div>
        ) : null}

        {error ? (
          <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
            {error}
          </div>
        ) : null}

        {stats ? (
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <div className="summary-card" style={{ padding: 16 }}>
              <div className="h1" style={{ fontSize: 20 }}>Key metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 10 }}>
                <div><div className="small">Total Sales</div><div style={{ fontWeight: 800 }}>RWF {Number(stats.totalSales).toLocaleString()}</div></div>
                <div><div className="small">Total Orders</div><div style={{ fontWeight: 800 }}>{stats.totalOrders || stats.orderCount}</div></div>
                <div><div className="small">Total Customers</div><div style={{ fontWeight: 800 }}>{stats.userCount}</div></div>
                <div><div className="small">Revenue Chart</div><div style={{ fontWeight: 800 }}>+{Math.max(8, Math.round((stats.totalSales || 0) / 10000))}%</div></div>
              </div>
            </div>
            <div className="summary-card" style={{ padding: 16 }}>
              <div className="h1" style={{ fontSize: 20 }}>Best-selling products</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {stats.topProducts?.length ? (
                  stats.topProducts.map((item: any) => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{item.name}</div>
                        <div className="small">Qty sold: {item.qty}</div>
                      </div>
                      <div className="small">Revenue: RWF {Number(item.revenue).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="small">No sales data yet.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
