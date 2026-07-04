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
    district: "",
    sector: "",
    address: "",
    paymentMethod: "MTN MoMo",
    deliveryNotes: "",
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
      navigate('/order-confirmation', {
        state: {
          orderNumber: data?.order?.orderNumber || data?.order?.id || `AFR${Date.now().toString().slice(-6)}`,
          total: data?.order?.total || 0,
          paymentMethod: customer.paymentMethod,
        },
      });
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
        <div className="page-trust-bar">
          <span className="badge">Secure delivery</span>
          <span className="badge">Mobile money support</span>
          <span className="badge">Order tracking ready</span>
        </div>

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
              <label className="small">Customer Name</label>
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
              <label className="small">District</label>
              <input
                className="input"
                value={customer.district}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, district: e.target.value }))
                }
              />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div className="grid">
            <div className="col-6">
              <label className="small">Sector</label>
              <input
                className="input"
                value={customer.sector}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, sector: e.target.value }))
                }
              />
            </div>
            <div className="col-6">
              <label className="small">Street Address</label>
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
              <label className="small">Payment Method</label>
              <select
                className="input"
                value={customer.paymentMethod}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, paymentMethod: e.target.value }))
                }
              >
                <option value="MTN MoMo">MTN MoMo</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            <div className="col-6">
              <label className="small">Delivery Notes</label>
              <input
                className="input"
                value={customer.deliveryNotes}
                onChange={(e) =>
                  setCustomer((s) => ({ ...s, deliveryNotes: e.target.value }))
                }
                placeholder="Leave at reception"
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
              <label className="small">Order Summary</label>
              <div className="summary-card" style={{ marginTop: 6 }}>
                <div style={{ fontWeight: 800 }}>Items: {cartLines.length}</div>
                <div className="small" style={{ marginTop: 4 }}>Delivery fee: RWF {(Number(deliveryFee || 0)).toLocaleString()}</div>
                <div className="small" style={{ marginTop: 4 }}>Estimated total: RWF {(Number(deliveryFee || 0) + 0).toLocaleString()}</div>
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
            {loading ? "Placing order..." : "Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
