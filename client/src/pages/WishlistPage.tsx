import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { fetchWishlist, removeWishlist } from '../services/wishlist';
import { fetchProductById } from '../services/products';
import { addWishlist } from '../services/wishlist';
import { Link } from 'react-router-dom';

const CART_KEY = 'africraft_cart_v1';

type WishlistItem = { productId: string };

type ProductInfo = { _id: string; name: string; price: number; stock: number; isActive: boolean };

function loadCart(): string[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.productId === 'string').map((x: any) => x.productId);
  } catch {
    return [];
  }
}

function addToCart(productId: string) {
  const current = loadCart();
  const existing = current.filter((id) => id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify([...existing, { productId, quantity: 1 }]));
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWishlist();
        if (!mounted) return;
        setItems(data.items || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load wishlist');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          try {
            const data = await fetchProductById(item.productId);
            return [item.productId, data.item] as const;
          } catch {
            return [item.productId, null] as const;
          }
        })
      );
      if (!mounted) return;
      const next: Record<string, ProductInfo> = {};
      for (const [id, item] of entries) {
        if (item) next[id] = item;
      }
      setProducts(next);
    })();
    return () => {
      mounted = false;
    };
  }, [items]);

  async function onRemove(productId: string) {
    setLoading(true);
    setError(null);
    try {
      await removeWishlist(productId);
      setItems((current) => current.filter((item) => item.productId !== productId));
    } catch (err: any) {
      setError(err?.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  }

  async function onAddToCart(productId: string) {
    addToCart(productId);
    alert('Moved item to cart');
  }

  return (
    <RequireAuth>
      <div className="container page">
        <div className="card" style={{ padding: 20 }}>
          <div className="h1">Wishlist</div>
          <p className="p">Save favorite products for later.</p>

          {loading ? (
            <div className="small" style={{ marginTop: 16 }}>
              Loading wishlist...
            </div>
          ) : null}
          {error ? (
            <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
              {error}
            </div>
          ) : null}

          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            {items.map((item) => {
              const product = products[item.productId];
              return (
                <div key={item.productId} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{product?.name || 'Product unavailable'}</div>
                      <div className="small" style={{ marginTop: 4 }}>
                        {product ? `RWF ${Number(product.price).toLocaleString()}` : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button className="btn" type="button" onClick={() => onAddToCart(item.productId)}>
                        Add to cart
                      </button>
                      <button className="btn danger" type="button" onClick={() => onRemove(item.productId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!loading && items.length === 0 ? (
              <div className="small">No items in your wishlist yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
