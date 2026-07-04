import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import { checkout } from "../services/orders";

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

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutInner />
    </RequireAuth>
  );
}

function CheckoutInner() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  const cartLines = useMemo(() => loadCart(), []);

  const [deliveryFee, setDeliveryFee] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (cartLines.length === 0) {
        setError("Your cart is empty.");
        setLoading(false);
        return;
      }

      const payload = {
        customer,
        deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
        items: cartLines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
      };

      const data = await checkout(payload);
      clearCart();
      navigate(`/orders/${data?.order?.id || ""}`);
    } catch (err: any) {
      setError(err?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Checkout</div>
        <p className="p">Provide delivery details to place your order.</p>

        {cartLines.length === 0 ? (
          <div
            className="badge"
            style={{ marginTop: 16, borderColor: "rgba(251,113,133,.45)" }}
          >
            Cart is empty.
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <div className="grid">
            <div className="col-6">
              <label className="small">Full name</label>
              <input
                className="input"
                value={customer.fullName}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, fullName: e.target.value }))
                }
              />
            </div>
            <div className="col-6">
              <label className="small">Phone</label>
              <input
                className="input"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div className="grid">
            <div className="col-6">
              <label className="small">Email</label>
              <input
                className="input"
                value={customer.email}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, email: e.target.value }))
                }
              />
            </div>
            <div className="col-6">
              <label className="small">City</label>
              <input
                className="input"
                value={customer.city}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, city: e.target.value }))
                }
              />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div className="grid">
            <div className="col-12">
              <label className="small">Address</label>
              <input
                className="input"
                value={customer.address}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, address: e.target.value }))
                }
              />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div className="grid">
            <div className="col-6">
              <label className="small">Delivery fee (optional)</label>
              <input
                className="input"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="col-6">
              <label className="small">Items in cart</label>
              <div className="badge" style={{ marginTop: 6 }}>
                Lines: {cartLines.length}
              </div>
            </div>
          </div>

          {error ? (
            <div
              className="badge"
              style={{ marginTop: 14, borderColor: "rgba(251,113,133,.45)" }}
            >
              {error}
            </div>
          ) : null}

          <button
            className={loading ? "btn" : "btn primary"}
            type="submit"
            disabled={loading || cartLines.length === 0}
            style={{ width: "100%", marginTop: 16, cursor: "pointer" }}
          >
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>
    </div>
  );
}
