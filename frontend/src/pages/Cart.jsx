import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaMinus, FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import './Cart.css';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, loading, getCart, updateCartItem, removeFromCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) getCart();
  }, [isAuthenticated, getCart]);

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <FaShoppingBag aria-hidden="true" />
            <h2>{t('cart.login_required')}</h2>
            <p>{t('cart.login_desc')}</p>
            <Link to="/login" className="btn btn-primary">{t('cart.login_btn')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => {
    const orig = item.product?.price ?? item.price;
    return sum + orig * item.quantity;
  }, 0);
  const savings = Math.max(0, originalTotal - subtotal);

  const handleQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try { await updateCartItem(itemId, newQty); } catch { /* toast handled */ }
  };

  const handleRemove = async (itemId) => {
    try { await removeFromCart(itemId); } catch { /* toast handled */ }
  };

  if (loading && !cart) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="spinner" role="status" aria-label={t('cart.loading')} />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>
          {t('cart.title')}{' '}
          {items.length > 0 && (
            <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--muted)' }}>
              ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="cart-empty" role="status">
            <FaShoppingBag aria-hidden="true" />
            <h2>{t('cart.empty')}</h2>
            <p>{t('cart.empty_desc')}</p>
            <Link to="/products" className="btn btn-primary">{t('cart.continue_shopping')}</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items-section" aria-label={t('cart.cart_items')}>
              {items.map((item) => {
                const product = item.product || {};
                const image   = product.images?.[0] || `https://picsum.photos/200/260?random=${item._id}`;
                const origPrice = product.price ?? item.price;
                const disc = origPrice > item.price
                  ? Math.round(((origPrice - item.price) / origPrice) * 100)
                  : 0;

                return (
                  <article key={item._id} className="cart-item-card" aria-label={t('cart.cart_item', { name: product.name })}>
                    <img
                      src={image}
                      alt={product.name || t('cart.product')}
                      className="cart-item-img"
                      onError={(e) => { e.target.src = `https://picsum.photos/200/260?random=${Math.random()}`; }}
                    />

                    <div className="cart-item-details">
                      <div className="cart-item-brand">{product.brand || t('cart.brand')}</div>
                      <div className="cart-item-name">{product.name || t('cart.product')}</div>
                      <div className="cart-item-meta">
                        {item.size  && <span>{t('cart.size', { size: item.size })}</span>}
                        {item.color && <span>{t('cart.color', { color: item.color })}</span>}
                      </div>
                      <div className="cart-item-price">
                        ₹{item.price.toLocaleString('en-IN')}
                        {disc > 0 && (
                          <span className="cart-item-original">₹{origPrice.toLocaleString('en-IN')}</span>
                        )}
                        {disc > 0 && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)', fontWeight: 700, marginLeft: '0.35rem' }}>
                            {disc}{t('cart.off')}
                          </span>
                        )}
                      </div>

                      <div className="qty-stepper" role="group" aria-label="Quantity">
                        <button
                          className="qty-btn"
                          onClick={() => handleQty(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || loading}
                          aria-label={t('cart.decrease_qty')}
                        >
                          <FaMinus style={{ fontSize: '0.7rem' }} />
                        </button>
                        <span className="qty-display" aria-live="polite">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleQty(item._id, item.quantity + 1)}
                          disabled={loading || (product.stock && item.quantity >= product.stock)}
                          aria-label={t('cart.increase_qty')}
                        >
                          <FaPlus style={{ fontSize: '0.7rem' }} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemove(item._id)}
                        disabled={loading}
                        aria-label={t('cart.remove', { name: product.name })}
                      >
                        <FaTrash />
                      </button>
                      <div className="cart-item-subtotal">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="cart-summary" aria-label={t('cart.order_summary')}>
              <h2>{t('cart.price_details')}</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>{t('cart.price_items', { count: items.length })}</span>
                  <span>₹{originalTotal.toLocaleString('en-IN')}</span>
                </div>
                {savings > 0 && (
                  <div className="summary-row summary-discount">
                    <span>{t('cart.discount')}</span>
                    <span>−₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>{t('cart.delivery')}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{t('cart.free')}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('cart.total')}</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {savings > 0 && (
                <p className="summary-note">{t('cart.savings', { amount: savings.toLocaleString('en-IN') })}</p>
              )}
              <button
                className="btn-checkout"
                onClick={() => navigate('/checkout')}
                aria-label={t('cart.checkout_label', { total: subtotal.toLocaleString('en-IN') })}
              >
                {t('cart.place_order')}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

// Made with Bob
