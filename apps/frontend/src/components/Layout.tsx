import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "../services/api";
import { logout } from "../services/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const token = getAuthToken();

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <div>
      <header className="nav">
        <div className="container navInner">
          <div className="brand">
            <div className="logo" />
            <Link
              to="/"
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span>DellCraft Rwanda</span>
            </Link>
          </div>

          <nav className="menu">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>

            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/orders">My Orders</Link>
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
