import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categories';

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
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCategories();
        if (!mounted) return;
        setCategories(data.categories || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load categories');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Categories</div>
        <p className="p">Filter products by artisan categories.</p>

        {loading ? (
          <div className="small" style={{ marginTop: 16 }}>
            Loading categories...
          </div>
        ) : null}

        {error ? (
          <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {categories.map((category) => (
            <div key={category._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 150, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                {category.imageUrl || CATEGORY_IMAGES[category.name] ? (
                  <img src={category.imageUrl || CATEGORY_IMAGES[category.name]} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#92400e', textAlign: 'center', padding: 12 }}>
                    {category.name}
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 800 }}>{category.name}</div>
                <div className="small" style={{ marginTop: 6 }}>{category.description || 'No description yet.'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
