import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBox, FaChevronRight, FaRedo, FaShoppingBag,
  FaRegCalendarAlt, FaMapMarkerAlt,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './Orders.css';

/* ── Status config ──────────────────────────────────────── */
const STATUS_MAP = {
  Processing:         { cls: 'badge-processing' },
  Confirmed:          { cls: 'badge-confirmed'  },
  Shipped:            { cls: 'badge-shipped'    },
  'Out for Delivery': { cls: 'badge-outdelivery' },
  Delivered:          { cls: 'badge-delivered'  },
  Cancelled:          { cls: 'badge-cancelled'  },
};

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cfg = STATUS_MAP[status] || { cls: '' };
  return <span className={`mo-badge ${cfg.cls}`}>{t(`status.${status}`, status)}</span>;
};

/* ── Order Card ─────────────────────────────────────────── */
const OrderCard = ({ order }) => {
  const { t } = useTranslation();
  const firstItem  = order.orderItems?.[0];
  const extraCount = (order.orderItems?.length || 1) - 1;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const addr = order.shippingAddress;
  const addrLine = addr
    ? `${addr.city}, ${addr.state}`
    : '';

  return (
    <Link
      to={`/orders/${order._id}`}
      className="mo-card"
      aria-label={t('orders.order_card_label', {
        id:     order._id?.slice(-8).toUpperCase(),
        status: order.orderStatus,
        total:  (order.totalPrice || 0).toLocaleString('en-IN'),
      })}
    >

      {/* Header row */}
      <div className="mo-card-header">
        <div className="mo-card-meta">
          <span className="mo-order-id">
            <FaBox className="mo-meta-icon" aria-hidden="true" />
            {t('orders.order_prefix', { id: order._id?.slice(-8).toUpperCase() })}
          </span>
          <span className="mo-order-date">
            <FaRegCalendarAlt className="mo-meta-icon" aria-hidden="true" />
            {date}
          </span>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Items row */}
      <div className="mo-card-body">
        <div className="mo-items-preview">
          {order.orderItems?.slice(0, 3).map((item, idx) => (
            <img
              key={idx}
              src={item.image || `https://picsum.photos/64/80?random=${idx}`}
              alt={item.name || 'Order item'}
              className="mo-thumb"
              onError={(e) => { e.target.src = `https://picsum.photos/64/80?random=${Math.random()}`; }}
            />
          ))}
          {order.orderItems?.length > 3 && (
            <div className="mo-thumb-more">+{order.orderItems.length - 3}</div>
          )}
        </div>

        <div className="mo-items-info">
          <div className="mo-item-name">{firstItem?.name || 'Order'}</div>
          {firstItem && (
            <div className="mo-item-meta">
              {firstItem.size  && <span>{t('orders.size',  { size:  firstItem.size  })}</span>}
              {firstItem.color && <span>{t('orders.color', { color: firstItem.color })}</span>}
              <span>{t('orders.qty', { qty: firstItem.quantity })}</span>
            </div>
          )}
          {extraCount > 0 && (
            <div className="mo-extra-items">
              {extraCount > 1
                ? t('orders.more_items_plural', { count: extraCount })
                : t('orders.more_items', { count: extraCount })}
            </div>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="mo-card-footer">
        <div className="mo-footer-left">
          {addrLine && (
            <span className="mo-addr">
              <FaMapMarkerAlt className="mo-meta-icon" aria-hidden="true" />
              {addrLine}
            </span>
          )}
          <span className="mo-payment">{order.paymentMethod}</span>
        </div>
        <div className="mo-footer-right">
          <span className="mo-total">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
          <FaChevronRight className="mo-arrow" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
};

/* ── Filter tab ─────────────────────────────────────────── */
const FILTER_KEYS = ['All', 'Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

/* ── Main page ──────────────────────────────────────────── */
const Orders = () => {
  const { t } = useTranslation();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('All');
  const [page,    setPage]    = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/orders/myorders?page=${pageNum}&limit=10`);
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || t('orders.failed_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const filtered = filter === 'All'
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="mo-page">
        <div className="container">
          <div className="mo-heading-row">
            <h1 className="mo-heading">{t('orders.loading')}</h1>
          </div>
          <div className="mo-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="mo-skeleton-card">
                <div className="mo-skeleton-line mo-skeleton-line--short" />
                <div className="mo-skeleton-line" />
                <div className="mo-skeleton-line mo-skeleton-line--medium" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="mo-page">
        <div className="container">
          <div className="mo-empty">
            <div className="mo-empty-icon" aria-hidden="true">!</div>
            <h2>{t('orders.error_title')}</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => fetchOrders(1)}>
              <FaRedo style={{ marginRight: '0.4rem' }} /> {t('orders.try_again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mo-page">
      <div className="container">

        {/* Page header */}
        <div className="mo-heading-row">
          <h1 className="mo-heading">
            <FaShoppingBag className="mo-heading-icon" aria-hidden="true" />
            {t('orders.title')}
          </h1>
          {orders.length > 0 && (
            <span className="mo-count">
              {orders.length !== 1
                ? t('orders.orders_count_plural', { count: orders.length })
                : t('orders.orders_count', { count: orders.length })}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="mo-filters" role="tablist" aria-label={t('orders.filter_label')}>
            {FILTER_KEYS.map((f) => {
              const count = f === 'All' ? orders.length : orders.filter((o) => o.orderStatus === f).length;
              if (f !== 'All' && count === 0) return null;
              const label = f === 'All' ? t('orders.filter_all') : t(`status.${f}`, f);
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  className={`mo-filter-btn${filter === f ? ' mo-filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {label}
                  {count > 0 && <span className="mo-filter-count">{count}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="mo-empty">
            <FaShoppingBag className="mo-empty-icon" aria-hidden="true" />
            <h2>{t('orders.no_orders')}</h2>
            <p>{t('orders.no_orders_desc')}</p>
            <Link to="/products" className="btn btn-primary">{t('orders.shop_now')}</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mo-empty">
            <FaBox className="mo-empty-icon" aria-hidden="true" />
            <h2>{t('orders.no_status_orders', { status: t(`status.${filter}`, filter) })}</h2>
            <p>{t('orders.no_status_desc')}</p>
            <button className="btn btn-outline" onClick={() => setFilter('All')}>{t('orders.view_all')}</button>
          </div>
        ) : (
          <>
            <div className="mo-list">
              {filtered.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && filter === 'All' && (
              <nav className="mo-pagination" aria-label="Orders pagination">
                <button
                  className="btn btn-outline mo-page-btn"
                  disabled={page <= 1}
                  onClick={() => fetchOrders(page - 1)}
                  aria-label={t('orders.prev_label')}
                >
                  {t('orders.prev_page')}
                </button>
                <span className="mo-page-info" aria-live="polite" aria-atomic="true">
                  {t('orders.page_of', { page, total: totalPages })}
                </span>
                <button
                  className="btn btn-outline mo-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => fetchOrders(page + 1)}
                  aria-label={t('orders.next_label')}
                >
                  {t('orders.next_page')}
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;

// Made with Bob
