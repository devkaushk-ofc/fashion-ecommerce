import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingBag, FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import useWishlistStore from '../store/useWishlistStore';
import useAuthStore from '../store/useAuthStore';
import './Wishlist.css';
import './Products.css'; // reuse product card styles

const calcDiscount = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

const Wishlist = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { wishlistIds, toggle: toggleWishlist } = useWishlistStore();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/users/wishlist');
        setProducts(data.wishlist || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated, wishlistIds.length]);

  const handleRemove = (productId) => {
    toggleWishlist(productId, isAuthenticated);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>{t('wishlist.title')}</h1>
          {!loading && products.length > 0 && (
            <span className="wishlist-count">
              {products.length} {products.length === 1 ? t('wishlist.item') : t('wishlist.items')}
            </span>
          )}
        </div>

        <div className="wishlist-grid">
          {loading ? (
            <div className="wishlist-spinner">
              <div className="spinner" role="status" aria-label={t('wishlist.loading')} />
            </div>
          ) : products.length === 0 ? (
            <div className="wishlist-empty" role="status">
              <FaRegHeart aria-hidden="true" />
              <h2>{t('wishlist.empty')}</h2>
              <p>{t('wishlist.empty_desc')}</p>
              <Link to="/products" className="btn btn-primary">{t('wishlist.explore')}</Link>
            </div>
          ) : (
            products.map((product) => {
              const price   = product.price || 0;
              const discP   = product.discountPrice || 0;
              const display = discP > 0 ? discP : price;
              const disc    = calcDiscount(price, discP);
              const image   = product.images?.[0] || `https://picsum.photos/400/600?random=${product._id}`;

              return (
                <div key={product._id} className="product-listing-card" style={{ position: 'relative' }}>
                  <Link to={`/products/${product._id}`} style={{ display: 'contents' }}>
                    <div className="product-img-wrap">
                      <img
                        src={image}
                        alt={product.name}
                        className="product-listing-img"
                        onError={(e) => { e.target.src = `https://picsum.photos/400/600?random=${Math.random()}`; }}
                        loading="lazy"
                      />
                      {disc > 0 && <span className="product-badge">{disc}% OFF</span>}
                    </div>
                    <div className="product-listing-info">
                      <div className="product-listing-brand">{product.brand}</div>
                      <div className="product-listing-name">{product.name}</div>
                      <div className="product-listing-price">
                        <span className="price-current">₹{display.toLocaleString('en-IN')}</span>
                        {disc > 0 && <>
                          <span className="price-original">₹{price.toLocaleString('en-IN')}</span>
                          <span className="price-discount">{t('wishlist.off', { disc })}</span>
                        </>}
                      </div>
                      {product.ratings > 0 && (
                        <div className="product-listing-rating">
                          <FaStar className="rating-star" />
                          <span>{product.ratings.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove from wishlist */}
                  <button
                    className="wishlist-remove-btn"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(product._id); }}
                    aria-label={t('wishlist.remove', { name: product.name })}
                  >
                    <FaHeart aria-hidden="true" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

// Made with Bob
