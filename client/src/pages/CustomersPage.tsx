import React from 'react';

const customers = [
  { id: 'C-001', name: 'Aline Uwase', email: 'aline@example.com', phone: '+250 782 111 111', address: 'Kigali, Rwanda' },
  { id: 'C-002', name: 'Eric Niyonzima', email: 'eric@example.com', phone: '+250 783 222 222', address: 'Muhanga, Rwanda' },
];

export default function CustomersPage() {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 22 }}>
        <div className="h1">Customers</div>
        <p className="p">A simple customer overview for the storefront dashboard.</p>

        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {customers.map((customer) => (
            <div key={customer.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{customer.name}</div>
                  <div className="small">Customer ID: {customer.id}</div>
                </div>
                <div className="small">{customer.email}</div>
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                <div><strong>Phone:</strong> {customer.phone}</div>
                <div><strong>Address:</strong> {customer.address}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
