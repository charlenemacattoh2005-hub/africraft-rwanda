import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { getAuthPayload } from '../services/api';
import { onServerState, type ServerState } from '../services/warmup';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  // Subscribe to the shared warmup server state
  const [serverState, setServerState] = useState<ServerState>('unknown');

  useEffect(() => {
    // onServerState returns an unsubscribe fn — clean up on unmount
    const unsub = onServerState(setServerState);
    return unsub;
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const payload = getAuthPayload();
      const dest =
        payload?.role === 'admin'  ? '/admin'  :
        payload?.role === 'vendor' ? '/vendor' :
        payload?.role === 'rider'  ? '/rider'  : '/products';
      navigate(dest);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Server status banner ────────────────────────────────────
  const ServerBanner = () => {
    if (serverState === 'ready') {
      return (
        <div style={{
          padding: '8px 14px', borderRadius: 10,
          background: '#f0fdf4', border: '1px solid #22c55e',
          color: '#15803d', fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ✓ Server is ready
        </div>
      );
    }

    if (serverState === 'starting') {
      return (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: '#fffbeb', border: '1px solid #f59e0b',
          color: '#92400e', fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            display: 'inline-block',
            animation: 'spin 1s linear infinite',
          }}>⟳</span>
          Server is starting up — this takes 20–60 seconds on first load.
          You can still try signing in.
        </div>
      );
    }

    // 'unknown' — still on first ping, show nothing yet
    return null;
  };

  return (
    <div className="auth-page">

      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-logo">🛒</div>
            <span>AfriCraft Rwanda</span>
          </div>
          <div className="auth-left-title">
            Authentic Rwandan crafts, delivered to your door.
          </div>
          <p className="auth-left-sub">
            Join thousands of customers discovering handmade treasures
            from local artisans.
          </p>
          <div className="auth-left-features">
            {[
              '🌿 Ethically sourced',
              '✨ Handcrafted quality',
              '🚚 Fast local delivery',
              '🔒 Secure checkout',
            ].map(f => (
              <div key={f} className="auth-left-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-card">

          <div className="auth-form-header">
            <div className="auth-form-title">Welcome back</div>
            <p className="auth-form-sub">Sign in to your account</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>

            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 16,
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Server status */}
            <ServerBanner />

            {/* Error message */}
            {error && (
              <div className="auth-error" role="alert">⚠️ {error}</div>
            )}

            <button
              className="btn primary auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading && <span className="auth-spinner" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>

          <div className="auth-divider"><span>or</span></div>

          {/* Demo credentials */}
          <div className="auth-demo-box">
            <div className="auth-demo-title">Demo credentials</div>
            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              {[
                { icon: '👑', label: 'Admin',    email: 'admin@dellcraft.rw'    },
                { icon: '🏪', label: 'Vendor',   email: 'vendor@dellcraft.rw'   },
                { icon: '🛵', label: 'Rider',    email: 'rider@dellcraft.rw'    },
                { icon: '👤', label: 'Customer', email: 'customer@dellcraft.rw' },
              ].map(u => (
                <button
                  key={u.email}
                  className="auth-demo-btn"
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword('Admin@2026!');
                    setError(null);
                  }}
                >
                  {u.icon} {u.label} — {u.email}
                </button>
              ))}
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
