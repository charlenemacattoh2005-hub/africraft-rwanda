import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { fetchOrderById } from '../services/orders';

export default function OrderDetailsPage() {
  return <RequireAuth><Inner /></RequireAuth>;
}

const STEPS = [
  { key: 'pending',   label: 'Order Placed',  icon: '📋' },
  { key: 'confirmed', label: 'Confirmed',      icon: '✅' },
  { key: 'processing',label: 'Processing',     icon: '⚙️' },
  { key: 'shipped',   label: 'Shipped',        icon: '🚚' },
  { key: 'delivered', label: 'Delivered',      icon: '🏠' },
];

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  pending:          { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
  confirmed:        { color: '#1d4ed8', bg: '#eff6ff', label: 'Confirmed' },
  paid:             { color: '#15803d', bg: '#f0fdf4', label: 'Paid' },
  processing:       { color: '#7c3aed', bg: '#f5f3ff', label: 'Processing' },
  packed:           { color: '#b45309', bg: '#fef3c7', label: 'Packed' },
  shipped:          { color: '#0891b2', bg: '#ecfeff', label: 'Shipped' },
  out_for_delivery: { color: '#ea580c', bg: '#fff7ed', label: 'Out for Delivery' },
  delivered:        { color: '#15803d', bg: '#f0fdf4', label: 'Delivered' },
  completed:        { color: '#15803d', bg: '#f0fdf4', label: 'Completed' },
  cancelled:        { color: '#dc2626', bg: '#fef2f2', label: 'Cancelled' },
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
      <div className="od-skeleton-grid">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="container page">
      <div className="od-error-state">
        <div className="od-error-icon">📦</div>
        <div className="od-error-title">{error || 'Order not found'}</div>
        <button className="btn primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );

  const statusMeta  = STATUS_META[order.status] || { color: '#6b7280', bg: '#f3f4f6', label: order.status };
  const isCancelled = order.status === 'cancelled';
  const stepIdx     = STEPS.findIndex(s => s.key === order.status);
  const activeIdx   = stepIdx === -1 ? (order.status === 'completed' ? 4 : 0) : stepIdx;

  return (
    <div className="container page">

      {/* ── Page header ── */}
      <div className="od-page-header">
        <button className="od-back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="od-header-row">
          <div>
            <h1 className="od-title">Order #{String(order._id).slice(-8).toUpperCase()}</h1>
            <p className="od-subtitle">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-RW', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}{' '}
              at {new Date(order.createdAt).toLocaleTimeString('en-RW', {
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <span className="od-status-badge" style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.color + '40' }}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* ── Tracking timeline ── */}
      {isCancelled ? (
        <div className="od-cancelled-banner">
          ❌ This order was cancelled.
        </div>
      ) : (
        <div className="od-tracking-card">
          <div className="od-card-title">📍 Order Tracking</div>
          <div className="od-timeline">
            {STEPS.map((step, i) => {
              const done    = activeIdx >= i;
              const current = activeIdx === i;
              return (
                <div key={step.key} className={`od-step${done ? ' done' : ''}${current ? ' current' : ''}`}>
                  <div className="od-step-icon-wrap">
                    <div className="od-step-dot">
                      {done ? '✓' : step.icon}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`od-step-line${activeIdx > i ? ' done' : ''}`} />
                    )}
                  </div>
                  <div className="od-step-label">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="od-main-grid">

        {/* Left column */}
        <div className="od-left-col">

          {/* Items */}
          <div className="od-card">
            <div className="od-card-title">
              🛍️ Items Ordered
              <span className="od-count-pill">{order.items?.length || 0}</span>
            </div>
            <div className="od-items-list">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="od-item-row">
                  <div className="od-item-img">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} />
                      : <span>🛍️</span>}
                  </div>
                  <div className="od-item-info">
                    <div className="od-item-name">{item.name}</div>
                    <div className="od-item-meta">
                      <span>Qty: <strong>{item.quantity}</strong></span>
                      <span>Unit price: <strong>RWF {Number(item.unitPrice).toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div className="od-item-total">
                    RWF {Number(item.lineTotal).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="od-card">
            <div className="od-card-title">🚚 Delivery Information</div>
            <div className="od-info-grid">
              <div className="od-info-row">
                <span className="od-info-label">Full Name</span>
                <span className="od-info-value">{order.customer?.fullName || '—'}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">Phone</span>
                <span className="od-info-value">{order.customer?.phone || '—'}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">Email</span>
                <span className="od-info-value">{order.customer?.email || '—'}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">District</span>
                <span className="od-info-value">{order.customer?.district || '—'}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">Sector</span>
                <span className="od-info-value">{order.customer?.sector || '—'}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">Address</span>
                <span className="od-info-value">{order.customer?.address || '—'}</span>
              </div>
              {order.customer?.deliveryNotes && (
                <div className="od-info-row od-info-row-full">
                  <span className="od-info-label">Delivery Notes</span>
                  <span className="od-info-value">{order.customer.deliveryNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — summary */}
        <div className="od-right-col">
          <div className="od-card od-summary-card">
            <div className="od-card-title">💰 Order Summary</div>
            <div className="od-summary-rows">
              <div className="od-summary-row">
                <span>Subtotal</span>
                <span>RWF {Number(order.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="od-summary-row">
                <span>Delivery fee</span>
                <span>{Number(order.deliveryFee || 0) === 0 ? 'Free' : `RWF ${Number(order.deliveryFee).toLocaleString()}`}</span>
              </div>
              <div className="od-summary-row od-summary-total">
                <span>Total</span>
                <span>RWF {Number(order.total).toLocaleString()}</span>
              </div>
              <div className="od-summary-row od-summary-payment">
                <span>Payment</span>
                <span>{order.customer?.paymentMethod || order.paymentMethod || '—'}</span>
              </div>
            </div>

            <div className="od-actions">
              <Link to="/products" className="btn primary" style={{ justifyContent: 'center' }}>
                🛍️ Continue Shopping
              </Link>
              <button className="btn" style={{ justifyContent: 'center' }} onClick={() => navigate('/dashboard')}>
                📦 My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
