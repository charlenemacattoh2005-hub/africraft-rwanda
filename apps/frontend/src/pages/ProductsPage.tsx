import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/products";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<string>("newest");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      category: category.trim() || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: sort || undefined,
    }),
    [q, category, minPrice, maxPrice, sort],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts(params as any);
        if (!mounted) return;
        setItems(data.items || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Products</div>
        <p className="p">Browse authentic Rwandan crafts and artisan items.</p>

        <div className="grid" style={{ marginTop: 18 }}>
          <div className="col-4">
            <label className="small">Search</label>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="name or description"
            />
          </div>
          <div className="col-4">
            <label className="small">Category</label>
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. art, pottery"
            />
          </div>
          <div className="col-4">
            <label className="small">Sort</label>
            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 14 }}>
          <div className="col-6">
            <label className="small">Min price</label>
            <input
              className="input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-6">
            <label className="small">Max price</label>
            <input
              className="input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10000"
            />
          </div>
        </div>

        {error ? (
          <div
            className="badge"
            style={{ marginTop: 16, borderColor: "rgba(251,113,133,.45)" }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: 18 }}>
          {loading ? <div className="small">Loading...</div> : null}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {items.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="card"
                style={{ padding: 0, overflow: "hidden", textDecoration: "none" }}
              >
                <div style={{ position: "relative" }}>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                    />
                  )}
                  {p.badge && (
                    <span style={{
                      position: "absolute", top: 8, left: 8,
                      background: "#c8a96e", color: "#fff",
                      fontSize: 11, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 4,
                    }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{p.name}</div>
                  <div className="small" style={{ marginBottom: 8, textTransform: "capitalize" }}>
                    {p.category}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 800 }}>RWF {Number(p.price).toLocaleString()}</div>
                    <div className="badge">Stock: {p.stock}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {!loading && items.length === 0 && !error ? (
            <div className="small" style={{ marginTop: 14 }}>
              No products found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
