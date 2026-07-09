import React, { useEffect, useState, useRef } from 'react';
import RequireAuth from '../components/RequireAuth';
import { fetchProfile, updateProfile, changePassword } from '../services/user';

export default function ProfilePage() {
  return <RequireAuth><ProfileInner /></RequireAuth>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProfileInner() {
  const [form,    setForm]    = useState({ fullName: '', email: '', phone: '', address: '', bio: '', profilePhoto: '' });
  const [pwForm,  setPwForm]  = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile()
      .then(d => setForm({ fullName: d.user.fullName || '', email: d.user.email || '', phone: d.user.phone || '', address: d.user.address || '', bio: d.user.bio || '', profilePhoto: d.user.profilePhoto || '' }))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setForm(f => ({ ...f, profilePhoto: b64 }));
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ fullName: form.fullName, phone: form.phone, address: form.address, bio: form.bio, profilePhoto: form.profilePhoto });
      setForm(f => ({ ...f, ...res.user }));
      showToast('Profile updated successfully ✓');
    } catch (err: any) { showToast(err?.message || 'Failed to update profile', 'error'); }
    finally { setSaving(false); }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { showToast('New passwords do not match', 'error'); return; }
    if (pwForm.newPassword.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully ✓');
    } catch (err: any) { showToast(err?.message || 'Failed to change password', 'error'); }
    finally { setPwSaving(false); }
  }

  const initials = form.fullName ? form.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div className="container page">
      {toast && (
        <div className={`admin-toast ${toast.type}`} style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className="account-header">
        <h1 className="account-title">My Profile</h1>
        <p className="account-subtitle">Manage your account, photo and security settings</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 28 }}>

          {/* ── Profile Info ── */}
          <form onSubmit={onSaveProfile} className="profile-section-card">
            <div className="profile-section-title">👤 Personal Information</div>

            {/* Avatar upload */}
            <div className="profile-avatar-row">
              <div className="profile-avatar-wrap" onClick={() => photoRef.current?.click()}>
                {form.profilePhoto
                  ? <img src={form.profilePhoto} alt="profile" className="profile-avatar-img" />
                  : <div className="profile-avatar">{initials}</div>}
                <div className="profile-avatar-overlay">📷<br /><span>Change Photo</span></div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              <div>
                <div className="profile-name">{form.fullName || 'Your name'}</div>
                <div className="profile-email">{form.email}</div>
                <button type="button" className="btn" style={{ marginTop: 8, fontSize: 12, padding: '6px 14px' }} onClick={() => photoRef.current?.click()}>
                  📁 Upload from Desktop
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="admin-field">
                <label>Full Name</label>
                <input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Your full name" />
              </div>
              <div className="admin-field">
                <label>Email Address</label>
                <input className="input" value={form.email} disabled style={{ opacity: .6 }} />
              </div>
              <div className="admin-field">
                <label>Phone Number</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" type="tel" />
              </div>
              <div className="admin-field">
                <label>Delivery Address</label>
                <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, district, Kigali" />
              </div>
            </div>
            <div className="admin-field">
              <label>Bio</label>
              <textarea className="input admin-textarea" rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A short bio about yourself…" />
            </div>
            <button className="btn primary" type="submit" disabled={saving} style={{ maxWidth: 200 }}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </form>

          {/* ── Change Password ── */}
          <form onSubmit={onChangePassword} className="profile-section-card">
            <div className="profile-section-title">🔒 Change Password</div>
            <div style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
              <div className="admin-field">
                <label>Current Password</label>
                <input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Enter current password" />
              </div>
              <div className="admin-field">
                <label>New Password</label>
                <input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 6 characters" />
              </div>
              <div className="admin-field">
                <label>Confirm New Password</label>
                <input className="input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" />
              </div>
            </div>
            <button className="btn primary" type="submit" disabled={pwSaving} style={{ maxWidth: 200, marginTop: 8 }}>
              {pwSaving ? 'Updating…' : '🔑 Update Password'}
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
