import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductPageWithReviews';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSimulationPage from './pages/PaymentSimulationPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import AdminStatsPage from './pages/AdminStatsPage';
import AdminReviewModerationPage from './pages/AdminReviewModerationPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import ContactPage from './pages/ContactPage';
import CustomersPage from './pages/CustomersPage';
import OrdersAdminPage from './pages/OrdersAdminPage';
import SuggestedProductsPage from './pages/SuggestedProductsPage';
import FeaturesPage from './pages/FeaturesPage';

function PlaceholderPage({ title, path }: { title: string; path: string }) {
  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1" style={{ fontSize: 22 }}>{title}</div>
        <p className="p">This page is under construction.</p>
        <div style={{ marginTop: 16 }} className="badge">{path}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-simulation" element={<PaymentSimulationPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/admin/orders" element={<OrdersAdminPage />} />
        <Route path="/suggested-products" element={<SuggestedProductsPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/admin" element={<AdminStatsPage />} />
        <Route path="/admin/reviews"    element={<AdminReviewModerationPage />} />
        <Route path="/admin/products"   element={<AdminProductsPage />} />
        <Route path="/admin/customers"  element={<CustomersPage />} />
        <Route path="/admin/analytics"  element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings"   element={<AdminSettingsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="*" element={<PlaceholderPage title="Not Found" path="*" />} />
      </Routes>
    </Layout>
  );
}





