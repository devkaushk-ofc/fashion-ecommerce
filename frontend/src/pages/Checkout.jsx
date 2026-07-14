import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import './Checkout.css';

const PAYMENT_METHODS = ['COD', 'Card', 'UPI', 'NetBanking'];

const EMPTY_ADDRESS = {
  fullName: '', phone: '', street: '',
  city: '', state: '', zipCode: '', country: 'India',
};

/* ── Field must live OUTSIDE Checkout so React never remounts it on re-render ── */
const Field = ({ label, name, type = 'text', placeholder, half, address, errors, onChange, disabled }) => {
  const errorId = `co-${name}-error`;
  const hasError = !!errors[name];
  return (
    <div className={`co-field${half ? ' co-field--half' : ''}`}>
      <label className="co-label" htmlFor={`co-${name}`}>{label}</label>
      <input
        id={`co-${name}`}
        name={name}
        type={type}
        className={`co-input${hasError ? ' co-input--error' : ''}`}
        placeholder={placeholder}
        value={address[name]}
        onChange={onChange}
        disabled={disabled}
        aria-required="true"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        autoComplete={name === 'fullName' ? 'name' : name === 'phone' ? 'tel' : name === 'street' ? 'street-address' : name === 'city' ? 'address-level2' : name === 'state' ? 'address-level1' : name === 'zipCode' ? 'postal-code' : name === 'country' ? 'country-name' : undefined}
      />
      {hasError && (
        <span className="co-error" id={errorId} role="alert" aria-live="assertive">
          {errors[name]}
        </span>
      )}
    </div>
  );
};

const Checkout = () => {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, getCart, loading: cartLoading } = useCartStore();

  const [address,       setAddress]       = useState(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing,       setPlacing]       = useState(false);
  const [errors,        setErrors]        = useState({});

  /* load cart on mount */
  useEffect(() => {
    if (isAuthenticated) getCart();
  }, [isAuthenticated, getCart]);

  /* redirect unauthenticated users */
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h2>{t('checkout.login_required')}</h2>
            <Link to="/login" className="btn btn-primary">{t('checkout.login_btn')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  /* redirect if cart is empty */
  if (!cartLoading && items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h2>{t('checkout.cart_empty')}</h2>
            <p>{t('checkout.cart_empty_desc')}</p>
            <Link to="/products" className="btn btn-primary">{t('checkout.shop_now')}</Link>
          </div>
        </div>
      </div>
    );
  }

  /* price calculations — mirrors Cart.jsx logic */
  const itemsPrice    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice >= 999 ? 0 : 49;
  const taxPrice      = Math.round(itemsPrice * 0.05);
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!address.fullName.trim())  e.fullName  = t('checkout.validation.full_name_required');
    if (!address.phone.trim())     e.phone     = t('checkout.validation.phone_required');
    else if (!/^\d{10}$/.test(address.phone.trim())) e.phone = t('checkout.validation.phone_invalid');
    if (!address.street.trim())    e.street    = t('checkout.validation.street_required');
    if (!address.city.trim())      e.city      = t('checkout.validation.city_required');
    if (!address.state.trim())     e.state     = t('checkout.validation.state_required');
    if (!address.zipCode.trim())   e.zipCode   = t('checkout.validation.zip_required');
    if (!address.country.trim())   e.country   = t('checkout.validation.country_required');
    return e;
  };

  /* ── field change ── */
  const handleField = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  /* ── place order ── */
  const handlePlaceOrder = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error(t('checkout.validation.fill_required'));
      return;
    }

    /* build orderItems matching the Order schema */
    const orderItems = items.map((item) => ({
      product:  item.product?._id || item.product,
      name:     item.product?.name  || 'Product',
      quantity: item.quantity,
      size:     item.size  || 'Free Size',
      color:    item.color || 'Default',
      price:    item.price,
      image:    item.product?.images?.[0] || '',
    }));

    const payload = {
      orderItems,
      shippingAddress: address,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    setPlacing(true);
    try {
      const { data } = await api.post('/orders', payload);
      toast.success(t('checkout.success'));
      /* cart is cleared by the backend; refresh the local cart state */
      await getCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || t('checkout.failed');
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  /* ── render ── */
  const fieldProps = { address, errors, onChange: handleField, disabled: placing };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="co-heading">{t('checkout.title')}</h1>

        <div className="co-layout">

          {/* ── Left: address + payment ── */}
          <div className="co-left">

            {/* Shipping address */}
            <section className="co-section" aria-labelledby="co-addr-title">
              <h2 className="co-section-title" id="co-addr-title">{t('checkout.delivery_address')}</h2>
              <div className="co-form">
                <Field label={t('checkout.full_name')}   name="fullName" placeholder={t('checkout.full_name_placeholder')}              {...fieldProps} />
                <Field label={t('checkout.phone')}       name="phone"    placeholder={t('checkout.phone_placeholder')}  half  {...fieldProps} />
                <Field label={t('checkout.street')}      name="street"   placeholder={t('checkout.street_placeholder')} {...fieldProps} />
                <Field label={t('checkout.city')}        name="city"     placeholder={t('checkout.city_placeholder')}   half  {...fieldProps} />
                <Field label={t('checkout.state')}       name="state"    placeholder={t('checkout.state_placeholder')}  half  {...fieldProps} />
                <Field label={t('checkout.zip')}         name="zipCode"  placeholder={t('checkout.zip_placeholder')}    half  {...fieldProps} />
                <Field label={t('checkout.country')}     name="country"  placeholder={t('checkout.country_placeholder')} half {...fieldProps} />
              </div>
            </section>

            {/* Payment method */}
            <section className="co-section" aria-labelledby="co-pay-title">
              <h2 className="co-section-title" id="co-pay-title">{t('checkout.payment_method')}</h2>
              <div className="co-payment-grid">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`co-payment-option${paymentMethod === method ? ' co-payment-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      disabled={placing}
                    />
                    <span className="co-payment-label">
                      {method === 'COD'        && t('checkout.cod')}
                      {method === 'Card'       && t('checkout.card')}
                      {method === 'UPI'        && t('checkout.upi')}
                      {method === 'NetBanking' && t('checkout.netbanking')}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: order summary ── */}
          <aside className="co-summary" aria-label={t('checkout.order_summary')}>
            <h2 className="co-section-title">{t('checkout.order_summary')}</h2>

            <div className="co-items-list">
              {items.map((item) => (
                <div key={item._id} className="co-item-row">
                  <img
                    src={item.product?.images?.[0] || `https://picsum.photos/60/80?random=${item._id}`}
                    alt={item.product?.name}
                    className="co-item-img"
                    onError={(e) => { e.target.src = `https://picsum.photos/60/80?random=${Math.random()}`; }}
                  />
                  <div className="co-item-info">
                    <div className="co-item-name">{item.product?.name}</div>
                    <div className="co-item-meta">
                      {item.size  && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="co-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div className="co-price-rows">
              <div className="co-price-row">
                <span>{t('checkout.items_count', { count: items.length })}</span>
                <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="co-price-row">
                <span>{t('checkout.delivery')}</span>
                <span style={{ color: shippingPrice === 0 ? 'var(--success)' : 'inherit', fontWeight: 600 }}>
                  {shippingPrice === 0 ? t('checkout.free') : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="co-price-row">
                <span>{t('checkout.tax')}</span>
                <span>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="co-price-row co-price-row--total">
                <span>{t('checkout.total')}</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              className="co-place-btn"
              onClick={handlePlaceOrder}
              disabled={placing || cartLoading}
              aria-busy={placing}
              aria-label={placing ? t('checkout.placing_label') : t('checkout.place_label', { total: totalPrice.toLocaleString('en-IN') })}
            >
              {placing ? t('checkout.placing') : t('checkout.place_order')}
            </button>

            <p className="co-secure-note">
              <span aria-hidden="true">🔒</span>
              {' '}{t('checkout.secure')}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
