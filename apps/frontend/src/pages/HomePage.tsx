import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">DellCraft Rwanda</div>
        <p className="p">
          Shop authentic Rwandan crafts online: browse products, add to cart, checkout, and track orders.
        </p>
        <hr className="sep" />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/products" className="btn primary">
            Browse products
          </Link>
          <Link to="/cart" className="btn">
            Go to cart
          </Link>
          <Link to="/login" className="btn">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

