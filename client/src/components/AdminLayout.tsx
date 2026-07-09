import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuthPayload } from '../services/api';
import { fetchNotifications } from '../services/admin';

/* ─────────────────────────────────────────────────────────────
   SVG ICONS — inline, zero external deps
───────────────────────────────────────────────────────────── */
const IC: Record<string, React.ReactNode> = {
  grid:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  box:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  receipt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8M16 12H8M11 16H8"/></svg>,
  users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  user:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  tag:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  star:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  message: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  sun:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  globe:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  menu:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  collapseLeft:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>,
  collapseRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  layers:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  truck:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
};

/* ─────────────────────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────────────────────── */
const ADMIN_NAV = [
  {
    section: 'Main',
    items: [
      { to: '/admin',            icon: 'grid',    label: 'Dashboard'   },
      { to: '/admin/orders',     icon: 'box',     label: 'Orders',     badge: '!' },
      { to: '/admin/products',   icon: 'layers',  label: 'Products'    },
      { to: '/admin/categories', icon: 'tag',     label: 'Categories'  },
      { to: '/admin/users',      icon: 'users',   label: 'Users'       },
      { to: '/admin/customers',  icon: 'user',    label: 'Customers'   },
    ],
  },
  {
    section: 'Reports',
    items: [
      { to: '/admin/reviews',    icon: 'star',    label: 'Reviews'     },
      { to: '/admin/analytics',  icon: 'chart',   label: 'Analytics'   },
    ],
  },
  {
    section: 'Config',
    items: [
      { to: '/admin/settings',   icon: 'settings',label: 'Settings'    },
      { to: '/',                 icon: 'globe',   label: 'Public Site' },
    ],
  },
];

const VENDOR_NAV = [
  {
    section: 'Vendor',
    items: [
      { to: '/vendor',           icon: 'grid',    label: 'Dashboard'   },
      { to: '/vendor/products',  icon: 'layers',  label: 'My Products' },
      { to: '/vendor/orders',    icon: 'box',     label: 'My Orders'   },
      { to: '/profile',          icon: 'user',    label: 'Profile'     },
      { to: '/',                 icon: 'globe',   label: 'Public Site' },
    ],
  },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin':            'Dashboard',
  '/admin/orders':     'Orders',
  '/admin/products':   'Products',
  '/admin/categories': 'Categories',
  '/admin/users':      'Users',
  '/admin/customers':  'Customers',
  '/admin/reviews':    'Reviews',
  '/admin/analytics':  'Analytics',
  '/admin/settings':   'Settings',
  '/vendor':           'Vendor Dashboard',
  '/vendor/products':  'My Products',
  '/vendor/orders':    'My Orders',
};

function isActive(to: string, pathname: string) {
  if (to === '/admin' || to === '/vendor' || to === '/') return pathname === to;
  return pathname === to || pathname.startsWith(to + '/');
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const payload  = getAuthPayload();
  const role     = payload?.role || 'admin';
  const name     = payload?.name || payload?.email || 'Admin';
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  const photo    = payload?.profilePhoto || '';

  const isVendor = role === 'vendor';
  const NAV      = isVendor ? VENDOR_NAV : ADMIN_NAV;

  /* ── state ── */
  const [collapsed,     setCollapsed]     = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [dark,          setDark]          = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [msgOpen,       setMsgOpen]       = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchVal,     setSearchVal]     = useState('');

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const msgRef     = useRef<HTMLDivElement>(null);

  /* ── theme toggle ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  /* ── fetch notifications ── */
  useEffect(() => {
    const token = localStorage.getItem('africraft_auth_token') || sessionStorage.getItem('africraft_auth_token');
    if (!token) return;
    fetchNotifications()
      .then(d => setNotifications((d.notifications || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (msgRef.current     && !msgRef.current.contains(e.target as Node))     setMsgOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── close mobile drawer on route change ── */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* ── breadcrumb ── */
  const crumbLabel = Object.entries(BREADCRUMB_MAP)
    .filter(([k]) => pathname === k || pathname.startsWith(k + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'Admin';

  function handleLogout() {
    localStorage.removeItem('africraft_auth_token');
    navigate('/login');
  }

  const unreadCount = notifications.length;

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div className={`adm-shell${collapsed ? ' is-collapsed' : ''}`}>

      {/* ══════════════════════════════════════════════════════
          SIDEBAR — lives in its own grid column, never overlaps
      ══════════════════════════════════════════════════════ */}
      <aside className={`adm-sb${mobileOpen ? ' is-open' : ''}`}>

        {/* Brand */}
        <Link to={isVendor ? '/vendor' : '/admin'} className="adm-sb-brand">
          <div className="adm-sb-brand-icon">🛒</div>
          <div className="adm-sb-brand-text">
            <span className="adm-sb-brand-name">AfriCraft</span>
            <span className="adm-sb-brand-sub">{isVendor ? 'Vendor Portal' : 'Admin Panel'}</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="adm-sb-nav" aria-label="Admin navigation">
          {NAV.map(group => (
            <React.Fragment key={group.section}>
              <div className="adm-sb-section-label">{group.section}</div>
              {group.items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`adm-sb-item${isActive(item.to, pathname) ? ' active' : ''}`}
                >
                  <span className="adm-sb-icon">
                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, display: 'none' }} />
                    {IC[item.icon]}
                  </span>
                  <span className="adm-sb-item-label">{item.label}</span>
                  {item.badge && <span className="adm-sb-badge">{item.badge}</span>}
                </Link>
              ))}
            </React.Fragment>
          ))}

          <div className="adm-sb-divider" />
          <Link to="/profile" title={collapsed ? 'Profile' : undefined}
            className={`adm-sb-item${pathname === '/profile' ? ' active' : ''}`}>
            <span className="adm-sb-icon">{IC.user}</span>
            <span className="adm-sb-item-label">Profile</span>
          </Link>
        </nav>

        {/* Collapse button */}
        <div className="adm-sb-footer">
          <button className="adm-sb-collapse-btn" onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <span className="adm-sb-collapse-icon">
              {collapsed ? IC.collapseRight : IC.collapseLeft}
            </span>
            <span className="adm-sb-collapse-label">{collapsed ? '' : 'Collapse'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="adm-overlay visible" onClick={() => setMobileOpen(false)} />
      )}

      {/* ══════════════════════════════════════════════════════
          BODY — topbar + scrollable content, beside sidebar
      ══════════════════════════════════════════════════════ */}
      <div className="adm-body">

        {/* ── Topbar ── */}
        <header className="adm-topbar" role="banner">

          {/* Left: hamburger + breadcrumb */}
          <div className="adm-topbar-left">
            <button className="adm-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              {IC.menu}
            </button>
            <nav className="adm-breadcrumb" aria-label="Breadcrumb">
              <Link to={isVendor ? '/vendor' : '/admin'}>
                {isVendor ? 'Vendor' : 'Admin'}
              </Link>
              {pathname !== '/admin' && pathname !== '/vendor' && (
                <>
                  <span className="adm-breadcrumb-sep">›</span>
                  <span className="adm-breadcrumb-current">{crumbLabel}</span>
                </>
              )}
            </nav>
          </div>

          {/* Right: search + actions */}
          <div className="adm-topbar-right">

            {/* Search */}
            <div className="adm-search">
              <span className="adm-search-ico">{IC.search}</span>
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search…"
                aria-label="Search admin"
              />
            </div>

            <div className="adm-topbar-rule" />

            {/* Notifications */}
            <div className="adm-dropdown-wrap" ref={notifRef}>
              <button className="adm-icon-btn" onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); setMsgOpen(false); }} aria-label="Notifications">
                {IC.bell}
                {unreadCount > 0 && <span className="adm-icon-btn-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="adm-dropdown notif-panel">
                  <div className="adm-dropdown-header">
                    <span className="adm-dropdown-title">Notifications</span>
                    <button className="adm-dropdown-action" onClick={() => setNotifOpen(false)}>Mark all read</button>
                  </div>
                  {notifications.length === 0
                    ? <div className="adm-notif-empty">No new notifications</div>
                    : notifications.map((n: any) => (
                      <div key={n._id} className="adm-notif-row">
                        <div className={`adm-notif-dot ${n.type || 'order'}`} />
                        <div className="adm-notif-body">
                          <div className="adm-notif-msg">{n.message}</div>
                          <div className="adm-notif-time">{n.time ? new Date(n.time).toLocaleTimeString() : 'Just now'}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="adm-dropdown-wrap" ref={msgRef}>
              <button className="adm-icon-btn" onClick={() => { setMsgOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }} aria-label="Messages">
                {IC.message}
              </button>
              {msgOpen && (
                <div className="adm-dropdown" style={{ minWidth: 260 }}>
                  <div className="adm-dropdown-header">
                    <span className="adm-dropdown-title">Messages</span>
                  </div>
                  <div className="adm-notif-empty">No messages yet</div>
                </div>
              )}
            </div>

            {/* Settings shortcut */}
            <Link to="/admin/settings" className="adm-icon-btn" title="Settings" aria-label="Settings">
              {IC.settings}
            </Link>

            {/* Theme toggle */}
            <button className="adm-theme-btn" onClick={() => setDark(d => !d)} aria-label="Toggle theme" title={dark ? 'Light mode' : 'Dark mode'}>
              {dark ? IC.sun : IC.moon}
            </button>

            <div className="adm-topbar-rule" />

            {/* Profile */}
            <div className="adm-dropdown-wrap" ref={profileRef}>
              <button className="adm-profile-btn" onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setMsgOpen(false); }} aria-label="Profile menu">
                <div className="adm-profile-avatar">
                  {photo ? <img src={photo} alt={name} /> : initials}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="adm-profile-name">{name.split(' ')[0]}</div>
                  <div className="adm-profile-role">{role}</div>
                </div>
              </button>
              {profileOpen && (
                <div className="adm-dropdown" style={{ minWidth: 220 }}>
                  <div className="adm-dropdown-header">
                    <span className="adm-dropdown-title">{name}</span>
                  </div>
                  <Link to="/profile" className="adm-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <span className="adm-dropdown-item-icon">{IC.user}</span>
                    My Profile
                  </Link>
                  <Link to="/admin/settings" className="adm-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <span className="adm-dropdown-item-icon">{IC.settings}</span>
                    Settings
                  </Link>
                  <Link to="/" className="adm-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <span className="adm-dropdown-item-icon">{IC.globe}</span>
                    View Store
                  </Link>
                  <button className="adm-dropdown-item danger" onClick={handleLogout}>
                    <span className="adm-dropdown-item-icon">{IC.logout}</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main scrollable content ── */}
        <main className="adm-main" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
