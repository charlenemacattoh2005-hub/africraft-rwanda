import React, { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../components/AdminLayout';
import { fetchNotifications, fetchActivityLog } from '../services/admin';

export default function AdminNotificationsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminLayout><Inner /></AdminLayout>
    </RequireAuth>
  );
}

const TYPE_ICON: Record<string, string> = { order: '📦', stock: '⚠️', user: '👤' };
const TYPE_COLOR: Record<string, string> = { order: '#3b82f6', stock: '#f59e0b', user: '#22c55e' };

function Inner() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [log,           setLog]           = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState<'notifications' | 'activity'>('notifications');

  useEffect(() => {
    Promise.all([fetchNotifications(), fetchActivityLog()])
      .then(([n, a]) => { setNotifications(n.notifications || []); setLog(a.log || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="accent-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Notifications</div>
          <p className="admin-page-sub">Platform alerts, stock warnings and activity log.</p>
        </div>
        {notifications.length > 0 && (
          <button className="btn" onClick={() => setNotifications([])}>Clear all</button>
        )}
      </div>

      <div className="vendor-tabs" style={{ marginBottom: 20 }}>
        <button className={`vendor-tab${tab === 'notifications' ? ' active' : ''}`} onClick={() => setTab('notifications')}>
          🔔 Notifications {notifications.length > 0 ? `(${notifications.length})` : ''}
        </button>
        <button className={`vendor-tab${tab === 'activity' ? ' active' : ''}`} onClick={() => setTab('activity')}>
          📋 Activity Log {log.length > 0 ? `(${log.length})` : ''}
        </button>
      </div>

      {loading && <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />}

      {!loading && tab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#a8a29e' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <div style={{ fontWeight: 700 }}>No notifications</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>You're all caught up!</div>
            </div>
          )}
          {notifications.map(n => (
            <div key={n._id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${TYPE_COLOR[n.type] || '#e5e7eb'}30`, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${TYPE_COLOR[n.type] || '#6b7280'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {TYPE_ICON[n.type] || '📣'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#78716c', marginTop: 3 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 6 }}>{n.time ? new Date(n.time).toLocaleString() : ''}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c2410c', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {log.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#a8a29e' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 700 }}>No activity yet</div>
            </div>
          )}
          {log.map((entry: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(194,65,12,.06)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: entry.type === 'order' ? 'rgba(194,65,12,.08)' : 'rgba(21,128,61,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {entry.type === 'order' ? '📦' : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#1c1917' }}>{entry.message}</div>
                <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 3 }}>{entry.time ? new Date(entry.time).toLocaleString() : ''}</div>
              </div>
              {entry.status && <span className={`status-badge status-${entry.status}`}>{entry.status}</span>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
