import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(fullName, email, password);
      navigate("/products");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Register</div>
        <p className="p">Create your customer account.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <label className="small">Full name</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />

          <div style={{ height: 12 }} />
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
            placeholder="At least 6 chars"
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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div style={{ marginTop: 14 }} className="small">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
