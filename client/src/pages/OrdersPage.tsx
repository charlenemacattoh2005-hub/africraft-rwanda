import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../services/orders';
import RequireAuth from '../components/RequireAuth';
import { Badge, LoadingSkeleton, EmptyState } from '../components/ui';

export default function OrdersPage() {
  return <RequireAuth><OrdersInner /></RequireAuth>;
}

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  pending:   { cls: 'status-pending',   label: 'Pending' },
  confirmed: { cls: 'status-confirmed', label: 'Confirmed' },
  delivered: { cls: 'status-delivered', label: 'Delivered' },
  cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
};

function OrdersInner() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [orders,  setOrders]  = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchMyOrders();
        if (!mounted) return;
        setOrders(data.orders || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load orders');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container page">
      <div className="account-header">
        <div>
          <h1 className="account-title">My Orders</h1>
          <p className="account-subtitle">Track and manage your purchases</p>
        </div>
        <Link to="/products" className="btn">Continue shopping</Link>
      </div>

      {error && <Badge variant="error" style={{ marginBottom: 16 }}>{error}</Badge>}

      {loading ? (
        <LoadingSkeleton count={4} variant="row" />
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="Your order history will appear here after your first purchase."
          action={{ label: 'Browse products', onClick: () => window.location.href = '/products' }}
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {orders.map((o) => {
            const status = STATUS_MAP[o.status] || { cls: 'status-pending', label: o.status };
            return (
              <Link key={o._id} to={`/orders/${o._id}`} className="order-row">
                <div>
                  <div className="order-id">#{o._id?.slice(-8).toUpperCase()}</div>
                  <div className="order-date">{new Date(o.createdAt).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span className={`status-badge ${status.cls}`}>{status.label}</span>
                  <div className="order-total">RWF {Number(o.total).toLocaleString()}</div>
                </div>
                <span className="order-arrow" aria-hidden="true">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
