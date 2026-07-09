import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const location    = useLocation();
  const state       = (location.state as any) || {};
  const orderNumber = state.orderNumber || 'AFR20260012';
  const total       = state.total       || 0;
  const payment     = state.paymentMethod || 'MTN MoMo';

  return (
    <div className="container page">
      <div className="card" style={{ padding: 28, maxWidth: 600, margin: '0 auto' }}>

        {/* Success hero */}
        <div className="confirm-hero">
          <div className="confirm-icon-wrap" aria-hidden="true">✓</div>
          <h1 className="confirm-title">Order confirmed!</h1>
          <p className="confirm-sub">
            Your artisan pieces are on the way. We'll keep you updated every step of the journey.
          </p>
        </div>

        {/* Trust badges */}
        <div className="page-trust-bar" style={{ justifyContent: 'center', marginBottom: 20 }}>
          <span className="badge">📦 Order received</span>
          <span className="badge">💳 Payment confirmed</span>
          <span className="badge">🎧 Support available</span>
        </div>

        {/* Order details */}
        <div className="confirm-details">
          <div className="confirm-detail-row">
            <span className="confirm-detail-label">Order number</span>
            <span className="confirm-detail-value" style={{ fontFamily: 'monospace' }}>{orderNumber}</span>
          </div>
          <div className="confirm-detail-row">
            <span className="confirm-detail-label">Status</span>
            <span className="status-badge status-pending">Pending</span>
          </div>
          <div className="confirm-detail-row">
            <span className="confirm-detail-label">Payment method</span>
            <span className="confirm-detail-value">{payment}</span>
          </div>
          {total > 0 && (
            <div className="confirm-detail-row">
              <span className="confirm-detail-label">Total</span>
              <span className="confirm-detail-value" style={{ color: 'var(--primary)', fontSize: 18 }}>
                RWF {Number(total).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn primary" to="/orders" style={{ flex: 1, justifyContent: 'center' }}>
            📦 View my orders
          </Link>
          <Link className="btn" to="/products" style={{ flex: 1, justifyContent: 'center' }}>
            🛍️ Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
