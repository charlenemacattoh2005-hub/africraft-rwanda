import React from 'react';
import { Link } from 'react-router-dom';

export interface CategoryCardCategory {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface CategoryCardProps {
  category: CategoryCardCategory;
  imageOverride?: string;
}

export default function CategoryCard({ category, imageOverride }: CategoryCardProps) {
  const imgSrc = category.imageUrl || imageOverride;
  return (
    <Link to={`/products?category=${encodeURIComponent(category.name)}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden', transition: 'transform .25s, box-shadow .25s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(194,65,12,.14)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
      >
        <div style={{ height: 150, background: 'linear-gradient(135deg,#fef3c7,#fde68a)', overflow: 'hidden' }}>
          {imgSrc ? (
            <img src={imgSrc} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#92400e', textAlign: 'center', padding: 12 }}>
              {category.name}
            </div>
          )}
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 800 }}>{category.name}</div>
          <div className="small" style={{ marginTop: 6 }}>{category.description || 'Explore this collection.'}</div>
        </div>
      </div>
    </Link>
  );
}
