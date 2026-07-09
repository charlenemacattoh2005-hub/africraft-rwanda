import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { checkout } from '../services/orders';
import { Input } from '../components/ui';

const CART_KEY = 'africraft_cart_v1';
type CartLine = { productId: string; quantity: number };

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.productId === 'string')
      .map((x) => ({ productId: x.productId, quantity: Math.max(1, Math.floor(Number(x.quantity) || 1)) }));
  } catch { return []; }
}
function clearCart() { localStorage.removeItem(CART_KEY); }

const PAYMENT_METHODS = [
  { value: 'MTN MoMo',          icon: '📱', label: 'MTN MoMo',          sub: 'Pay with MTN Mobile Money' },
  { value: 'Airtel Money',      icon: '📲', label: 'Airtel Money',      sub: 'Pay with Airtel Money' },
  { value: 'Cash on Delivery',  icon: '💵', label: 'Cash on Delivery',  sub: 'Pay when your order arrives' },
];

export default function CheckoutPage() {
  return <RequireAuth><CheckoutInner /></RequireAuth>;
}

function CheckoutInner() {
  const navigate = useNavigate();
  const cartLines = useMemo(() => loadCart(), []);

  const [customer, setCustomer] = useState({
    fullName: '', phone: '', email: '', district: '',
    sector: '', address: '', paymentMethod: 'MTN MoMo', deliveryNotes: '',
  });
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setCustomer((s) => ({ ...s, [field]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cartLines.length === 0) { setError('Your cart is empty.'); return; }
    if (!customer.fullName || !customer.phone) { setError('Please fill in your name and phone number.'); return; }
    setLoading(true); setError(null);
    try {
      const data = await checkout({
        customer,
        deliveryFee: Number(deliveryFee) || 0,
        items: cartLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderNumber:   data?.order?.orderNumber || data?.order?.id || `AFR${Date.now().toString().slice(-6)}`,
          total:         data?.order?.total || 0,
          paymentMethod: customer.paymentMethod,
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Checkout failed. Please try again.');
    } finally { setLoading(false); }
  }

  const totalItems = cartLines.reduce((s, l) => s + l.quantity, 0);
  const fee        = Number(deliveryFee) || 0;

  return (
    <div className="container page">
      <h1 className="h1">Checkout</h1>
      <p className="p">Complete your delivery details to place your order.</p>

      {/* Step indicator */}
      <div className="checkout-steps" aria-label="Checkout steps">
        <div className="checkout-step done">
          <div className="checkout-step-num">✓</div>
          <span className="checkout-step-label">Cart</span>
        </div>
        <div className="checkout-step-line done" />
        <div className="checkout-step active">
          <div className="checkout-step-num">2</div>
          <span className="checkout-step-label">Delivery</span>
        </div>
        <div className="checkout-step-line" />
        <div className="checkout-step">
          <div className="checkout-step-num">3</div>
          <span className="checkout-step-label">Confirm</span>
        </div>
      </div>

      {cartLines.length === 0 && (
        <div className="products-error" role="alert">Your cart is empty. Add items before checking out.</div>
      )}

      <form onSubmit={onSubmit}>
        <div className="checkout-layout">

          {/* Left: form */}
          <div style={{ display: 'grid', gap: 16 }}>

            {/* Contact */}
            <div className="checkout-form-card">
              <div className="checkout-section-title">📋 Contact information</div>
              <div className="checkout-field-grid">
                <Input label="Full name *"    value={customer.fullName} onChange={set('fullName')} placeholder="Your full name"    required />
                <Input label="Phone number *" value={customer.phone}    onChange={set('phone')}    placeholder="+250 7XX XXX XXX"  required type="tel" />
                <Input label="Email address"  value={customer.email}    onChange={set('email')}    placeholder="you@example.com"   type="email" />
              </div>
            </div>

            {/* Delivery */}
            <div className="checkout-form-card">
              <div className="checkout-section-title">🚚 Delivery address</div>
              <div className="checkout-field-grid">
                <Input label="District" value={customer.district} onChange={set('district')} placeholder="e.g. Kicukiro" />
                <Input label="Sector"   value={customer.sector}   onChange={set('sector')}   placeholder="e.g. Niboye" />
              </div>
              <div className="checkout-field-grid full" style={{ marginTop: 0 }}>
                <Input label="Street address" value={customer.address} onChange={set('address')} placeholder="Street, building, landmark" />
              </div>
              <div className="checkout-field-grid full" style={{ marginTop: 0 }}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <label className="small" style={{ fontWeight: 600, color: 'var(--text)' }}>Delivery notes (optional)</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={customer.deliveryNotes}
                    onChange={set('deliveryNotes')}
                    placeholder="Leave at reception, call on arrival…"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-form-card">
              <div className="checkout-section-title">💳 Payment method</div>
              <div className="payment-methods">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={`payment-method-btn${customer.paymentMethod === m.value ? ' selected' : ''}`}
                    onClick={() => setCustomer((s) => ({ ...s, paymentMethod: m.value }))}
                    aria-pressed={customer.paymentMethod === m.value}
                  >
                    <span className="payment-method-icon">{m.icon}</span>
                    <div>
                      <div className="payment-method-label">{m.label}</div>
                      <div className="payment-method-sub">{m.sub}</div>
                    </div>
                    <div className="payment-method-radio" />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">⚠️ {error}</div>
            )}
          </div>

          {/* Right: summary */}
          <div className="checkout-summary">
            <div className="checkout-summary-title">Order Summary</div>

            <div className="checkout-summary-row">
              <span>Items ({totalItems})</span>
              <span>—</span>
            </div>
            <div className="checkout-summary-row">
              <span>Delivery fee</span>
              <Input
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0"
                type="number"
                style={{ width: 100, textAlign: 'right', padding: '6px 10px' }}
                aria-label="Delivery fee in RWF"
              />
            </div>
            <div className="checkout-summary-row">
              <span>Payment</span>
              <span style={{ fontWeight: 600 }}>{customer.paymentMethod}</span>
            </div>
            <div className="checkout-summary-row total">
              <span>Estimated total</span>
              <span>RWF {fee.toLocaleString()}</span>
            </div>

            <button
              className="btn primary"
              type="submit"
              disabled={loading || cartLines.length === 0}
              style={{ width: '100%', marginTop: 20, padding: '13px', fontSize: 15 }}
            >
              {loading ? (
                <><span className="auth-spinner" style={{ marginRight: 8 }} />Placing order…</>
              ) : (
                '✓ Confirm order'
              )}
            </button>

            <div style={{ marginTop: 16, display: 'grid', gap: 6 }}>
              {['🔒 SSL encrypted', '📱 Mobile money supported', '🚚 Delivery across Rwanda'].map((t) => (
                <div key={t} className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
