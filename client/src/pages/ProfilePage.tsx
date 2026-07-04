import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { fetchProfile, updateProfile } from '../services/user';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

function ProfileInner() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProfile();
        if (!mounted) return;
        setForm({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
      };
      const data = await updateProfile(payload);
      setForm((current) => ({
        ...current,
        fullName: data.user.fullName || current.fullName,
        phone: data.user.phone || current.phone,
        address: data.user.address || current.address,
      }));
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">My Profile</div>
        <p className="p">Update your contact and delivery information.</p>

        {loading ? (
          <div className="small" style={{ marginTop: 16 }}>
            Loading profile...
          </div>
        ) : null}

        {error ? (
          <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(34,197,94,.45)' }}>
            {success}
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <label className="small">Full name</label>
          <input
            className="input"
            value={form.fullName}
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
          />

          <div style={{ height: 12 }} />
          <label className="small">Email</label>
          <input className="input" value={form.email} disabled />

          <div style={{ height: 12 }} />
          <label className="small">Phone</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />

          <div style={{ height: 12 }} />
          <label className="small">Address</label>
          <input
            className="input"
            value={form.address}
            onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
          />

          <button
            className={saving ? 'btn' : 'btn primary'}
            type="submit"
            disabled={saving || loading}
            style={{ width: '100%', marginTop: 16, cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
