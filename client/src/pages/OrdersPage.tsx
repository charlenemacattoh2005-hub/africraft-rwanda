import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../services/orders";
import RequireAuth from "../components/RequireAuth";

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersInner />
    </RequireAuth>
  );
}

function OrdersInner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyOrders();
        if (!mounted) return;
        setOrders(data.orders || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load orders");
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
        <div className="h1">My Orders</div>
        <p className="p">Track your purchases.</p>

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

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="card"
              style={{ padding: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>Order #{o._id}</div>
                  <div className="small">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="badge">Status: {o.status}</div>
                  <div style={{ fontWeight: 900, marginTop: 8 }}>
                    RWF {Number(o.total).toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!loading && orders.length === 0 && !error ? (
            <div className="small">No orders yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
