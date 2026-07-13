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

  // Subscribe to the shared warm-up server state
  const [serverState, setServerState] = useState<ServerState>('unknown');

  useEffect(() => {
    return onServerState(s => {
      setServerState(s);
      // When server becomes ready, clear any cold-start error so the
      // user can retry without stale messaging on screen
      if (s === 'ready') setError(null);
    });
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
      const msg: string = err?.message || 'Login failed. Please try again.';

      // ── KEY FIX ──────────────────────────────────────────────────
      // If the server is still starting up (cold start in progress),
      // the warmup banner already explains the situation.
      // Do NOT also show the network error — that causes the double
      // message problem. Instead, show a short, calm message that
      // doesn't blame the user's internet.
      if (serverState === 'starting' && (err?.isNetwork || err?.isTimeout || err?.isFinalFailure)) {
        setError('Server is still starting. Please wait and try again in a moment.');
      } else {
        setError(msg);
      }
      // ─────────────────────────────────────────────────────────────
    } finally {
      setLoading(false);
    }
  }

  // ── Server status banner ──────────────────────────────────────
  // Renders the appropriate banner based on server state.
  // Never shown simultaneously with a network error message.
  function ServerBanner() {
    switch (serverState) {
      case 'ready':
        return (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '8px 14px', borderRadius: 10,
              background: '#f0fdf4', border: '1px solid #22c55e',
              color: '#15803d', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span aria-hidden="true">✓</span>
            Server is ready — you can sign in.
          </div>
        );

      case 'starting':
        return (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '12px 14px', borderRadius: 10,
              background: '#fffbeb', border: '1px solid #f59e0b',
              color: '#92400e', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}
          >
            <span
              aria-hidden="true"
              style={{ display: 'inline-block', animation: 'spin 1s linear infinite', flexShrink: 0, fontSize: 16 }}
            >
              ⟳
            </span>
            <div>
              <div>Server is starting. This may take up to one minute.</div>
              <div style={{ fontWeight: 400, fontSize: 12, marginTop: 4, opacity: .8 }}>
                You can submit the form — your login will retry automatically.
              </div>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div
            role="alert"
            style={{
              padding: '12px 14px', borderRadius: 10,
              background: '#fef2f2', border: '1px solid #fca5a5',
              color: '#991b1b', fontSize: 13, fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              The DellCraft server is temporarily unavailable.
            </div>
            <div style={{ fontWeight: 400, fontSize: 12 }}>
              Possible reasons:<br />
              • Render is still starting.<br />
              • The backend deployment failed.<br />
              • The server is under maintenance.<br />
              <br />
              Please try again in one minute.
            </div>
          </div>
        );

      default:
        // 'unknown' — first ping hasn't returned yet, show nothing
        return null;
    }
  }

  // Decide whether to show the form-level error.
  // Suppress network/cold-start errors when the warmup banner already
  // explains the situation — prevents the double-message problem.
  const showError =
    error !== null &&
    !(serverState === 'starting' && error.includes('Server is still starting'));

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
            Join thousands of customers discovering handmade
            treasures from local artisans.
          </p>
          <div className="auth-left-features">
            {[
              '🌿 Ethically sourced',
              '✨ Handcrafted quality',
              '🚚 Fast local delivery',
              '🔒 Secure checkout',
            ].map(f => <div key={f} className="auth-left-feature">{f}</div>)}
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
                aria-label="Email address"
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
                  aria-label="Password"
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

            {/* Server warm-up banner — ONE source of truth for server state */}
            <ServerBanner />

            {/* Form-level error — only shown when not redundant with banner */}
            {showError && (
              <div className="auth-error" role="alert">
                ⚠️ {error}
              </div>
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
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
