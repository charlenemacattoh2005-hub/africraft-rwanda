import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="*" element={<PlaceholderPage title="Not Found" path="*" />} />
      </Routes>
    </Layout>
  );
}





