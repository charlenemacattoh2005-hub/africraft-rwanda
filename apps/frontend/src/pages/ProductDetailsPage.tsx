import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/products";

const CART_KEY = "africraft_cart_v1";

type CartLine = { productId: string; quantity: number };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        x &&
        typeof x.productId === "string" &&
        Number.isFinite(Number(x.quantity)),
    );
  } catch {
    return [];
  }
}

function saveCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

function upsertLine(
  lines: CartLine[],
  productId: string,
  quantity: number,
): CartLine[] {
  const q = Math.max(1, Math.floor(quantity));
  const idx = lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) {
    const next = [...lines];
    next[idx] = { ...next[idx], quantity: next[idx].quantity + q };
    return next;
  }
  return [...lines, { productId, quantity: q }];
}

export default function ProductDetailsPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any | null>(null);

  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        if (!mounted) return;
        setProduct(data.item);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const canAdd = useMemo(() => {
    if (!product) return false;
    return qty >= 1 && product.stock >= qty && product.isActive !== false;
  }, [product, qty]);

  function addToCart() {
    if (!product || !id) return;
    const lines = loadCart();
    const next = upsertLine(lines, id, qty);
    saveCart(next);
    alert("Added to cart");
  }

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="h1">Product Details</div>
            <p className="p">Authentic Rwandan craft information.</p>
          </div>
          <div>
            <Link className="btn" to="/products">
              Back
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="small" style={{ marginTop: 16 }}>
            Loading...
          </div>
        ) : null}
        {error ? (
          <div
            className="badge"
            style={{ marginTop: 16, borderColor: "rgba(251,113,133,.45)" }}
          >
            {error}
          </div>
        ) : null}

        {product ? (
          <div style={{ marginTop: 16 }} className="grid">
            <div className="col-6">
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
                  />
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 900, fontSize: 22 }}>{product.name}</div>
                    {product.badge && (
                      <span style={{
                        background: "#c8a96e", color: "#fff",
                        fontSize: 11, fontWeight: 700,
                        padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap",
                      }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="small" style={{ marginBottom: 10, textTransform: "capitalize" }}>
                    {product.category}
                  </div>
                  <div className="p">{product.description}</div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card" style={{ padding: 16 }}>
                <div className="badge" style={{ marginBottom: 10 }}>
                  Price: RWF {Number(product.price).toLocaleString()}
                </div>
                <div className="badge" style={{ marginBottom: 14 }}>
                  Stock: {product.stock}
                </div>

                <label className="small">Quantity</label>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, Number(e.target.value)))
                    }
                    style={{ flex: 1 }}
                  />
                </div>

                <button
                  className={canAdd ? "btn primary" : "btn"}
                  style={{
                    cursor: canAdd ? "pointer" : "not-allowed",
                    width: "100%",
                    marginTop: 14,
                  }}
                  onClick={canAdd ? addToCart : undefined}
                  type="button"
                >
                  Add to cart
                </button>

                <div className="small" style={{ marginTop: 10 }}>
                  {product.stock < qty
                    ? "Quantity exceeds available stock."
                    : null}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Link className="btn" to="/cart" style={{ width: "100%" }}>
                    Go to cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
