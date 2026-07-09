import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuthPayload, getAuthToken } from '../services/api';
import { logout } from '../services/auth';
import { fetchNotifications } from '../services/admin';

// ─── Nav tree ────────────────────────────────────────────────
interface NavItem {
  to?: string;
  icon: string;
  label: string;
  badge?: number;
  children?: NavItem[];
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin',           icon: '⊞',  label: 'Dashboard' },

  { icon: '📦', label: 'Products', children: [
    { to: '/admin/products',            icon: '▸', label: 'All Products'     },
    { to: '/admin/products/new',        icon: '▸', label: 'Add Product'      },
    { to: '/admin/categories',          icon: '▸', label: 'Categories'       },
    { to: '/admin/brands',              icon: '▸', label: 'Brands'           },
    { to: '/admin/reviews',             icon: '▸', label: 'Product Reviews'  },
  ]},

  { icon: '🧾', label: 'Orders', children: [
    { to: '/admin/orders',              icon: '▸', label: 'All Orders'       },
    { to: '/admin/orders/returns',      icon: '▸', label: 'Returns'          },
    { to: '/admin/orders/refunds',      icon: '▸', label: 'Refund Requests'  },
  ]},

  { icon: '👥', label: 'Customers', children: [
    { to: '/admin/customers',           icon: '▸', label: 'Customer List'    },
    { to: '/admin/customers/reviews',   icon: '▸', label: 'Customer Reviews' },
    { to: '/admin/customers/wishlists', icon: '▸', label: 'Wishlists'        },
  ]},

  { icon: '🔑', label: 'Users', children: [
    { to: '/admin/users',               icon: '▸', label: 'All Users'        },
    { to: '/admin/users/create',        icon: '▸', label: 'Create User'      },
    { to: '/admin/users/roles',         icon: '▸', label: 'Roles'            },
    { to: '/admin/users/permissions',   icon: '▸', label: 'Permissions'      },
  ]},

  { icon: '🏪', label: 'Vendors', children: [
    { to: '/admin/vendors',             icon: '▸', label: 'Vendor List'      },
    { to: '/admin/vendors/applications',icon: '▸', label: 'Applications'     },
    { to: '/admin/vendors/products',    icon: '▸', label: 'Vendor Products'  },
    { to: '/admin/vendors/orders',      icon: '▸', label: 'Vendor Orders'    },
    { to: '/admin/vendors/payments',    icon: '▸', label: 'Vendor Payments'  },
  ]},

  { icon: '🏍️', label: 'Riders', children: [
    { to: '/admin/riders',              icon: '▸', label: 'Rider List'       },
    { to: '/admin/riders/assign',       icon: '▸', label: 'Assign Deliveries'},
    { to: '/admin/riders/status',       icon: '▸', label: 'Delivery Status'  },
  ]},

  { icon: '📊', label: 'Inventory', children: [
    { to: '/admin/inventory',           icon: '▸', label: 'Stock'            },
    { to: '/admin/inventory/low-stock', icon: '▸', label: 'Low Stock'        },
    { to: '/admin/inventory/warehouses',icon: '▸', label: 'Warehouses'       },
  ]},

  { icon: '🎁', label: 'Promotions', children: [
    { to: '/admin/promotions/coupons',  icon: '▸', label: 'Coupons'          },
    { to: '/admin/promotions/discounts',icon: '▸', label: 'Discounts'        },
    { to: '/admin/promotions/banners',  icon: '▸', label: 'Banners'          },
    { to: '/admin/promotions/featured', icon: '▸', label: 'Featured Products'},
  ]},

  { icon: '📝', label: 'Content', children: [
    { to: '/admin/content/homepage',    icon: '▸', label: 'Homepage'         },
    { to: '/admin/content/banners',     icon: '▸', label: 'Hero Banners'     },
    { to: '/admin/content/collections', icon: '▸', label: 'Collections'      },
    { to: '/admin/content/blog',        icon: '▸', label: 'Blog'             },
    { to: '/admin/content/faqs',        icon: '▸', label: 'FAQs'             },
  ]},

  { icon: '📈', label: 'Reports', children: [
    { to: '/admin/reports/revenue',     icon: '▸', label: 'Revenue'          },
    { to: '/admin/reports/orders',      icon: '▸', label: 'Orders'           },
    { to: '/admin/reports/customers',   icon: '▸', label: 'Customers'        },
    { to: '/admin/reports/vendors',     icon: '▸', label: 'Vendors'          },
    { to: '/admin/reports/products',    icon: '▸', label: 'Products'         },
  ]},

  { icon: '⚙️', label: 'Settings', children: [
    { to: '/admin/settings',            icon: '▸', label: 'General'          },
    { to: '/admin/settings/payments',   icon: '▸', label: 'Payments'         },
    { to: '/admin/settings/shipping',   icon: '▸', label: 'Shipping'         },
    { to: '/admin/settings/taxes',      icon: '▸', label: 'Taxes'            },
    { to: '/admin/settings/notifications', icon: '▸', label: 'Notifications' },
    { to: '/admin/settings/email',      icon: '▸', label: 'Email Templates'  },
    { to: '/admin/settings/security',   icon: '▸', label: 'Security'         },
  ]},
];

const VENDOR_NAV: NavItem[] = [
  { to: '/vendor',               icon: '⊞',  label: 'Dashboard'  },
  { to: '/vendor/products',      icon: '📦',  label: 'My Products'},
  { to: '/vendor/orders',        icon: '🧾',  label: 'My Orders'  },
  { to: '/vendor/analytics',     icon: '📈',  label: 'Analytics'  },
  { to: '/vendor/payouts',       icon: '💰',  label: 'Payouts'    },
  { to: '/vendor/store',         icon: '🏪',  label: 'Store Profile'},
  { to: '/vendor/reviews',       icon: '⭐',  label: 'Reviews'    },
];

const RIDER_NAV: NavItem[] = [
  { to: '/rider',                icon: '⊞',  label: 'Dashboard'       },
  { to: '/rider/deliveries',     icon: '🗺️', label: 'My Deliveries'   },
  { to: '/rider/history',        icon: '📋',  label: 'Delivery History'},
  { to: '/rider/earnings',       icon: '💰',  label: 'Earnings'        },
  { to: '/rider/profile',        icon: '👤',  label: 'Profile'         },
];

// ─── Breadcrumb map ───────────────────────────────────────────
function getBreadcrumbs(pathname: string): { label: string; to?: string }[] {
  const segs = pathname.replace(/^\//, '').split('/');
  const crumbs: { label: string; to?: string }[] = [];
  let path = '';
  const labels: Record<string, string> = {
    admin: 'Admin', vendor: 'Vendor', rider: 'Rider',
    products: 'Products', orders: 'Orders', customers: 'Customers',
    users: 'Users', vendors: 'Vendors', riders: 'Riders',
    inventory: 'Inventory', promotions: 'Promotions', content: 'Content',
    reports: 'Reports', settings: 'Settings', analytics: 'Analytics',
    categories: 'Categories', brands: 'Brands', reviews: 'Reviews',
    new: 'New', create: 'Create', edit: 'Edit',
    returns: 'Returns', refunds: 'Refunds', 'low-stock': 'Low Stock',
    warehouses: 'Warehouses', coupons: 'Coupons', discounts: 'Discounts',
    banners: 'Banners', featured: 'Featured', homepage: 'Homepage',
    collections: 'Collections', blog: 'Blog', faqs: 'FAQs',
    revenue: 'Revenue', payouts: 'Payouts', payments: 'Payments',
    shipping: 'Shipping', taxes: 'Taxes', notifications: 'Notifications',
    email: 'Email Templates', security: 'Security', store: 'Store Profile',
    deliveries: 'Deliveries', history: 'History', earnings: 'Earnings',
    profile: 'Profile', assign: 'Assign Deliveries', status: 'Status',
    applications: 'Applications', roles: 'Roles', permissions: 'Permissions',
    wishlists: 'Wishlists',
  };
  for (const seg of segs) {
    path += '/' + seg;
    crumbs.push({ label: labels[seg] || seg, to: path });
  }
  return crumbs;
}

// ─── Helper ───────────────────────────────────────────────────
function isActive(to: string | undefined, pathname: string): boolean {
  if (!to) return false;
  const roots = ['/admin', '/vendor', '/rider'];
  if (roots.includes(to)) return pathname === to;
  return pathname === to || pathname.startsWith(to + '/');
}

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (item.to) return isActive(item.to, pathname);
  return item.children?.some(c => isActive(c.to, pathname)) ?? false;
}

// ─── NavGroup component ───────────────────────────────────────
function NavGroup({
  item, pathname, collapsed,
}: {
  item: NavItem; pathname: string; collapsed: boolean;
}) {
  const active = isGroupActive(item, pathname);
  const [open, setOpen] = useState(active);

  useEffect(() => { if (active) setOpen(true); }, [active]);

  if (!item.children) {
    return (
      <Link
        to={item.to!}
        className={`admin-nav-link${isActive(item.to, pathname) ? ' active' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <span className="admin-nav-icon">{item.icon}</span>
        <span className="admin-nav-label">{item.label}</span>
        {item.badge ? <span className="admin-nav-badge">{item.badge}</span> : null}
      </Link>
    );
  }

  return (
    <div>
      <button
        className={`admin-nav-link${active ? ' active' : ''}${open ? ' group-open' : ''}`}
        onClick={() => !collapsed && setOpen(o => !o)}
        title={collapsed ? item.label : undefined}
        style={{ width: '100%', textAlign: 'left' }}
      >
        <span className="admin-nav-icon">{item.icon}</span>
        <span className="admin-nav-label">{item.label}</span>
        {item.badge ? <span className="admin-nav-badge">{item.badge}</span> : null}
        <span className="admin-nav-arrow">▶</span>
      </button>

      {!collapsed && (
        <div className={`admin-nav-group-children${open ? ' open' : ''}`}>
          {item.children.map(child => (
            <Link
              key={child.to}
              to={child.to!}
              className={`admin-nav-link child${isActive(child.to, pathname) ? ' active' : ''}`}
            >
              <span className="admin-nav-label">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main AdminLayout ─────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery,  setSearchQuery]  = useState('');

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const token      = getAuthToken();
  const payload    = getAuthPayload();
  const name       = payload?.name || payload?.email || 'User';
  const role       = payload?.role || 'admin';
  const initials   = name[0]?.toUpperCase() || '?';
  const isVendor   = role === 'vendor';
  const isRider    = role === 'rider';
  const NAV        = isVendor ? VENDOR_NAV : isRider ? RIDER_NAV : ADMIN_NAV;

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Load notifications (admin only)
  useEffect(() => {
    if (role !== 'admin') return;
    fetchNotifications()
      .then(d => setNotifications(d.notifications || []))
      .catch(() => {});
  }, [role]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const crumbs = getBreadcrumbs(pathname);

  const dashRoot = isVendor ? '/vendor' : isRider ? '/rider' : '/admin';
  const dashLabel = isVendor ? 'Vendor' : isRider ? 'Rider' : 'Admin';

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Search navigates to products or orders based on query
    navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  }

  return (
    <div className={`admin-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* ── Mobile overlay ── */}
      <div
        className={`admin-sidebar-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${mobileOpen ? ' mobile-open' : ''}`} role="navigation" aria-label="Admin navigation">

        {/* Brand */}
        <Link to={dashRoot} className="admin-sidebar-brand" onClick={() => setMobileOpen(false)}>
          <div className="admin-sidebar-brand-icon">🛒</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>AfriCraft</span>
            <span className="admin-sidebar-brand-sub">{dashLabel} Panel</span>
          </div>
        </Link>

        {/* Nav tree */}
        <div style={{ flex: 1, paddingBottom: 8, paddingTop: 8 }}>
          {NAV.map((item, i) => {
            // Section dividers
            const dividerBefore: Record<number, string> = isVendor
              ? {}
              : isRider
              ? {}
              : { 1: 'Products', 7: 'Operations', 9: 'Config' };
            return (
              <React.Fragment key={item.to || item.label}>
                {dividerBefore[i] && !collapsed && (
                  <div className="admin-sidebar-title">{dividerBefore[i]}</div>
                )}
                {i === 7 && !collapsed && !isVendor && !isRider && (
                  <hr className="admin-sidebar-divider" />
                )}
                {i === 9 && !collapsed && !isVendor && !isRider && (
                  <hr className="admin-sidebar-divider" />
                )}
                <NavGroup item={item} pathname={pathname} collapsed={collapsed} />
              </React.Fragment>
            );
          })}
        </div>

        <hr className="admin-sidebar-divider" />
        <Link
          to="/profile"
          className={`admin-nav-link${pathname === '/profile' ? ' active' : ''}`}
          title={collapsed ? 'Profile' : undefined}
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-nav-icon">👤</span>
          <span className="admin-nav-label">My Profile</span>
        </Link>
        <Link
          to="/"
          className="admin-nav-link"
          title={collapsed ? 'View Store' : undefined}
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-nav-icon">🌐</span>
          <span className="admin-nav-label">View Store</span>
        </Link>

        <button
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span style={{ fontSize: 14 }}>{collapsed ? '→' : '←'}</span>
          <span>Collapse</span>
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-content">

        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            {/* Mobile hamburger */}
            <button
              className="admin-topbar-toggle"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle sidebar"
              aria-expanded={mobileOpen}
            >
              ☰
            </button>

            {/* Breadcrumb */}
            <nav className="admin-breadcrumb" aria-label="Breadcrumb">
              <Link to={dashRoot}>{dashLabel}</Link>
              {crumbs.slice(1).map((c, i) => (
                <React.Fragment key={c.to}>
                  <span className="admin-breadcrumb-sep">›</span>
                  {i < crumbs.length - 2 ? (
                    <Link to={c.to!}>{c.label}</Link>
                  ) : (
                    <span className="admin-breadcrumb-current">{c.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="admin-topbar-right">
            {/* Global search */}
            <form onSubmit={handleSearch} className="admin-topbar-search" role="search">
              <span className="admin-topbar-search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search products, orders…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Global search"
              />
            </form>

            <div className="admin-topbar-divider" />

            {/* Quick links */}
            <Link
              to="/admin/orders"
              className="admin-topbar-icon-btn"
              title="Orders"
              aria-label="Orders"
            >
              🧾
            </Link>
            <Link
              to="/"
              className="admin-topbar-icon-btn"
              title="View store"
              aria-label="View store"
            >
              🌐
            </Link>

            {/* Notifications */}
            {role === 'admin' && (
              <div className="admin-topbar-dropdown-wrap" ref={notifRef}>
                <button
                  className="admin-topbar-icon-btn"
                  title="Notifications"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                  aria-expanded={notifOpen}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="admin-topbar-badge" aria-hidden="true">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="admin-notif-dropdown" role="dialog" aria-label="Notifications">
                    <div className="admin-notif-header">
                      <span className="admin-notif-title">Notifications</span>
                      <button className="admin-notif-clear" onClick={() => setNotifications([])}>
                        Clear all
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="admin-notif-empty">No new notifications.</div>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <div key={n._id} className="admin-notif-item">
                          <div className={`admin-notif-dot ${n.type}`} aria-hidden="true" />
                          <div className="admin-notif-body">
                            <div className="admin-notif-msg">{n.message}</div>
                            <div className="admin-notif-time">
                              {n.time ? new Date(n.time).toLocaleString() : ''}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="admin-topbar-divider" />

            {/* Profile chip */}
            <div className="admin-topbar-dropdown-wrap" ref={profileRef}>
              <button
                className="admin-topbar-profile"
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="admin-topbar-avatar" aria-hidden="true">
                  {payload?.profilePhoto
                    ? <img src={payload.profilePhoto} alt={name} />
                    : initials}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                  <span>{name.split(' ')[0]}</span>
                  <span className="admin-topbar-role">{role}</span>
                </div>
              </button>

              {profileOpen && (
                <div className="admin-profile-dropdown" role="menu">
                  <Link to="/profile" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <span>👤</span> My Profile
                  </Link>
                  {role === 'admin' && (
                    <Link to="/admin/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                      <span>⚙️</span> Settings
                    </Link>
                  )}
                  <Link to="/" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <span>🌐</span> View Store
                  </Link>
                  <button className="logout-item" role="menuitem" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-inner" id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
