import React, { useEffect, useState, useRef } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAllUsers, createUser, updateUser, deleteUser, assignRole, suspendUser } from '../services/admin';

export default function AdminUsersPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const ROLES = ['customer', 'vendor', 'rider', 'admin'];
const ROLE_COLORS: Record<string, string> = {
  admin: '#7c3aed', vendor: '#0891b2', rider: '#d97706', customer: '#15803d',
};
const EMPTY_FORM = { fullName: '', email: '', password: '', role: 'customer', phone: '', address: '', bio: '', profilePhoto: '' };

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function UserModal({ title, form, setForm, onSave, onClose, saving, isEdit }: {
  title: string; form: any; setForm: (f: any) => void;
  onSave: () => void; onClose: () => void; saving: boolean; isEdit: boolean;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, profilePhoto: await fileToBase64(file) });
  }
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal admin-modal-wide">
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-modal-col">
            <div className="admin-field" style={{ alignItems: 'center' }}>
              <div className="user-photo-preview" onClick={() => photoRef.current?.click()}>
                {form.profilePhoto
                  ? <img src={form.profilePhoto} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <span style={{ fontSize: 32 }}>👤</span>}
                <div className="user-photo-overlay">📷 Upload</div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              <span style={{ fontSize: 11, color: '#78716c', marginTop: 4 }}>Click to upload photo</span>
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Full Name *</label>
                <input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="admin-field">
                <label>Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
            <div className="admin-field">
              <label>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <div className="admin-modal-grid2">
              <div className="admin-field">
                <label>Role *</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+250 7XX XXX XXX" />
              </div>
            </div>
            <div className="admin-field">
              <label>Address</label>
              <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="District, Kigali" />
            </div>
            <div className="admin-field">
              <label>Bio</label>
              <textarea className="input admin-textarea" rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Short bio…" />
            </div>
          </div>
          <div className="admin-modal-preview">
            <div className="admin-preview-label">Preview</div>
            <div className="user-preview-card">
              <div className="user-preview-avatar">
                {form.profilePhoto
                  ? <img src={form.profilePhoto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <span>{form.fullName?.[0]?.toUpperCase() || '?'}</span>}
              </div>
              <div className="user-preview-name">{form.fullName || 'Full Name'}</div>
              <div className="user-preview-email">{form.email || 'email@example.com'}</div>
              <span className="user-role-badge" style={{ background: ROLE_COLORS[form.role] + '20', color: ROLE_COLORS[form.role], border: `1px solid ${ROLE_COLORS[form.role]}40` }}>
                {form.role}
              </span>
              {form.bio && <div className="user-preview-bio">{form.bio}</div>}
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save User'}</button>
        </div>
      </div>
    </div>
  );
}

function RoleModal({ user, onSave, onClose, saving }: { user: any; onSave: (r: string) => void; onClose: () => void; saving: boolean }) {
  const [role, setRole] = useState(user.role);
  const desc: Record<string, string> = {
    admin: 'Full access to all platform features',
    vendor: 'Can create and manage their own products',
    rider: 'Handles deliveries and updates order status',
    customer: 'Regular buyer — can browse and place orders',
  };
  return (
    <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 400 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Assign Role — {user.fullName}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROLES.map(r => (
            <label key={r} className="user-role-option"
              style={{ borderColor: role === r ? ROLE_COLORS[r] : 'transparent', background: role === r ? ROLE_COLORS[r] + '10' : '' }}>
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
              <span className="user-role-badge" style={{ background: ROLE_COLORS[r] + '20', color: ROLE_COLORS[r] }}>{r}</span>
              <span className="user-role-desc">{desc[r]}</span>
            </label>
          ))}
        </div>
        <div className="admin-modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(role)} disabled={saving}>{saving ? 'Saving…' : 'Assign Role'}</button>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [users,      setUsers]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [creating,   setCreating]   = useState(false);
  const [editing,    setEditing]    = useState<any>(null);
  const [assigning,  setAssigning]  = useState<any>(null);
  const [form,       setForm]       = useState<any>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    fetchAllUsers().then(d => setUsers(d.users || [])).finally(() => setLoading(false));
  }

  function showToast(msg: string, type: 'success'|'error' = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  async function onSaveCreate() {
    if (!form.fullName || !form.email || !form.password) { showToast('Name, email and password required', 'error'); return; }
    setSaving(true);
    try {
      const res = await createUser(form);
      if (res.user) { setUsers(p => [res.user, ...p]); setCreating(false); showToast('User created'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: any = { fullName: form.fullName, email: form.email, role: form.role, phone: form.phone, address: form.address, bio: form.bio, profilePhoto: form.profilePhoto };
      if (form.password) payload.password = form.password;
      const res = await updateUser(editing._id, payload);
      if (res.user) { setUsers(p => p.map(u => u._id === editing._id ? res.user : u)); setEditing(null); showToast('User updated'); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onAssignRole(role: string) {
    if (!assigning) return;
    setSaving(true);
    try {
      const res = await assignRole(assigning._id, role);
      if (res.user) { setUsers(p => p.map(u => u._id === assigning._id ? res.user : u)); setAssigning(null); showToast(`Role updated to ${role}`); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  }

  async function onSuspend(u: any) {
    const isSuspending = u.isActive !== false;
    if (!confirm(`${isSuspending ? 'Suspend' : 'Activate'} "${u.fullName}"?`)) return;
    try {
      const res = await suspendUser(u._id, isSuspending);
      if (res.user) { setUsers(p => p.map(x => x._id === u._id ? res.user : x)); showToast(`User ${isSuspending ? 'suspended' : 'activated'}`); }
      else showToast(res.message || 'Failed', 'error');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  async function onDelete(u: any) {
    if (!confirm(`Delete "${u.fullName}"? This cannot be undone.`)) return;
    try {
      await deleteUser(u._id);
      setUsers(p => p.filter(x => x._id !== u._id));
      showToast('User deleted');
    } catch (e: any) { showToast(e?.message || 'Failed', 'error'); }
  }

  const filtered = users.filter(u => {
    const ms = search === '' || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === 'All' || u.role === roleFilter;
    return ms && mr;
  });

  const roleCounts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>);

  return (
    <>
      <div className="accent-bar" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
      {creating  && <UserModal title="Create User" form={form} setForm={setForm} onSave={onSaveCreate} onClose={() => setCreating(false)} saving={saving} isEdit={false} />}
      {editing   && <UserModal title="Edit User"   form={form} setForm={setForm} onSave={onSaveEdit}   onClose={() => setEditing(null)}   saving={saving} isEdit={true}  />}
      {assigning && <RoleModal user={assigning} onSave={onAssignRole} onClose={() => setAssigning(null)} saving={saving} />}

      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">User Management</div>
          <p className="admin-page-sub">Create, edit, suspend users and assign roles.</p>
        </div>
        <button className="btn primary" onClick={() => { setForm(EMPTY_FORM); setCreating(true); }}>＋ Add User</button>
      </div>

      {/* Role summary */}
      <div className="user-role-summary">
        {ROLES.map(r => (
          <div key={r} className="user-role-card" style={{ borderTop: `3px solid ${ROLE_COLORS[r]}` }}
            onClick={() => setRoleFilter(roleFilter === r ? 'All' : r)}>
            <div className="user-role-card-count" style={{ color: ROLE_COLORS[r] }}>{roleCounts[r] || 0}</div>
            <div className="user-role-card-label">{r}s</div>
          </div>
        ))}
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 300 }} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="All">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <span className="admin-toolbar-count">{filtered.length} users</span>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 16 }} /> : (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="dash-table-empty">No users found.</td></tr>}
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="admin-name-cell">
                      <div className="admin-avatar" style={{ background: ROLE_COLORS[u.role] + '20', color: ROLE_COLORS[u.role] }}>
                        {u.profilePhoto
                          ? <img src={u.profilePhoto} alt={u.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          : u.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{u.fullName}</div>
                        {u.bio && <div style={{ fontSize: 11, color: '#78716c' }}>{u.bio.slice(0, 40)}{u.bio.length > 40 ? '…' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>{u.email}</td>
                  <td>
                    <span className="user-role-badge" style={{ background: ROLE_COLORS[u.role] + '20', color: ROLE_COLORS[u.role], border: `1px solid ${ROLE_COLORS[u.role]}40` }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: 12, color: '#78716c' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`status-badge ${u.isActive !== false ? 'status-active' : 'status-suspended'}`}>
                      {u.isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn-edit"   onClick={() => { setForm({ ...u, password: '', profilePhoto: u.profilePhoto || '' }); setEditing(u); }}>✏️</button>
                      <button className="admin-btn-view"   onClick={() => setAssigning(u)}>🎭</button>
                      <button className="admin-btn-edit"   onClick={() => onSuspend(u)} style={{ background: u.isActive !== false ? 'rgba(245,158,11,.08)' : 'rgba(21,128,61,.08)', color: u.isActive !== false ? '#d97706' : '#15803d', borderColor: u.isActive !== false ? 'rgba(245,158,11,.2)' : 'rgba(21,128,61,.2)' }}>
                        {u.isActive !== false ? '⏸' : '▶'}
                      </button>
                      <button className="admin-btn-delete" onClick={() => onDelete(u)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
