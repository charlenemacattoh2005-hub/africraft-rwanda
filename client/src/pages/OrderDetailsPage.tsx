import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { fetchOrderById } from '../services/orders';

export default function OrderDetailsPage() {
  return <RequireAuth><Inner /></RequireAuth>;
}

const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STATUS_COLORS: Record<string, string> = {
  pending: '#d97706', confirmed: '#1d4ed8', processing: '#7c3aed',
  shipped: '#0891b2', delivered: '#15803d', completed: '#15803d', cancelled: '#dc2626',
};

function Inner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchOrderById(id)
      .then(d => setOrder(d.order || null))
      .catch(e => setError(e?.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container page">
      <div style={{ display: 'grid', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="container page">
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{error || 'Order not found'}</div>
        <button className="btn primary" onClick={() => navigate('/orders')}>Back to orders</button>
      </div>
    </div>
  );

  const statusIdx = STEPS.findIndex(s => s.toLowerCase() === order.status?.toLowerCase());
  const isCancelled = order.status === 'cancelled';
  const statusColor = STATUS_COLORS[order.status] || '#6b7280';

  return (
    <div className="container page">
      <div className="order-detail-header">
        <div>
          <button className="btn" onClick={() => navigate('/orders')} style={{ marginBottom: 12, fontSize: 12 }}>← Back to orders</button>
          <h1 className="account-title">Order #{String(order._id).slice(-8).toUpperCase()}</h1>
          <p className="account-subtitle">{new Date(order.createdAt).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className="status-badge" style={{ background: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}40`, fontSize: 13, padding: '6px 16px' }}>
          {order.status}
        </span>
      </div>

      {/* Tracking timeline */}
      {!isCancelled && (
        <div className="order-tracking-card">
          <div className="order-section-title">📍 Order Tracking</div>
          <div className="order-timeline">
            {STEPS.map((step, i) => {
              const done    = statusIdx >= i;
              const current = statusIdx === i;
              return (
                <div key={step} className={`timeline-step${done ? ' done' : ''}${current ? ' current' : ''}`}>
                  <div className="timeline-dot">
                    {done ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`timeline-line${done && statusIdx > i ? ' done' : ''}`} />}
                  <div className="timeline-label">{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isCancelled && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '16px 20px', marginBottom: 20, color: '#dc2626', fontWeight: 700 }}>
          ❌ This order was cancelled.
        </div>
      )}

      <div className="order-detail-grid">
        {/* Left column */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Items */}
          <div className="order-detail-card">
            <div className="order-section-title">🛍️ Items Ordered ({order.items?.length || 0})</div>
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              {order.items?.map((item: any) => (
                <div key={item.productId} className="order-item-row">
                  <div className="order-item-img">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                      : <span style={{ fontSize: 24 }}>🛍️</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>Qty: {item.quantity}</div>
                    <div style={{ fontSize: 12, color: '#78716c' }}>Unit: RWF {Number(item.unitPrice).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#c2410c', fontSize: 14, whiteSpace: 'nowrap' }}>
                    RWF {Number(item.lineTotal).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="order-detail-card">
            <div className="order-section-title">🚚 Delivery Information</div>
            <div className="order-info-grid" style={{ marginTop: 12 }}>
              <div className="order-info-item"><span>Name</span><strong>{order.customer?.fullName}</strong></div>
              <div className="order-info-item"><span>Phone</span><strong>{order.customer?.phone}</strong></div>
              <div className="order-info-item"><span>Email</span><strong>{order.customer?.email || '—'}</strong></div>
              <div className="order-info-item"><span>District</span><strong>{order.customer?.district || '—'}</strong></div>
              <div className="order-info-item"><span>Sector</span><strong>{order.customer?.sector || '—'}</strong></div>
              <div className="order-info-item"><span>Address</span><strong>{order.customer?.address || '—'}</strong></div>
              {order.customer?.deliveryNotes && (
                <div className="order-info-item" style={{ gridColumn: '1/-1' }}><span>Notes</span><strong>{order.customer.deliveryNotes}</strong></div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — summary */}
        <div className="order-detail-card" style={{ alignSelf: 'start' }}>
          <div className="order-section-title">💰 Order Summary</div>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <div className="order-summary-row"><span>Subtotal</span><span>RWF {Number(order.subtotal || 0).toLocaleString()}</span></div>
            <div className="order-summary-row"><span>Delivery fee</span><span>RWF {Number(order.deliveryFee || 0).toLocaleString()}</span></div>
            <div className="order-summary-row" style={{ borderTop: '1px solid rgba(194,65,12,.1)', paddingTop: 10, fontWeight: 900, fontSize: 16 }}>
              <span>Total</span><span style={{ color: '#c2410c' }}>RWF {Number(order.total).toLocaleString()}</span>
            </div>
            <div className="order-summary-row"><span>Payment</span><span style={{ fontWeight: 700 }}>{order.customer?.paymentMethod || '—'}</span></div>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            <Link to="/products" className="btn primary" style={{ justifyContent: 'center' }}>🛍️ Continue Shopping</Link>
            <Link to="/orders" className="btn" style={{ justifyContent: 'center' }}>📦 All Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
