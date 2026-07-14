import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './Home.css';

/* ── Category data — query stays English (API key), label is translated ── */
const CATEGORY_KEYS = [
  { labelKey: 'home.cat_ethnic',    query: 'Women'       },
  { labelKey: 'home.cat_footwear',  query: 'Shoes'       },
  { labelKey: 'home.cat_bags',      query: 'Bags'        },
  { labelKey: 'home.cat_jewellery', query: 'Accessories' },
];

const Home = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?isFeatured=true&limit=8');
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleImageError = (e) => {
    e.target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
  };

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-content">
            <p className="hero-eyebrow" aria-hidden="true">{t('home.eyebrow')}</p>
            <h1 id="hero-heading">{t('home.hero_heading')}</h1>
            <p className="hero-sub">{t('home.hero_sub')}</p>
            <div className="hero-actions">
              <Link to="/products?category=Women" className="btn btn-primary">{t('home.shop_women')}</Link>
              <Link to="/products?category=Men"   className="btn btn-hero-outline">{t('home.shop_men')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Strip ── */}
      <section className="cat-strip-section" aria-label={t('home.shop_by_category')}>
        <div className="container">
          <h2 className="section-heading text-center mb-3">{t('home.shop_by_category')}</h2>
          <div className="cat-strip">
            {CATEGORY_KEYS.map(({ labelKey, query }) => {
              const label = t(labelKey);
              return (
                <Link
                  key={query}
                  to={`/products?category=${encodeURIComponent(query)}`}
                  className="cat-pill"
                  aria-label={t('home.shop_label', { label })}
                >
                  <span className="cat-pill-label">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="featured-products py-4" aria-label={t('home.featured_products')}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-heading">{t('home.featured_products')}</h2>
            <Link to="/products" className="section-view-all">{t('home.view_all')}</Link>
          </div>
          {loading ? (
            <div className="spinner" role="status" aria-label={t('home.loading_products')} />
          ) : (
            <div className="product-grid">
              {featuredProducts.length === 0 ? (
                <div className="empty-state-message">
                  <p>{t('home.no_featured')}</p>
                </div>
              ) : (
                featuredProducts.map((product) => {
                  const name          = product.name || 'Product';
                  const price         = product.price || 0;
                  const discountPrice = product.discountPrice || 0;
                  const rating        = product.ratings || 0;
                  const reviews       = product.numReviews || 0;
                  const image         = product.images?.[0] ||
                    `https://picsum.photos/400/600?random=${product._id}`;
                  const disc = discountPrice > 0
                    ? Math.round(((price - discountPrice) / price) * 100)
                    : 0;

                  return (
                    <Link to={`/products/${product._id}`} key={product._id} className="product-card">
                      <div className="product-card-img-wrap">
                        <img src={image} alt={name} onError={handleImageError} />
                        {disc > 0 && <span className="product-card-badge">{t('home.off_badge', { disc })}</span>}
                      </div>
                      <div className="product-info">
                        {product.brand && <p className="product-brand">{product.brand}</p>}
                        <h3>{name}</h3>
                        <p className="product-price">
                          ₹{discountPrice > 0 ? discountPrice.toLocaleString('en-IN') : price.toLocaleString('en-IN')}
                          {discountPrice > 0 && (
                            <span className="original-price">₹{price.toLocaleString('en-IN')}</span>
                          )}
                        </p>
                        {rating > 0 && (
                          <div className="product-rating" aria-label={`${rating.toFixed(1)} out of 5 stars, ${reviews} reviews`}>
                            <span aria-hidden="true">⭐ {rating.toFixed(1)} ({reviews})</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features py-4" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" className="sr-only">{t('home.store_features')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span aria-hidden="true" style={{ fontSize: '2rem' }}>🚚</span>
              <h3>{t('home.free_shipping')}</h3>
              <p>{t('home.free_shipping_desc')}</p>
            </div>
            <div className="feature-card">
              <span aria-hidden="true" style={{ fontSize: '2rem' }}>🔒</span>
              <h3>{t('home.secure_payment')}</h3>
              <p>{t('home.secure_payment_desc')}</p>
            </div>
            <div className="feature-card">
              <span aria-hidden="true" style={{ fontSize: '2rem' }}>↩️</span>
              <h3>{t('home.easy_returns')}</h3>
              <p>{t('home.easy_returns_desc')}</p>
            </div>
            <div className="feature-card">
              <span aria-hidden="true" style={{ fontSize: '2rem' }}>💬</span>
              <h3>{t('home.support')}</h3>
              <p>{t('home.support_desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// Made with Bob
