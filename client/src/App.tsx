import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';

// ── Public / customer pages ──────────────────────────────────
import HomePage              from './pages/HomePage';
import ProductsPage          from './pages/ProductsPage';
import ProductDetailsPage    from './pages/ProductPageWithReviews';
import CartPage              from './pages/CartPage';
import CheckoutPage          from './pages/CheckoutPage';
import WishlistPage          from './pages/WishlistPage';
import LoginPage             from './pages/LoginPage';
import RegisterPage          from './pages/RegisterPage';
import OrdersPage            from './pages/OrdersPage';
import OrderDetailsPage      from './pages/OrderDetailsPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage           from './pages/ProfilePage';
import CategoriesPage        from './pages/CategoriesPage';
import ContactPage           from './pages/ContactPage';
import PaymentSimulationPage from './pages/PaymentSimulationPage';

// ── Admin pages — rendered WITHOUT the public Layout ─────────
import AdminStatsPage            from './pages/AdminStatsPage';
import AdminProductsPage         from './pages/AdminProductsPage';
import AdminCategoriesPage       from './pages/AdminCategoriesPage';
import AdminUsersPage            from './pages/AdminUsersPage';
import AdminAnalyticsPage        from './pages/AdminAnalyticsPage';
import AdminSettingsPage         from './pages/AdminSettingsPage';
import AdminInventoryPage        from './pages/AdminInventoryPage';
import AdminDiscountsPage        from './pages/AdminDiscountsPage';
import AdminNotificationsPage    from './pages/AdminNotificationsPage';
import OrdersAdminPage           from './pages/OrdersAdminPage';
import CustomersPage             from './pages/CustomersPage';
import AdminReviewModerationPage from './pages/AdminReviewModerationPage';

// ── Role dashboards — also outside public Layout ─────────────
import VendorDashboardPage from './pages/VendorDashboardPage';
import RiderDashboardPage  from './pages/RiderDashboardPage';

// ── 404 inside public layout ─────────────────────────────────
function NotFoundPage() {
  return (
    <div className="container page" style={{ paddingTop: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>404</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Page not found</div>
      <p style={{ color: '#78716c', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn primary">Go home</a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>

      {/* ════════════════════════════════════════════════════
          ADMIN — no public Layout, no public nav/footer
          ════════════════════════════════════════════════════ */}
      <Route path="/admin"                       element={<AdminStatsPage />} />
      <Route path="/admin/orders"                element={<OrdersAdminPage />} />
      <Route path="/admin/orders/returns"        element={<OrdersAdminPage />} />
      <Route path="/admin/orders/refunds"        element={<OrdersAdminPage />} />
      <Route path="/admin/products"              element={<AdminProductsPage />} />
      <Route path="/admin/products/new"          element={<AdminProductsPage />} />
      <Route path="/admin/categories"            element={<AdminCategoriesPage />} />
      <Route path="/admin/brands"                element={<AdminCategoriesPage />} />
      <Route path="/admin/users"                 element={<AdminUsersPage />} />
      <Route path="/admin/users/create"          element={<AdminUsersPage />} />
      <Route path="/admin/users/roles"           element={<AdminUsersPage />} />
      <Route path="/admin/users/permissions"     element={<AdminUsersPage />} />
      <Route path="/admin/customers"             element={<CustomersPage />} />
      <Route path="/admin/reviews"               element={<AdminReviewModerationPage />} />
      <Route path="/admin/analytics"             element={<AdminAnalyticsPage />} />
      <Route path="/admin/inventory"             element={<AdminInventoryPage />} />
      <Route path="/admin/inventory/low-stock"   element={<AdminInventoryPage />} />
      <Route path="/admin/promotions/coupons"    element={<AdminDiscountsPage />} />
      <Route path="/admin/promotions/discounts"  element={<AdminDiscountsPage />} />
      <Route path="/admin/promotions/*"          element={<AdminDiscountsPage />} />
      <Route path="/admin/settings"              element={<AdminSettingsPage />} />
      <Route path="/admin/settings/*"            element={<AdminSettingsPage />} />
      <Route path="/admin/notifications"         element={<AdminNotificationsPage />} />
      <Route path="/admin/reports/*"             element={<AdminAnalyticsPage />} />
      <Route path="/admin/vendors"               element={<AdminUsersPage />} />
      <Route path="/admin/vendors/*"             element={<AdminUsersPage />} />
      <Route path="/admin/riders"                element={<AdminUsersPage />} />
      <Route path="/admin/riders/*"              element={<AdminUsersPage />} />
      <Route path="/admin/content/*"             element={<AdminSettingsPage />} />
      <Route path="/admin/*"                     element={<AdminStatsPage />} />

      {/* ════════════════════════════════════════════════════
          VENDOR — no public Layout
          ════════════════════════════════════════════════════ */}
      <Route path="/vendor"   element={<VendorDashboardPage />} />
      <Route path="/vendor/*" element={<VendorDashboardPage />} />

      {/* ════════════════════════════════════════════════════
          RIDER — no public Layout
          ════════════════════════════════════════════════════ */}
      <Route path="/rider"   element={<RiderDashboardPage />} />
      <Route path="/rider/*" element={<RiderDashboardPage />} />

      {/* ════════════════════════════════════════════════════
          PUBLIC — each route individually wrapped in Layout
          (no nested <Routes>, no catch-all ambiguity)
          ════════════════════════════════════════════════════ */}
      <Route path="/"                   element={<Layout><HomePage /></Layout>} />
      <Route path="/products"           element={<Layout><ProductsPage /></Layout>} />
      <Route path="/products/:id"       element={<Layout><ProductDetailsPage /></Layout>} />
      <Route path="/categories"         element={<Layout><CategoriesPage /></Layout>} />
      <Route path="/cart"               element={<Layout><CartPage /></Layout>} />
      <Route path="/checkout"           element={<Layout><CheckoutPage /></Layout>} />
      <Route path="/payment-simulation" element={<Layout><PaymentSimulationPage /></Layout>} />
      <Route path="/wishlist"           element={<Layout><WishlistPage /></Layout>} />
      <Route path="/contact"            element={<Layout><ContactPage /></Layout>} />
      <Route path="/login"              element={<Layout><LoginPage /></Layout>} />
      <Route path="/register"           element={<Layout><RegisterPage /></Layout>} />
      <Route path="/profile"            element={<Layout><ProfilePage /></Layout>} />
      <Route path="/orders"             element={<Layout><OrdersPage /></Layout>} />
      <Route path="/orders/:id"         element={<Layout><OrderDetailsPage /></Layout>} />
      <Route path="/order-confirmation" element={<Layout><OrderConfirmationPage /></Layout>} />
      <Route path="*"                   element={<Layout><NotFoundPage /></Layout>} />

    </Routes>
  );
}
