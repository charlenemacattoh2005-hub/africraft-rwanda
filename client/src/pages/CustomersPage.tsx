import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchAdminCustomers } from '../services/admin';

export default function CustomersPage() {
  return (
    <RequireAuth>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

function Inner() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string|null>(null);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    let ok = true;
    fetchAdminCustomers()
      .then(d => { if (ok) setCustomers(d.users || []); })
      .catch(e => { if (ok) setError(e?.message || 'Failed'); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const filtered = customers.filter(c =>
    search === '' ||
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div className="admin-page-title">Customers</div>
        <p className="admin-page-sub">All registered customers on the platform.</p>
      </div>

      <div className="admin-toolbar">
        <input className="input" style={{ maxWidth: 300 }} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <span className="admin-toolbar-count">{filtered.length} customers</span>
      </div>

      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {error && (
        <div className="badge" style={{ borderColor: 'rgba(220,38,38,.3)', color: '#dc2626', background: 'rgba(220,38,38,.08)' }}>
          {error}
        </div>
      )}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No customers found.</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="admin-name-cell">
                      <div className="admin-avatar">{c.fullName?.[0]?.toUpperCase() || '?'}</div>
                      <span style={{ fontWeight: 700 }}>{c.fullName}</span>
                    </div>
                  </td>
                  <td className="small">{c.email}</td>
                  <td className="small">{c.phone || '—'}</td>
                  <td className="small">{c.address || '—'}</td>
                  <td className="small">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
