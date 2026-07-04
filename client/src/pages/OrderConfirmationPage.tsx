import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const state = (location.state as any) || {};
  const orderNumber = state.orderNumber || 'AFR20260012';
  const total = state.total || 0;

  return (
    <div className="container page">
      <div className="card" style={{ padding: 24 }}>
        <div className="summary-card" style={{ marginBottom: 16 }}>
          <div className="h1" style={{ marginBottom: 6 }}>Thank you for your order!</div>
          <p className="p">Your artisan pieces are on the way and we’ll keep you updated every step of the journey.</p>
        </div>
        <div className="page-trust-bar">
          <span className="badge">Order received</span>
          <span className="badge">Payment method confirmed</span>
          <span className="badge">Support available</span>
        </div>
        <div className="summary-card" style={{ marginTop: 16 }}>
          <div className="badge" style={{ marginTop: 4 }}>
            Order Number: {orderNumber}
          </div>
          <div className="badge" style={{ marginTop: 8 }}>
            Status: Pending
          </div>
          <div className="badge" style={{ marginTop: 8 }}>
            Payment Method: {state.paymentMethod || 'MTN MoMo'}
          </div>
          <div className="badge" style={{ marginTop: 8 }}>
            Total: RWF {Number(total).toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
          <Link className="btn primary" to="/orders">View Order History</Link>
          <Link className="btn" to="/products">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
