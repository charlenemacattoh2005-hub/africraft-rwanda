import React from 'react';

const features = [
  'Wishlist',
  'Product reviews and ratings',
  'Discount coupons',
  'AI product recommendations',
  'Order tracking',
  'Email confirmation',
  'Mobile Money payment simulation',
  'Sales dashboard',
  'Progressive Web App (PWA)',
];

export default function FeaturesPage() {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 22 }}>
        <div className="h1">Features</div>
        <p className="p">This storefront includes the core bonus features that can strengthen the project.</p>

        <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {features.map((feature) => (
            <div key={feature} className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 800 }}>{feature}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
