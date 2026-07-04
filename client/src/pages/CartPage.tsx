import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/products";

const CART_KEY = "africraft_cart_v1";

type CartLine = { productId: string; quantity: number };

type ProductInfo = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
};

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.productId === "string")
      .map((x) => ({
        productId: x.productId,
        quantity: Math.max(1, Math.floor(Number(x.quantity) || 1)),
      }));
  } catch {
    return [];
  }
}

function saveCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export default function CartPage() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MTN MoMo');

  useEffect(() => {
    if (lines.length === 0) {
      setProducts({});
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(
          lines.map(async (line) => {
            try {
              const data = await fetchProductById(line.productId);
              return [line.productId, data.item] as const;
            } catch {
              return [line.productId, null] as const;
            }
          }),
        );

        if (!mounted) return;
        const next: Record<string, ProductInfo> = {};
        for (const [id, item] of entries) {
          if (item) next[id] = item;
        }
        setProducts(next);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [lines]);

  function setLineQuantity(productId: string, quantity: number) {
    const q = Math.max(1, Math.floor(Number(quantity) || 1));
    const next = lines.map((l) =>
      l.productId === productId ? { ...l, quantity: q } : l,
    );
    const normalized = next.filter((l) => l.quantity > 0);
    setLines(normalized);
    saveCart(normalized);
  }

  function removeLine(productId: string) {
    const next = lines.filter((l) => l.productId !== productId);
    setLines(next);
    saveCart(next);
  }

  const totalQuantity = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products[line.productId];
        if (!product) return sum;
        return sum + product.price * line.quantity;
      }, 0),
    [lines, products],
  );

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Shopping Cart</div>
        <p className="p">Review quantities then proceed to checkout.</p>
        <div className="page-trust-bar">
          <span className="badge">Secure checkout</span>
          <span className="badge">Mobile money ready</span>
          <span className="badge">Fast Rwanda delivery</span>
        </div>

        {lines.length === 0 ? (
          <div className="small" style={{ marginTop: 16 }}>
            Cart is empty. <Link to="/products">Browse products</Link>.
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div className="summary-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Cart summary</div>
                  <div className="small">{totalQuantity} item{totalQuantity === 1 ? '' : 's'} ready for checkout</div>
                </div>
                <div style={{ fontWeight: 800, color: '#a15c2a' }}>RWF {subtotal.toLocaleString()}</div>
              </div>
            </div>

            {loading ? (
              <div className="small" style={{ marginBottom: 12 }}>
                Loading product details...
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {lines.map((l) => {
                const product = products[l.productId];
                const lineTotal = (product?.price || 0) * l.quantity;
                return (
                  <div key={l.productId} className="card" style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "#92400e",
                            textAlign: "center",
                            padding: 6,
                          }}
                        >
                          {product?.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            product?.name?.slice(0, 12) || "Item"
                          )}
                        </div>

                        <div>
                          <Link to={`/products/${l.productId}`}>
                            <div style={{ fontWeight: 800 }}>
                              {product?.name || "Product unavailable"}
                            </div>
                          </Link>
                          <div className="small" style={{ marginTop: 4 }}>
                            {product?.category || "Handcrafted item"}
                          </div>
                          <div className="small" style={{ marginTop: 4 }}>
                            {product
                              ? `RWF ${Number(product.price).toLocaleString()} each`
                              : "Could not load product details"}
                          </div>
                          <div className="small" style={{ marginTop: 6, fontWeight: 700, color: "#b45309" }}>
                            Line total: RWF {lineTotal.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <label className="small">Qty</label>
                        <input
                          className="input"
                          style={{ width: 90 }}
                          type="number"
                          min={1}
                          value={l.quantity}
                          onChange={(e) =>
                            setLineQuantity(l.productId, Number(e.target.value))
                          }
                        />
                        <button
                          className="btn danger"
                          type="button"
                          onClick={() => removeLine(l.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-card" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Subtotal</div>
                  <div className="small">Includes artisan-ready packaging and local delivery support</div>
                </div>
                <div style={{ fontWeight: 800, color: '#a15c2a' }}>RWF {subtotal.toLocaleString()}</div>
              </div>
              <hr className="sep" />
              <div style={{ marginTop: 8 }}>
                <label className="small">Payment Method</label>
                <select
                  className="input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginTop: 6 }}
                >
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <Link className="btn" to="/products">
                Continue shopping
              </Link>
              <button
                className="btn primary"
                type="button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
