import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import { fetchOrderById } from "../services/orders";

export default function OrderDetailsPage() {
  return (
    <RequireAuth>
      <OrderDetailsInner />
    </RequireAuth>
  );
}

function OrderDetailsInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderById(id);
        if (!mounted) return;
        setOrder(data.order || null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

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
            <div className="h1">Order Details</div>
            <p className="p">Review your order and shipping information.</p>
          </div>
          <div>
            <button className="btn" type="button" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="small" style={{ marginTop: 16 }}>
            Loading order...
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

        {order ? (
          <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20 }}>Order #{order._id}</div>
                  <div className="small" style={{ marginTop: 6 }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="badge">Status: {order.status}</div>
              </div>
            </div>

            <div className="grid">
              <div className="col-6">
                <div className="card" style={{ padding: 16 }}>
                  <div className="h1" style={{ fontSize: 18, marginBottom: 10 }}>
                    Delivery details
                  </div>
                  <div className="small">Name</div>
                  <div style={{ marginBottom: 10 }}>{order.customer.fullName}</div>
                  <div className="small">Phone</div>
                  <div style={{ marginBottom: 10 }}>{order.customer.phone}</div>
                  <div className="small">Email</div>
                  <div style={{ marginBottom: 10 }}>{order.customer.email}</div>
                  <div className="small">Address</div>
                  <div>{order.customer.address}{order.customer.district ? `, ${order.customer.district}` : ''}{order.customer.sector ? `, ${order.customer.sector}` : ''}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card" style={{ padding: 16 }}>
                  <div className="h1" style={{ fontSize: 18, marginBottom: 10 }}>
                    Order summary
                  </div>
                  <div className="small">Items</div>
                  <div style={{ marginBottom: 10 }}>{order.items.length}</div>
                  <div className="small">Subtotal</div>
                  <div style={{ marginBottom: 10 }}>
                    RWF {Number(order.subtotal).toLocaleString()}
                  </div>
                  <div className="small">Delivery fee</div>
                  <div style={{ marginBottom: 10 }}>
                    RWF {Number(order.deliveryFee).toLocaleString()}
                  </div>
                  <div className="small">Total</div>
                  <div style={{ fontWeight: 900, marginTop: 6 }}>
                    RWF {Number(order.total).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div className="h1" style={{ fontSize: 18, marginBottom: 14 }}>
                Order tracking
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Pending','Confirmed','Packaging','Shipped','Delivered'].map((step) => {
                  const current = order.status || 'Pending';
                  const active = ['Pending','Confirmed','Packaging','Shipped','Delivered'].indexOf(current) >= ['Pending','Confirmed','Packaging','Shipped','Delivered'].indexOf(step);
                  return (
                    <div key={step} className="badge" style={{ borderColor: active ? '#f59e0b' : '#ddd', background: active ? '#fef3c7' : 'transparent' }}>
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div className="h1" style={{ fontSize: 18, marginBottom: 14 }}>
                Items in this order
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {order.items.map((item: any) => (
                  <div key={item.productId} className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{item.name}</div>
                        <div className="small">Quantity: {item.quantity}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="small">Unit price</div>
                        <div>RWF {Number(item.unitPrice).toLocaleString()}</div>
                        <div className="small" style={{ marginTop: 6 }}>Line total</div>
                        <div>RWF {Number(item.lineTotal).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {!loading && !order && !error ? (
          <div className="small" style={{ marginTop: 16 }}>
            No order details available.
          </div>
        ) : null}
      </div>
    </div>
  );
}
