import React, { useMemo, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { useNavigate } from 'react-router-dom';
import { simulatePayment } from '../services/payment';

const CART_KEY = 'africraft_cart_v1';

type CartLine = { productId: string; quantity: number };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.productId === 'string')
      .map((x: any) => ({ productId: x.productId, quantity: Math.max(1, Math.floor(Number(x.quantity) || 1)) }));
  } catch {
    return [];
  }
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export default function PaymentSimulationPage() {
  return (
    <RequireAuth>
      <PaymentSimulationInner />
    </RequireAuth>
  );
}

function PaymentSimulationInner() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  });
  const cartLines = useMemo(() => loadCart(), []);
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [method, setMethod] = useState('mobile_money');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (cartLines.length === 0) {
        setError('Your cart is empty.');
        setLoading(false);
        return;
      }

      const payload = {
        customer,
        deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
        items: cartLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        paymentMethod: method,
      };

      const data = await simulatePayment(payload);
      clearCart();
      setMessage(`Payment simulated successfully with ${method.replace('_', ' ')}. Order ID: ${data?.order?.id}`);
      setTimeout(() => navigate(`/orders/${data?.order?.id || ''}`), 1200);
    } catch (err: any) {
      setError(err?.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="card" style={{ padding: 20 }}>
        <div className="h1">Payment Simulation</div>
        <p className="p">Simulate checkout flow with mobile money or card payment.</p>

        {cartLines.length === 0 ? (
          <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
            Cart is empty.
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <div className="grid">
            <div className="col-6">
              <label className="small">Full name</label>
              <input className="input" value={customer.fullName} onChange={(e) => setCustomer((s) => ({ ...s, fullName: e.target.value }))} />
            </div>
            <div className="col-6">
              <label className="small">Phone</label>
              <input className="input" value={customer.phone} onChange={(e) => setCustomer((s) => ({ ...s, phone: e.target.value }))} />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div className="grid">
            <div className="col-6">
              <label className="small">Email</label>
              <input className="input" value={customer.email} onChange={(e) => setCustomer((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div className="col-6">
              <label className="small">City</label>
              <input className="input" value={customer.city} onChange={(e) => setCustomer((s) => ({ ...s, city: e.target.value }))} />
            </div>
          </div>

          <div style={{ height: 12 }} />
          <label className="small">Address</label>
          <input className="input" value={customer.address} onChange={(e) => setCustomer((s) => ({ ...s, address: e.target.value }))} />

          <div style={{ height: 12 }} />
          <label className="small">Payment method</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="mobile_money">Mobile money</option>
            <option value="credit_card">Credit card</option>
            <option value="cash_on_delivery">Cash on delivery</option>
          </select>

          <div style={{ height: 12 }} />
          <label className="small">Delivery fee</label>
          <input className="input" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="0" />

          {error ? (
            <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(251,113,133,.45)' }}>
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="badge" style={{ marginTop: 16, borderColor: 'rgba(34,197,94,.45)' }}>
              {message}
            </div>
          ) : null}

          <button className={loading ? 'btn' : 'btn primary'} type="submit" disabled={loading || cartLines.length === 0} style={{ width: '100%', marginTop: 16, cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Simulate payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
