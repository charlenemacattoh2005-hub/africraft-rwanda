import React from 'react';

const products = [
  'Agaseke Peace Basket',
  'Handmade Sisal Basket',
  'Wooden Gorilla Sculpture',
  'African Wall Art',
  'Handwoven Table Mats',
  'Beaded Necklaces',
  'Wooden Serving Tray',
  'Clay Flower Vase',
  'Leather Handbag',
  'Traditional Drums',
];

export default function SuggestedProductsPage() {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 22 }}>
        <div className="h1">Suggested Products</div>
        <p className="p">A curated list of featured products that match the store’s artisan collection.</p>

        <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {products.map((product) => (
            <div key={product} className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 800 }}>{product}</div>
              <div className="small" style={{ marginTop: 6 }}>Suggested for the next featured collection.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
