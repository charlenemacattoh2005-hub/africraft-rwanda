import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken, getAuthPayload } from "../services/api";
import { logout } from "../services/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const token = getAuthToken();
  const payload = getAuthPayload();
  const isAdmin = payload?.role === "admin";

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <div>
      <header className="nav">
        <div className="container navInner">
          <div className="brand">
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="19" fill="#8b5e3c"/>
                {/* Woven basket pattern */}
                <ellipse cx="19" cy="22" rx="11" ry="6" fill="#c89f65" stroke="#fff8ee" strokeWidth="0.8"/>
                <ellipse cx="19" cy="19" rx="11" ry="6" fill="#a0703a" stroke="#fff8ee" strokeWidth="0.8"/>
                <ellipse cx="19" cy="16" rx="8" ry="4" fill="#c89f65" stroke="#fff8ee" strokeWidth="0.8"/>
                <ellipse cx="19" cy="13.5" rx="5" ry="2.5" fill="#a0703a" stroke="#fff8ee" strokeWidth="0.8"/>
                {/* Weave lines */}
                <line x1="10" y1="19" x2="28" y2="19" stroke="#fff8ee" strokeWidth="0.6" strokeDasharray="2,2"/>
                <line x1="11" y1="22" x2="27" y2="22" stroke="#fff8ee" strokeWidth="0.6" strokeDasharray="2,2"/>
                <line x1="13" y1="16" x2="25" y2="16" stroke="#fff8ee" strokeWidth="0.6" strokeDasharray="2,2"/>
                {/* Handle */}
                <path d="M16 13.5 Q19 8 22 13.5" stroke="#fff8ee" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontWeight: 800, fontSize: 17, color: '#4d2f17', letterSpacing: 0.3 }}>DellCraft Rwanda</span>
            </Link>
          </div>

          <nav className="menu">
            <Link to="/products">Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/suggested-products">Suggested</Link>
            <Link to="/features">Features</Link>

            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/profile">My Profile</Link>
                <Link to="/orders">My Orders</Link>
                <Link to="/payment-simulation">Payment</Link>
                {isAdmin ? (
                  <>
                    <Link to="/admin">Admin</Link>
                    <Link to="/admin/reviews">Review moderation</Link>
                    <Link to="/admin/orders">Orders</Link>
                    <Link to="/customers">Customers</Link>
                  </>
                ) : null}
                <button
                  className="btn"
                  style={{ cursor: "pointer" }}
                  onClick={onLogout}
                  type="button"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
