import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
        setOrder(data.order);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load order");
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
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div className="h1">Order Details</div>
            <div className="small">Order ID: {id}</div>
          </div>
          <Link className="btn" to="/orders">
            Back to orders
          </Link>
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

        {order ? (
          <div style={{ marginTop: 16 }}>
            <div className="badge">Status: {order.status}</div>
            <div style={{ fontWeight: 900, marginTop: 10, fontSize: 18 }}>
              ${Number(order.total).toFixed(2)}
            </div>
            <div className="small" style={{ marginTop: 8 }}>
              {new Date(order.createdAt).toLocaleString()}
            </div>

            <div className="card" style={{ padding: 14, marginTop: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Customer</div>
              <div className="small">{order.customer?.fullName}</div>
              <div className="small">{order.customer?.phone}</div>
              <div className="small">{order.customer?.email}</div>
              <div className="small">
                {order.customer?.address}, {order.customer?.city}
              </div>
            </div>

            <div className="card" style={{ padding: 14, marginTop: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Items</div>
              <div style={{ display: "grid", gap: 10 }}>
                {order.items?.map((it: any, idx: number) => (
                  <div key={idx} className="card" style={{ padding: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900 }}>{it.name}</div>
                        <div className="small">Qty: {it.quantity}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900 }}>
                          ${Number(it.lineTotal).toFixed(2)}
                        </div>
                        <div className="small">
                          Unit: ${Number(it.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
