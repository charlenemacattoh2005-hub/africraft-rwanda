import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { fetchWishlist, removeWishlist } from '../services/wishlist';
import { fetchProductById } from '../services/products';
import { addWishlist } from '../services/wishlist';
import { Badge, Button, LoadingSkeleton, EmptyState } from '../components/ui';

const CART_KEY = 'africraft_cart_v1';

type WishlistItem = { productId: string };
type ProductInfo  = { _id: string; name: string; price: number; stock: number; isActive: boolean };

function addToCart(productId: string) {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const lines = Array.isArray(parsed) ? parsed : [];
    const existing = lines.filter((x: any) => x && typeof x.productId === 'string');
    const idx = existing.findIndex((x: any) => x.productId === productId);
    if (idx >= 0) existing[idx].quantity += 1;
    else existing.push({ productId, quantity: 1 });
    localStorage.setItem(CART_KEY, JSON.stringify(existing));
  } catch {}
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchWishlist();
        if (!mounted) return;
        setItems(data.items || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load wishlist');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          try {
            const data = await fetchProductById(item.productId);
            return [item.productId, data.item] as const;
          } catch { return [item.productId, null] as const; }
        })
      );
      if (!mounted) return;
      const next: Record<string, ProductInfo> = {};
      for (const [id, item] of entries) { if (item) next[id] = item; }
      setProducts(next);
    })();
    return () => { mounted = false; };
  }, [items]);

  async function onRemove(productId: string) {
    setLoading(true); setError(null);
    try {
      await removeWishlist(productId);
      setItems((cur) => cur.filter((i) => i.productId !== productId));
    } catch (err: any) {
      setError(err?.message || 'Failed to remove item');
    } finally { setLoading(false); }
  }

  function onAddToCart(productId: string) {
    addToCart(productId);
    alert('Moved item to cart');
  }

  return (
    <RequireAuth>
      <div className="container page">
        <div className="card" style={{ padding: 20 }}>
          <div className="h1">Wishlist</div>
          <p className="p">Save favorite products for later.</p>

          {error && <Badge variant="error" style={{ marginTop: 16 }}>{error}</Badge>}

          {loading ? (
            <div style={{ marginTop: 16 }}>
              <LoadingSkeleton count={3} variant="row" />
            </div>
          ) : items.length === 0 && !error ? (
            <EmptyState
              icon="❤️"
              title="Your wishlist is empty"
              description="Browse products and save your favorites here."
              action={{ label: 'Browse products', onClick: () => window.location.href = '/products' }}
            />
          ) : (
            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
              {items.map((item) => {
                const product = products[item.productId];
                return (
                  <div key={item.productId} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{product?.name || 'Product unavailable'}</div>
                        {product && (
                          <div className="small" style={{ marginTop: 4 }}>
                            RWF {Number(product.price).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Button onClick={() => onAddToCart(item.productId)}>Add to cart</Button>
                        <Button variant="danger" onClick={() => onRemove(item.productId)}>Remove</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
