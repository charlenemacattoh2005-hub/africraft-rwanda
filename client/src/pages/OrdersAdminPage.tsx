import React from 'react';

const orders = [
  { id: 'ORD-1001', customerId: 'C-001', date: '2026-06-24', total: 93000, status: 'Delivered' },
  { id: 'ORD-1002', customerId: 'C-002', date: '2026-07-01', total: 54000, status: 'Processing' },
];

export default function OrdersAdminPage() {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 22 }}>
        <div className="h1">Orders</div>
        <p className="p">Manage order activity and status updates for the storefront.</p>

        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{order.id}</div>
                  <div className="small">Customer ID: {order.customerId}</div>
                </div>
                <div className="badge">{order.status}</div>
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                <div><strong>Order Date:</strong> {order.date}</div>
                <div><strong>Total:</strong> RWF {order.total.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
