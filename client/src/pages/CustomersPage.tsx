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
      <div className="h1" style={{ marginBottom: 4 }}>Customers</div>
      <p className="p" style={{ marginBottom: 20 }}>All registered customers on the platform.</p>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <input className="input" style={{ maxWidth:300 }} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="badge" style={{ alignSelf:'center' }}>{filtered.length} customers</div>
      </div>

      {loading && <div className="skeleton" style={{ height:200 }} />}
      {error && <div className="badge" style={{ borderColor:'rgba(220,38,38,.3)', color:'#dc2626', background:'rgba(220,38,38,.08)' }}>{error}</div>}

      {!loading && (
        <div className="dash-card">
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:24, color:'var(--muted)' }}>No customers found.</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#c2410c,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, flexShrink:0 }}>
                        {c.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontWeight:700 }}>{c.fullName}</span>
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
