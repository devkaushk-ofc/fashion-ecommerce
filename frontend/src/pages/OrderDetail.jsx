import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaBoxOpen, FaTruck, FaHome } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './OrderDetail.css';

const STATUS_STEPS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_CSS = {
  Processing:         'status-processing',
  Confirmed:          'status-confirmed',
  Shipped:            'status-shipped',
  'Out for Delivery': 'status-outdelivery',
  Delivered:          'status-delivered',
  Cancelled:          'status-cancelled',
};

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cls = STATUS_CSS[status] || '';
  return <span className={`od-status-badge ${cls}`}>{t(`status.${status}`, status)}</span>;
};

const OrderDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || t('order_detail.not_found'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, t]);

  if (loading) {
    return (
      <div className="od-page">
        <div className="container">
          <div className="spinner" role="status" aria-label={t('order_detail.loading')} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="od-page">
        <div className="container">
          <div className="od-error">
            <p>{error || t('order_detail.not_found')}</p>
            <Link to="/orders" className="btn btn-primary">{t('order_detail.my_orders')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled  = order.orderStatus === 'Cancelled';
  const activeStep   = isCancelled ? -1 : STATUS_STEPS.indexOf(order.orderStatus);
  const itemsPrice   = order.itemsPrice   || 0;
  const taxPrice     = order.taxPrice     || 0;
  const shippingPrice = order.shippingPrice || 0;
  const totalPrice   = order.totalPrice   || 0;
  const addr         = order.shippingAddress || {};

  return (
    <div className="od-page">
      <div className="container">

        {/* ── Success banner ── */}
        <div className="od-success-banner" role="status" aria-live="polite">
          <FaCheckCircle className="od-success-icon" aria-hidden="true" />
          <div>
            <h1 className="od-success-title">{t('order_detail.placed_title')}</h1>
            <p className="od-success-sub">
              {t('order_detail.order_id', { id: order._id?.slice(-8).toUpperCase() })}
            </p>
          </div>
        </div>

        <div className="od-layout">

          {/* ── Left column ── */}
          <div className="od-left">

            {/* Progress tracker */}
            {!isCancelled && (
              <section className="od-section" aria-labelledby="od-status-heading">
                <h2 className="od-section-title" id="od-status-heading">{t('order_detail.order_status')}</h2>
                {/* Screen reader summary — the visual tracker is decorative */}
                <p className="sr-only">
                  {t('order_detail.sr_status', {
                    status: t(`status.${order.orderStatus}`, order.orderStatus),
                    done:   activeStep + 1,
                    total:  STATUS_STEPS.length,
                  })}
                </p>
                <div className="od-tracker" aria-hidden="true">
                  {STATUS_STEPS.map((step, idx) => (
                    <div
                      key={step}
                      className={`od-step${idx <= activeStep ? ' od-step--done' : ''}${idx === activeStep ? ' od-step--active' : ''}`}
                    >
                      <div className="od-step-dot" />
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`od-step-line${idx < activeStep ? ' od-step-line--done' : ''}`} />
                      )}
                      <span className="od-step-label">{t(`status.${step}`, step)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isCancelled && (
              <section className="od-section od-section--cancelled">
                <h2 className="od-section-title">{t('order_detail.cancelled_title')}</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                  {t('order_detail.cancelled_desc')}
                </p>
              </section>
            )}

            {/* Order items */}
            <section className="od-section" aria-labelledby="od-items-title">
              <h2 className="od-section-title" id="od-items-title">
                {t('order_detail.items_ordered')} <StatusBadge status={order.orderStatus} />
              </h2>
              <div className="od-items">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="od-item-row">
                    <img
                      src={item.image || `https://picsum.photos/70/90?random=${idx}`}
                      alt={item.name || 'Order item'}
                      className="od-item-img"
                      onError={(e) => { e.target.src = `https://picsum.photos/70/90?random=${Math.random()}`; }}
                    />
                    <div className="od-item-info">
                      <div className="od-item-name">{item.name}</div>
                      <div className="od-item-meta">
                        {item.size  && <span>{t('order_detail.size',  { size:  item.size  })}</span>}
                        {item.color && <span>{t('order_detail.color', { color: item.color })}</span>}
                        <span>{t('order_detail.qty', { qty: item.quantity })}</span>
                      </div>
                    </div>
                    <div className="od-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery address */}
            <section className="od-section" aria-labelledby="od-addr-title">
              <h2 className="od-section-title" id="od-addr-title">
                <FaHome style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                {t('order_detail.delivery_address')}
              </h2>
              <div className="od-address">
                <p><strong>{addr.fullName}</strong> &nbsp; {addr.phone}</p>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} — {addr.zipCode}</p>
                <p>{addr.country}</p>
              </div>
            </section>
          </div>

          {/* ── Right: price summary ── */}
          <aside className="od-summary">
            <h2 className="od-section-title">{t('order_detail.price_details')}</h2>
            <div className="od-price-rows">
              <div className="od-price-row">
                <span>{t('order_detail.items_count', { count: order.orderItems?.length })}</span>
                <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="od-price-row">
                <span>{t('order_detail.delivery')}</span>
                <span style={{ color: shippingPrice === 0 ? 'var(--success)' : 'inherit', fontWeight: 600 }}>
                  {shippingPrice === 0 ? t('order_detail.free') : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="od-price-row">
                <span>{t('order_detail.tax')}</span>
                <span>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="od-price-row od-price-row--total">
                <span>{t('order_detail.total_paid')}</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="od-meta">
              <div className="od-meta-row">
                <span>{t('order_detail.payment')}</span>
                <strong>{order.paymentMethod}</strong>
              </div>
              <div className="od-meta-row">
                <span>{t('order_detail.payment_status')}</span>
                <strong style={{ color: order.isPaid ? 'var(--success)' : 'var(--muted)' }}>
                  {order.isPaid ? t('order_detail.paid') : t('order_detail.pending')}
                </strong>
              </div>
              <div className="od-meta-row">
                <span>{t('order_detail.order_date')}</span>
                <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
            </div>

            <div className="od-actions">
              <Link to="/orders" className="btn btn-outline od-btn">{t('order_detail.view_all_orders')}</Link>
              <Link to="/products" className="btn btn-primary od-btn">{t('order_detail.continue_shopping')}</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
