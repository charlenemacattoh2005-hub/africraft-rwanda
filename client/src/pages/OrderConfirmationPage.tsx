import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const state       = (useLocation().state as any) || {};
  const orderNumber = state.orderNumber || `AFR${Date.now().toString().slice(-6)}`;
  const total       = state.total       || 0;
  const payment     = state.paymentMethod || 'MTN MoMo';

  const STEPS = [
    { icon: '✅', label: 'Order Placed',    done: true  },
    { icon: '🔄', label: 'Processing',      done: false },
    { icon: '📦', label: 'Packaged',        done: false },
    { icon: '🚚', label: 'Out for Delivery',done: false },
    { icon: '🏠', label: 'Delivered',       done: false },
  ];

  return (
    <div className="container page">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Success hero */}
        <div className="confirm-hero">
          <div className="confirm-icon-wrap">✓</div>
          <h1 className="confirm-title">Order Confirmed!</h1>
          <p className="confirm-sub">
            Your artisan pieces are on their way. We'll send updates at every step of the journey.
          </p>
        </div>

        {/* Order details card */}
        <div className="order-detail-card" style={{ marginBottom: 20 }}>
          <div className="order-section-title">📋 Order Details</div>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <div className="order-summary-row">
              <span>Order Number</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#c2410c' }}>{orderNumber}</span>
            </div>
            <div className="order-summary-row">
              <span>Status</span>
              <span className="status-badge status-pending">Pending</span>
            </div>
            <div className="order-summary-row">
              <span>Payment Method</span>
              <span style={{ fontWeight: 700 }}>{payment}</span>
            </div>
            {total > 0 && (
              <div className="order-summary-row" style={{ borderTop: '1px solid rgba(194,65,12,.1)', paddingTop: 10, fontWeight: 900 }}>
                <span>Total Paid</span>
                <span style={{ color: '#c2410c', fontSize: 18 }}>RWF {Number(total).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tracking steps */}
        <div className="order-tracking-card" style={{ marginBottom: 20 }}>
          <div className="order-section-title">📍 What Happens Next</div>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {STEPS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: s.done ? 1 : 0.5 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.done ? '#c2410c' : '#e5e7eb', color: s.done ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {s.done ? s.icon : i + 1}
                </div>
                <div style={{ fontWeight: s.done ? 800 : 600, color: s.done ? '#1c1917' : '#78716c' }}>{s.label}</div>
                {s.done && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#15803d', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: 999 }}>Done</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          {['📦 Order received', '💳 Payment confirmed', '🎧 Support available 24/7'].map(b => (
            <span key={b} className="badge" style={{ fontSize: 12 }}>{b}</span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link className="btn primary" to="/orders" style={{ justifyContent: 'center', padding: '13px' }}>
            📦 View My Orders
          </Link>
          <Link className="btn" to="/products" style={{ justifyContent: 'center', padding: '13px' }}>
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
