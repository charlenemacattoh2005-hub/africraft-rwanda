import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin',          icon: '📊', label: 'Dashboard'   },
  { to: '/admin/orders',   icon: '📦', label: 'Orders'      },
  { to: '/admin/products', icon: '🛍️', label: 'Products'    },
  { to: '/admin/customers',icon: '👥', label: 'Customers'   },
  { to: '/admin/reviews',  icon: '⭐', label: 'Reviews'     },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>🛒</span> DellCraft
        </div>
        <div className="admin-sidebar-title">Admin Panel</div>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`admin-nav-link${pathname === l.to ? ' active' : ''}`}
          >
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
        <div className="admin-sidebar-divider" />
        <Link to="/" className="admin-nav-link"><span>🌐</span> Public Site</Link>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
