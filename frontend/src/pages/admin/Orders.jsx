import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import '../admin/Admin.css';

const STATUS_OPTIONS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_BADGE_MAP = {
  Processing:         'badge-orange',
  Confirmed:          'badge-blue',
  Shipped:            'badge-purple',
  'Out for Delivery': 'badge-pink',
  Delivered:          'badge-green',
  Cancelled:          'badge-red',
};

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  return (
    <span className={`admin-badge ${STATUS_BADGE_MAP[status] || ''}`}>
      {t(`status.${status}`, status)}
    </span>
  );
};

const AdminOrders = () => {
  const { t } = useTranslation();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [updating, setUpdating] = useState(null); // order _id being updated
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]     = useState(0);

  const fetchOrders = useCallback(async (pageNum = 1, status = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 15 });
      if (status) params.append('status', status);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.orders.failed_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchOrders(1, statusFilter); }, [fetchOrders, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
      );
    } catch (err) {
      alert(err.response?.data?.message || t('admin.orders.failed_update'));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-heading">{t('admin.orders.title')}</h1>
          <span className="admin-total-badge" aria-live="polite">
            {t('admin.orders.total_orders', { count: total })}
          </span>
        </div>

        {/* Filter */}
        <div className="admin-filters">
          <label htmlFor="order-status-filter" className="sr-only">{t('admin.orders.filter_status')}</label>
          <select
            id="order-status-filter"
            className="admin-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label={t('admin.orders.filter_status')}
          >
            <option value="">{t('admin.orders.all_statuses')}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{t(`status.${s}`, s)}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="admin-loading" role="status" aria-live="polite">
            <span className="sr-only">{t('admin.orders.loading')}</span>
            <span aria-hidden="true">{t('admin.orders.loading')}</span>
          </div>
        )}
        {error && (
          <div className="admin-error" role="alert">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table" aria-label={t('admin.orders.title')}>
                <caption className="sr-only">
                  {t('admin.orders.table_caption', { count: total })}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{t('admin.orders.order_id')}</th>
                    <th scope="col">{t('admin.orders.customer')}</th>
                    <th scope="col">{t('admin.orders.date')}</th>
                    <th scope="col">{t('admin.orders.items')}</th>
                    <th scope="col">{t('admin.orders.total')}</th>
                    <th scope="col">{t('admin.orders.payment')}</th>
                    <th scope="col">{t('admin.orders.status')}</th>
                    <th scope="col">{t('admin.orders.update_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                        {t('admin.orders.no_orders')}
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const orderId = `#${order._id?.slice(-8).toUpperCase()}`;
                      const itemCount = order.orderItems?.length || 0;
                      return (
                        <tr key={order._id}>
                          <td className="admin-order-id">{orderId}</td>
                          <td>
                            <div className="admin-customer-name">{order.user?.name || '—'}</div>
                            <div className="admin-customer-email">{order.user?.email || ''}</div>
                          </td>
                          <td>
                            <time dateTime={order.createdAt}>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </time>
                          </td>
                          <td>
                            {itemCount !== 1
                              ? t('admin.orders.items_count_plural', { count: itemCount })
                              : t('admin.orders.items_count', { count: itemCount })}
                          </td>
                          <td className="admin-price">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                          <td>{order.paymentMethod}</td>
                          <td><StatusBadge status={order.orderStatus} /></td>
                          <td>
                            <label htmlFor={`status-${order._id}`} className="sr-only">
                              {t('admin.orders.update_label', { id: orderId })}
                            </label>
                            <select
                              id={`status-${order._id}`}
                              className="admin-select admin-select--sm"
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updating === order._id || order.orderStatus === 'Cancelled'}
                              aria-label={t('admin.orders.order_label', { id: orderId })}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{t(`status.${s}`, s)}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="admin-pagination" aria-label={t('admin.orders.pagination_label')}>
                <button
                  className="btn btn-outline"
                  disabled={page <= 1}
                  onClick={() => fetchOrders(page - 1, statusFilter)}
                  aria-label={t('admin.orders.prev_label')}
                >
                  {t('admin.orders.prev')}
                </button>
                <span className="admin-page-info" aria-live="polite" aria-atomic="true">
                  {t('admin.orders.page_of', { page, total: totalPages })}
                </span>
                <button
                  className="btn btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => fetchOrders(page + 1, statusFilter)}
                  aria-label={t('admin.orders.next_label')}
                >
                  {t('admin.orders.next')}
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

// Made with Bob
