import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError('Please fill in all required fields.'); return; }
    setSending(true); setError(null);
    // Simulate send (replace with real API call if needed)
    await new Promise(r => setTimeout(r, 1200));
    setSending(false); setSent(true);
  }

  const CONTACTS = [
    { icon: '📞', label: 'Phone', value: '+250 794 049 090' },
    { icon: '📧', label: 'Email', value: 'hello@africraft.rw' },
    { icon: '📍', label: 'Address', value: 'KG 5 Ave, Kigali, Rwanda' },
    { icon: '🕐', label: 'Hours', value: 'Mon–Sat: 8am – 6pm' },
  ];

  return (
    <div className="container page">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="account-title">Contact Us</h1>
        <p className="account-subtitle">We'd love to hear from you — orders, custom pieces, or wholesale inquiries.</p>
      </div>

      <div className="contact-layout">
        {/* Form */}
        <div className="contact-form-card">
          <div className="profile-section-title">✉️ Send us a message</div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Message sent!</div>
              <p style={{ color: '#78716c', marginBottom: 20 }}>We'll get back to you within 24 hours.</p>
              <button className="btn primary" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="admin-field">
                  <label>Your Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                </div>
                <div className="admin-field">
                  <label>Email Address *</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
                </div>
              </div>
              <div className="admin-field">
                <label>Subject</label>
                <input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Order inquiry, custom piece, wholesale…" />
              </div>
              <div className="admin-field">
                <label>Message *</label>
                <textarea className="input admin-textarea" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="How can we help you?" />
              </div>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button className="btn primary" type="submit" disabled={sending} style={{ maxWidth: 200 }}>
                {sending ? '⏳ Sending…' : '📨 Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div className="contact-form-card">
            <div className="profile-section-title">📋 Contact Details</div>
            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {CONTACTS.map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 20, width: 32, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: '#78716c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.label}</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="contact-form-card" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              title="AfriCraft Rwanda location"
              src="https://www.google.com/maps?q=Kigali+Rwanda&z=13&output=embed"
              width="100%" height="240" loading="lazy"
              style={{ border: 'none', display: 'block' }}
            />
          </div>

          {/* Quick links */}
          <div className="contact-form-card">
            <div className="profile-section-title">🔗 Quick Links</div>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <Link to="/products" className="btn" style={{ justifyContent: 'center' }}>🛍️ Browse Products</Link>
              <Link to="/orders" className="btn" style={{ justifyContent: 'center' }}>📦 Track My Order</Link>
              <Link to="/register" className="btn" style={{ justifyContent: 'center' }}>👤 Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
