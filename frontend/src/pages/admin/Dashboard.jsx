import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import './Admin.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    featuredProducts: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData } = await api.get('/products?limit=100');
      const products = productsData.products || [];
      
      // Calculate stats
      const totalProducts = products.length;
      const featuredProducts = products.filter(p => p.isFeatured).length;
      const lowStockProducts = products.filter(p => p.stock < 10).length;
      
      // Get top products by stock
      const topProducts = [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5);

      setStats({
        totalProducts,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        featuredProducts,
        lowStockProducts,
        recentOrders: [],
        topProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="spinner" role="status" aria-label={t('admin.dashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>{t('admin.dashboard.title')}</h1>
        <p className="text-muted">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" role="list" aria-label={t('admin.dashboard.stats_label')}>
        <div className="stat-card" role="listitem">
          <div className="stat-icon products" aria-hidden="true">📦</div>
          <div className="stat-content">
            <p className="text-muted">{t('admin.dashboard.total_products')}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }} aria-label={`${stats.totalProducts} ${t('admin.dashboard.total_products')}`}>
              {stats.totalProducts}
            </p>
          </div>
          <Link to="/admin/products" className="stat-link" aria-label={t('admin.dashboard.view_products')}>{t('admin.dashboard.view_all')}</Link>
        </div>

        <div className="stat-card" role="listitem">
          <div className="stat-icon featured" aria-hidden="true">⭐</div>
          <div className="stat-content">
            <p className="text-muted">{t('admin.dashboard.featured')}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }} aria-label={`${stats.featuredProducts} ${t('admin.dashboard.featured')}`}>
              {stats.featuredProducts}
            </p>
          </div>
        </div>

        <div className="stat-card" role="listitem">
          <div className="stat-icon warning" aria-hidden="true">⚠️</div>
          <div className="stat-content">
            <p className="text-muted">{t('admin.dashboard.low_stock')}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }} aria-label={`${stats.lowStockProducts} ${t('admin.dashboard.low_stock')}`}>
              {stats.lowStockProducts}
            </p>
          </div>
        </div>

        <div className="stat-card" role="listitem">
          <div className="stat-icon orders" aria-hidden="true">🛒</div>
          <div className="stat-content">
            <p className="text-muted">{t('admin.dashboard.total_orders')}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }} aria-label={`${stats.totalOrders} ${t('admin.dashboard.total_orders')}`}>
              {stats.totalOrders}
            </p>
          </div>
          <Link to="/admin/orders" className="stat-link" aria-label={t('admin.dashboard.view_orders')}>{t('admin.dashboard.view_all')}</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>{t('admin.dashboard.quick_actions')}</h2>
        <div className="actions-grid">
          <Link to="/admin/products" className="action-card">
            <span className="action-icon">➕</span>
            <h3>{t('admin.dashboard.add_product')}</h3>
            <p>{t('admin.dashboard.add_product_desc')}</p>
          </Link>

          <Link to="/admin/products" className="action-card">
            <span className="action-icon">📝</span>
            <h3>{t('admin.dashboard.manage_products')}</h3>
            <p>{t('admin.dashboard.manage_products_desc')}</p>
          </Link>

          <Link to="/admin/orders" className="action-card">
            <span className="action-icon">📋</span>
            <h3>{t('admin.dashboard.view_orders_action')}</h3>
            <p>{t('admin.dashboard.view_orders_desc')}</p>
          </Link>

          <Link to="/admin/users" className="action-card">
            <span className="action-icon">👥</span>
            <h3>{t('admin.dashboard.manage_users')}</h3>
            <p>{t('admin.dashboard.manage_users_desc')}</p>
          </Link>
        </div>
      </div>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
      <div className="dashboard-section">
      <h2>{t('admin.dashboard.top_products')}</h2>
      <div className="products-list">
        {stats.topProducts.map((product) => (
          <div key={product._id} className="product-item">
            <img
              src={product.images?.[0] || 'https://picsum.photos/400/400'}
              alt={product.name || 'Product image'}
              className="product-thumb"
            />
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p className="product-meta">
                    {product.category} • {product.brand}
                  </p>
                  <div className="product-stats">
                    <span className="price">₹{product.price}</span>
                    <span className={`stock ${product.stock < 10 ? 'low' : ''}`}>
                      {t('admin.dashboard.in_stock', { count: product.stock })}
                    </span>
                  </div>
                </div>
                <Link to="/admin/products" className="btn btn-sm btn-secondary">
                  {t('admin.dashboard.edit')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="alert alert-warning">
          <strong>{t('admin.dashboard.low_stock_alert', { count: stats.lowStockProducts })}</strong>
          {' '}<Link to="/admin/products">{t('admin.dashboard.view_products_link')}</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// Made with Bob
