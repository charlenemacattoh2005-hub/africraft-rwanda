import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categories';
import { CategoryCard, LoadingSkeleton, EmptyState, Badge } from '../components/ui';

const CATEGORY_IMAGES: Record<string, string> = {
  Baskets: 'https://assets.weimgs.com/weimgs/rk/images/wcm/products/202551/0042/woven-seagrass-baskets-2-c.jpg',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchCategories();
        if (!mounted) return;
        setCategories(data.categories || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load categories');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Categories</div>
        <p className="p">Filter products by artisan categories.</p>

        {error && (
          <Badge variant="error" style={{ marginTop: 16 }}>{error}</Badge>
        )}

        {loading ? (
          <div style={{ marginTop: 18, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 150 }} />
                <div style={{ padding: 16, display: 'grid', gap: 8 }}>
                  <div className="skeleton" style={{ height: 16, borderRadius: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 && !error ? (
          <EmptyState icon="🏪" title="No categories yet" description="Categories will appear here once added." />
        ) : (
          <div style={{ marginTop: 18, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {categories.map((cat) => (
              <CategoryCard key={cat._id} category={cat} imageOverride={CATEGORY_IMAGES[cat.name]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
