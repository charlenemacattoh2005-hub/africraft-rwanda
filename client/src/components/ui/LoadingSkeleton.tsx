import React from 'react';

interface LoadingSkeletonProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** 'card' = product card shape, 'line' = text line, 'row' = horizontal list row */
  variant?: 'card' | 'line' | 'row';
}

function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
      <div style={{ padding: 14, display: 'grid', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '40%', borderRadius: 8 }} />
      </div>
    </div>
  );
}

function SkeletonLine() {
  return <div className="skeleton" style={{ height: 16, borderRadius: 8, marginBottom: 8 }} />;
}

function SkeletonRow() {
  return (
    <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'grid', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 8 }} />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 8, variant = 'card' }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });
  if (variant === 'line') return <>{items.map((_, i) => <SkeletonLine key={i} />)}</>;
  if (variant === 'row')  return <div style={{ display: 'grid', gap: 12 }}>{items.map((_, i) => <SkeletonRow key={i} />)}</div>;
  return (
    <div className="products-grid">
      {items.map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
