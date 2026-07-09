import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuthPayload } from '../services/api';

const NAV_LINKS = [
  { to: '/admin',             icon: '📊', label: 'Dashboard'  },
  { to: '/admin/orders',      icon: '📦', label: 'Orders'     },
  { to: '/admin/products',    icon: '🛍️', label: 'Products'   },
  { to: '/admin/categories',  icon: '📂', label: 'Categories' },
  { to: '/admin/customers',   icon: '👥', label: 'Customers'  },
  { to: '/admin/reviews',     icon: '⭐', label: 'Reviews'    },
  { to: '/admin/analytics',   icon: '📈', label: 'Analytics'  },
  { to: '/admin/settings',    icon: '⚙️', label: 'Settings'   },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin':            'Dashboard',
  '/admin/orders':     'Orders',
  '/admin/products':   'Products',
  '/admin/categories': 'Categories',
  '/admin/customers':  'Customers',
  '/admin/reviews':    'Reviews',
  '/admin/analytics':  'Analytics',
  '/admin/settings':   'Settings',
};

function isActive(linkTo: string, pathname: string) {
  if (linkTo === '/admin') return pathname === '/admin';
  return pathname === linkTo || pathname.startsWith(linkTo + '/');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const payload  = getAuthPayload();
  const name     = payload?.name || payload?.email || 'Admin';
  const initials = name[0].toUpperCase();

  const currentLabel = Object.entries(BREADCRUMB_MAP)
    .filter(([key]) => pathname === key || pathname.startsWith(key + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'Admin';

  return (
    <div className={`admin-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">🛒</div>
          <span>AfriCraft</span>
        </div>

        <div className="admin-sidebar-title">Main Menu</div>

        {NAV_LINKS.slice(0, 6).map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`admin-nav-link${isActive(l.to, pathname) ? ' active' : ''}`}
            title={collapsed ? l.label : undefined}
          >
            <span className="admin-nav-icon">{l.icon}</span>
            <span className="admin-nav-label">{l.label}</span>
          </Link>
        ))}

        <hr className="admin-sidebar-divider" />
        <div className="admin-sidebar-title">Reports & Config</div>

        {NAV_LINKS.slice(6).map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`admin-nav-link${isActive(l.to, pathname) ? ' active' : ''}`}
            title={collapsed ? l.label : undefined}
          >
            <span className="admin-nav-icon">{l.icon}</span>
            <span className="admin-nav-label">{l.label}</span>
          </Link>
        ))}

        <hr className="admin-sidebar-divider" />
        <Link to="/" className="admin-nav-link" title={collapsed ? 'Public Site' : undefined}>
          <span className="admin-nav-icon">🌐</span>
          <span className="admin-nav-label">Public Site</span>
        </Link>

        <button className="admin-sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
          <span>{collapsed ? '→' : '←'}</span>
          <span>{collapsed ? '' : 'Collapse'}</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="admin-content">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-topbar-toggle" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">☰</button>
            <nav className="admin-breadcrumb" aria-label="Breadcrumb">
              <Link to="/admin">Admin</Link>
              {pathname !== '/admin' && (
                <>
                  <span className="admin-breadcrumb-sep">›</span>
                  <span className="admin-breadcrumb-current">{currentLabel}</span>
                </>
              )}
            </nav>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-topbar-search">
              <span className="admin-topbar-search-icon">🔍</span>
              <input placeholder="Search…" aria-label="Admin search" />
            </div>
            <div className="admin-topbar-divider" />
            <Link to="/admin/orders"   className="admin-topbar-icon-btn" title="Orders">📦<span className="admin-topbar-badge">!</span></Link>
            <Link to="/admin/settings" className="admin-topbar-icon-btn" title="Settings">⚙️</Link>
            <Link to="/"               className="admin-topbar-icon-btn" title="View store">🌐</Link>
            <Link to="/profile" className="admin-topbar-profile">
              <div className="admin-topbar-avatar">{initials}</div>
              <span>{name.split(' ')[0]}</span>
            </Link>
          </div>
        </div>

        <div className="admin-inner">{children}</div>
      </div>
    </div>
  );
}
