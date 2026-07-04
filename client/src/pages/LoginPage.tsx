import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/products");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Login</div>
        <p className="p">Sign in to checkout and view your orders.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <label className="small">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <div style={{ height: 12 }} />
          <label className="small">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />

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
            disabled={loading}
            style={{ width: "100%", marginTop: 16, cursor: "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: 14 }} className="small">
          No account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
