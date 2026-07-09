import React, { useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';

export default function AdminSettingsPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`admin-toggle${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
      type="button"
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="settings-section">
      <div className="settings-section-title">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}</div>
        {desc && <div className="settings-row-desc">{desc}</div>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function Inner() {
  const [saved, setSaved] = useState(false);

  // Branding
  const [siteName,    setSiteName]    = useState('AfriCraft Rwanda');
  const [tagline,     setTagline]     = useState('Authentic handmade goods from Rwanda\'s finest artisans.');
  const [logoUrl,     setLogoUrl]     = useState('');
  const [primaryColor,setPrimaryColor]= useState('#c2410c');
  const [contactEmail,setContactEmail]= useState('hello@africraft.rw');
  const [contactPhone,setContactPhone]= useState('+250 794 049 090');
  const [address,     setAddress]     = useState('Kigali, Rwanda');

  // Header
  const [announceBar,  setAnnounceBar]  = useState(true);
  const [announceText, setAnnounceText] = useState('🌿 Free delivery on orders over RWF 20,000 · Authentic Rwandan crafts · Support local artisans');
  const [showWishlist, setShowWishlist] = useState(true);
  const [showSearch,   setShowSearch]   = useState(true);

  // Footer
  const [footerTagline,  setFooterTagline]  = useState('Every purchase supports a local maker.');
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [fbUrl,  setFbUrl]  = useState('#');
  const [igUrl,  setIgUrl]  = useState('#');
  const [twUrl,  setTwUrl]  = useState('#');

  // Features
  const [reviewsEnabled,  setReviewsEnabled]  = useState(true);
  const [wishlistEnabled, setWishlistEnabled] = useState(true);
  const [guestCheckout,   setGuestCheckout]   = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [freeDeliveryMin, setFreeDeliveryMin] = useState('20000');

  function onSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Site Settings</div>
          <p className="admin-page-sub">Control branding, header, footer and feature flags.</p>
        </div>
        <button className="btn primary" onClick={onSave}>
          {saved ? '✓ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="settings-saved-banner">✓ Settings saved successfully.</div>
      )}

      <div className="settings-grid">
        {/* ── Left column ── */}
        <div>
          <Section title="🏷️ Branding">
            <Row label="Site Name" desc="Shown in the browser tab and header.">
              <input className="input" value={siteName} onChange={e => setSiteName(e.target.value)} />
            </Row>
            <Row label="Tagline" desc="Short description shown in the footer.">
              <input className="input" value={tagline} onChange={e => setTagline(e.target.value)} />
            </Row>
            <Row label="Logo URL" desc="Leave blank to use the default SVG logo.">
              <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://…" />
            </Row>
            <Row label="Primary Colour">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: 40, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                <input className="input" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: 110 }} />
              </div>
            </Row>
          </Section>

          <Section title="📞 Contact Info">
            <Row label="Contact Email">
              <input className="input" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </Row>
            <Row label="Phone Number">
              <input className="input" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </Row>
            <Row label="Address">
              <input className="input" value={address} onChange={e => setAddress(e.target.value)} />
            </Row>
          </Section>

          <Section title="🔗 Social Media">
            <Row label="Facebook URL">
              <input className="input" value={fbUrl} onChange={e => setFbUrl(e.target.value)} placeholder="https://facebook.com/…" />
            </Row>
            <Row label="Instagram URL">
              <input className="input" value={igUrl} onChange={e => setIgUrl(e.target.value)} placeholder="https://instagram.com/…" />
            </Row>
            <Row label="Twitter / X URL">
              <input className="input" value={twUrl} onChange={e => setTwUrl(e.target.value)} placeholder="https://twitter.com/…" />
            </Row>
          </Section>
        </div>

        {/* ── Right column ── */}
        <div>
          <Section title="📢 Header">
            <Row label="Announcement Bar" desc="Top banner shown to all visitors.">
              <Toggle on={announceBar} onChange={setAnnounceBar} />
            </Row>
            {announceBar && (
              <Row label="Announcement Text">
                <textarea className="input admin-textarea" rows={2} value={announceText}
                  onChange={e => setAnnounceText(e.target.value)} />
              </Row>
            )}
            <Row label="Show Wishlist Icon" desc="Heart icon in the header nav.">
              <Toggle on={showWishlist} onChange={setShowWishlist} />
            </Row>
            <Row label="Show Search Bar">
              <Toggle on={showSearch} onChange={setShowSearch} />
            </Row>
          </Section>

          <Section title="🦶 Footer">
            <Row label="Footer Tagline">
              <input className="input" value={footerTagline} onChange={e => setFooterTagline(e.target.value)} />
            </Row>
            <Row label="Newsletter Signup" desc="Email subscription form in footer.">
              <Toggle on={showNewsletter} onChange={setShowNewsletter} />
            </Row>
          </Section>

          <Section title="⚙️ Features">
            <Row label="Product Reviews" desc="Allow customers to leave reviews.">
              <Toggle on={reviewsEnabled} onChange={setReviewsEnabled} />
            </Row>
            <Row label="Wishlist" desc="Allow customers to save products.">
              <Toggle on={wishlistEnabled} onChange={setWishlistEnabled} />
            </Row>
            <Row label="Guest Checkout" desc="Allow checkout without an account.">
              <Toggle on={guestCheckout} onChange={setGuestCheckout} />
            </Row>
            <Row label="Free Delivery Minimum (RWF)" desc="Set to 0 to disable free delivery.">
              <input className="input" type="number" min="0" value={freeDeliveryMin}
                onChange={e => setFreeDeliveryMin(e.target.value)} style={{ width: 130 }} />
            </Row>
            <Row label="Maintenance Mode" desc="Show a maintenance page to all visitors.">
              <Toggle on={maintenanceMode} onChange={setMaintenanceMode} />
            </Row>
          </Section>
        </div>
      </div>
    </>
  );
}
