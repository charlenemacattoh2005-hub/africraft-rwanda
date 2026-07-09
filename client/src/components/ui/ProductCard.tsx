import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS: Record<string, string> = {
  Baskets: '🧺', Pottery: '🏺', Jewelry: '💎', Textiles: '🧵',
  'Wood Carving': '🪵', Paintings: '🎨', Leather: '👜', Beadwork: '📿',
  'Home Decor': '🏠', Accessories: '✨', Gifts: '🎁', Clothing: '👗',
};

export interface ProductCardProduct {
  _id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stock?: number;
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  isActive?: boolean;
}

interface ProductCardProps {
  product: ProductCardProduct;
  onAddToCart?: (id: string, name: string) => void;
  /** Compact home-page variant */
  variant?: 'default' | 'home';
  listView?: boolean;
}

export default function ProductCard({ product: p, onAddToCart, variant = 'default', listView = false }: ProductCardProps) {
  if (variant === 'home') {
    return (
      <div className="card home-product-card">
        <div className="classic-product-image">
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span>✦</span>}
        </div>
        <div className="classic-product-body">
          <div className="classic-product-name">{p.name}</div>
          <div className="small">{p.category}</div>
          <div className="classic-price">RWF {Number(p.price).toLocaleString()}</div>
          <Link className="btn" to={`/products/${p._id}`}>View details</Link>
        </div>
      </div>
    );
  }

  const icon = CATEGORY_ICONS[p.category || ''] || '🎨';
  const stars = Math.round(p.averageRating || 0);

  return (
    <div className={`product-card${listView ? ' list-view-item' : ''}`}>
      <Link to={`/products/${p._id}`} className="product-img-wrap">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="product-img" />
        ) : (
          <div className="product-img-placeholder"><span>{icon}</span></div>
        )}
        {(p.stock ?? 1) <= 5 && (p.stock ?? 1) > 0 && (
          <span className="product-badge low-stock">Only {p.stock} left</span>
        )}
        {p.stock === 0 && <span className="product-badge out-of-stock">Out of stock</span>}
        {p.isFeatured && <span className="product-badge featured">Featured</span>}
      </Link>

      <div className="product-body">
        <div className="product-category">{p.category}</div>
        <Link to={`/products/${p._id}`} className="product-name">{p.name}</Link>

        {(p.reviewCount ?? 0) > 0 && (
          <div className="product-rating">
            <span className="stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span className="rating-count">({p.reviewCount})</span>
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">RWF {Number(p.price).toLocaleString()}</div>
          <div className="product-actions">
            <Link to={`/products/${p._id}`} className="btn product-view-btn">View</Link>
            {onAddToCart && (
              <button
                className="btn primary product-add-btn"
                onClick={() => onAddToCart(p._id, p.name)}
                disabled={p.stock === 0}
              >
                {p.stock === 0 ? 'Sold out' : '+ Cart'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
