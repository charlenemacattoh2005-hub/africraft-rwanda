import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { fetchProfile, updateProfile } from '../services/user';
import { Button, Input, Badge } from '../components/ui';

export default function ProfilePage() {
  return <RequireAuth><ProfileInner /></RequireAuth>;
}

function ProfileInner() {
  const [form,    setForm]    = useState({ fullName: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchProfile();
        if (!mounted) return;
        setForm({
          fullName: data.user.fullName || '',
          email:    data.user.email    || '',
          phone:    data.user.phone    || '',
          address:  data.user.address  || '',
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load profile');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      const data = await updateProfile({ fullName: form.fullName, phone: form.phone, address: form.address });
      setForm((cur) => ({
        ...cur,
        fullName: data.user.fullName || cur.fullName,
        phone:    data.user.phone    || cur.phone,
        address:  data.user.address  || cur.address,
      }));
      setSuccess('Profile updated successfully ✓');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  }

  const initials = form.fullName
    ? form.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="container page">
      <div className="account-header">
        <div>
          <h1 className="account-title">My Profile</h1>
          <p className="account-subtitle">Manage your account and delivery information</p>
        </div>
      </div>

      {/* Avatar row */}
      {!loading && (
        <div className="profile-info-row">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div>
            <div className="profile-name">{form.fullName || 'Your name'}</div>
            <div className="profile-email">{form.email}</div>
          </div>
        </div>
      )}

      {error   && <Badge variant="error"   style={{ marginBottom: 16 }}>{error}</Badge>}
      {success && <Badge variant="success" style={{ marginBottom: 16 }}>{success}</Badge>}

      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>

          <div className="form-section">
            <div className="form-section-title">👤 Personal information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input
                label="Full name"
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                placeholder="Your full name"
              />
              <Input
                label="Email address"
                value={form.email}
                disabled
                style={{ opacity: .7 }}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">📞 Contact & delivery</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input
                label="Phone number"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                placeholder="+250 7XX XXX XXX"
                type="tel"
              />
              <Input
                label="Delivery address"
                value={form.address}
                onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                placeholder="Street, district, Kigali"
              />
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            loading={saving}
            disabled={saving || loading}
            style={{ maxWidth: 240 }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      )}
    </div>
  );
}
