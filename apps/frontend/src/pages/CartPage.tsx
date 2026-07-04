import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CART_KEY = "africraft_cart_v1";

type CartLine = { productId: string; quantity: number };

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

  const cartItems = useMemo(() => lines, [lines]);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, l) => sum + l.quantity, 0),
    [cartItems],
  );

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Shopping Cart</div>
        <p className="p">Review quantities then proceed to checkout.</p>

        {cartItems.length === 0 ? (
          <div className="small" style={{ marginTop: 16 }}>
            Cart is empty. <Link to="/products">Browse products</Link>.
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div className="badge" style={{ marginBottom: 12 }}>
              Total items: {totalQuantity}
            </div>

            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}
            >
              {cartItems.map((l) => (
                <div key={l.productId} className="card" style={{ padding: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <Link className="small" to={`/products/${l.productId}`}>
                      Product ID: {l.productId}
                    </Link>

                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <input
                        className="input"
                        style={{ width: 120 }}
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
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
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
