import React from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 22 }}>
        <div className="h1">Contact Us</div>
        <p className="p">We would love to hear from you about orders, custom pieces, or wholesale inquiries.</p>

        <div className="grid" style={{ marginTop: 18 }}>
          <div className="col-6">
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Send us a message</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <input className="input" placeholder="Your name" />
                <input className="input" placeholder="Your email" />
                <input className="input" placeholder="Subject" />
                <textarea className="input" rows={4} placeholder="How can we help?" />
                <button className="btn primary">Send message</button>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Contact details</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div><strong>Phone:</strong> +250 794 049 090</div>
                <div><strong>Email:</strong> hello@dellcraft.rw</div>
                <div><strong>Address:</strong> KG 5 Ave, Kigali, Rwanda</div>
              </div>
              <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)' }}>
                <iframe
                  title="DellCraft Rwanda location"
                  src="https://www.google.com/maps?q=Kigali%20Rwanda&z=12&output=embed"
                  width="100%"
                  height="220"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link to="/products" className="btn">Browse products</Link>
        </div>
      </div>
    </div>
  );
}
