import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';

// Public / customer pages
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

// Admin pages (rendered WITHOUT the public Layout)
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

// Role dashboards (also outside public Layout)
import VendorDashboardPage from './pages/VendorDashboardPage';
import RiderDashboardPage  from './pages/RiderDashboardPage';

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

      {/* ── Admin routes — NO public Layout wrapper ── */}
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

      {/* ── Vendor routes — NO public Layout wrapper ── */}
      <Route path="/vendor"   element={<VendorDashboardPage />} />
      <Route path="/vendor/*" element={<VendorDashboardPage />} />

      {/* ── Rider routes — NO public Layout wrapper ── */}
      <Route path="/rider"   element={<RiderDashboardPage />} />
      <Route path="/rider/*" element={<RiderDashboardPage />} />

      {/* ── Public routes — WITH public Layout wrapper ── */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/"                   element={<HomePage />} />
            <Route path="/products"           element={<ProductsPage />} />
            <Route path="/products/:id"       element={<ProductDetailsPage />} />
            <Route path="/categories"         element={<CategoriesPage />} />
            <Route path="/cart"               element={<CartPage />} />
            <Route path="/checkout"           element={<CheckoutPage />} />
            <Route path="/payment-simulation" element={<PaymentSimulationPage />} />
            <Route path="/wishlist"           element={<WishlistPage />} />
            <Route path="/contact"            element={<ContactPage />} />
            <Route path="/login"              element={<LoginPage />} />
            <Route path="/register"           element={<RegisterPage />} />
            <Route path="/profile"            element={<ProfilePage />} />
            <Route path="/orders"             element={<OrdersPage />} />
            <Route path="/orders/:id"         element={<OrderDetailsPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="*"                   element={<NotFoundPage />} />
          </Routes>
        </Layout>
      } />

    </Routes>
  );
}
