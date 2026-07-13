import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { getAuthPayload } from '../services/api';

export default function LoginPage() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string|null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError(null);
    try {
      await login(email, password);
      const payload = getAuthPayload();
      const dest = payload?.role === 'admin' ? '/admin'
        : payload?.role === 'vendor' ? '/vendor'
        : payload?.role === 'rider'  ? '/rider'
        : '/products';
      navigate(dest);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-logo">🛒</div>
            <span>DellCraft Rwanda</span>
          </div>
          <div className="auth-left-title">Authentic Rwandan crafts, delivered to your door.</div>
          <p className="auth-left-sub">Join thousands of customers discovering handmade treasures from local artisans.</p>
          <div className="auth-left-features">
            {['🌿 Ethically sourced', '✨ Handcrafted quality', '🚚 Fast local delivery', '🔒 Secure checkout'].map(f => (
              <div key={f} className="auth-left-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-form-title">Welcome back</div>
            <p className="auth-form-sub">Sign in to your account</p>
          </div>

          <form onSubmit={onSubmit} style={{ display:'grid', gap:16 }}>
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div className="auth-field">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label className="auth-label">Password</label>
              </div>
              <div style={{ position:'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                  style={{ paddingRight:44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:16 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">⚠️ {error}</div>
            )}

            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-demo-box">
            <div className="auth-demo-title">Demo credentials</div>
            <div style={{ display:'grid', gap:8, marginTop:8 }}>
              <button className="auth-demo-btn" type="button"
                onClick={() => { setEmail('admin@dellcraft.rw'); setPassword('Admin@2026!'); }}>
                👑 Admin — admin@dellcraft.rw
              </button>
              <button className="auth-demo-btn" type="button"
                onClick={() => { setEmail('vendor@dellcraft.rw'); setPassword('Admin@2026!'); }}>
                🏪 Vendor — vendor@dellcraft.rw
              </button>
              <button className="auth-demo-btn" type="button"
                onClick={() => { setEmail('rider@dellcraft.rw'); setPassword('Admin@2026!'); }}>
                🛵 Rider — rider@dellcraft.rw
              </button>
              <button className="auth-demo-btn" type="button"
                onClick={() => { setEmail('customer@dellcraft.rw'); setPassword('Admin@2026!'); }}>
                👤 Customer — customer@dellcraft.rw
              </button>
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
