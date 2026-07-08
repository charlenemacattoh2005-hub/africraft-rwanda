import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState<string|null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError(null);
    try {
      await register(fullName, email, password);
      navigate('/products');
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#dc2626', '#d97706', '#15803d'];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-logo">🛒</div>
            <span>DellCraft Rwanda</span>
          </div>
          <div className="auth-left-title">Start shopping authentic Rwandan crafts today.</div>
          <p className="auth-left-sub">Create your free account and explore hundreds of handmade products from local artisans.</p>
          <div className="auth-left-features">
            {['🎁 Free account', '📦 Track your orders', '❤️ Save to wishlist', '⭐ Leave reviews'].map(f => (
              <div key={f} className="auth-left-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-form-title">Create account</div>
            <p className="auth-form-sub">Join the DellCraft community</p>
          </div>

          <form onSubmit={onSubmit} style={{ display:'grid', gap:14 }}>
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input className="input" placeholder="Your full name"
                value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="At least 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight:44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:16 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
                  <div style={{ flex:1, height:4, borderRadius:999, background:'#e5e7eb', overflow:'hidden' }}>
                    <div style={{ width:`${(strength/3)*100}%`, height:'100%', background:strengthColor[strength], borderRadius:999, transition:'width .3s' }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:strengthColor[strength] }}>{strengthLabel[strength]}</span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <input className="input" type="password" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button className="btn primary auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
