import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaExclamationCircle, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import useCartStore from '../store/useCartStore';
import useWishlistStore from '../store/useWishlistStore';
import useAuthStore from '../store/useAuthStore';
import './ProductDetail.css';

const calcDiscount = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

const StarRow = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className="rating-stars" aria-label={`${rating} out of 5`}>
      {stars.map((s) => (
        <FaStar key={s} style={{ color: s <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }} />
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, loading: cartLoading } = useCartStore();
  const { isWishlisted, toggle: toggleWishlist } = useWishlistStore();

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeImg,    setActiveImg]    = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError,    setSizeError]    = useState('');
  const [adding,       setAdding]       = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        if (data.product?.colors?.length) setSelectedColor(data.product.colors[0]);
      } catch {
        navigate('/products', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return (
    <div className="product-detail-page">
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="spinner" role="status" aria-label={t('product_detail.loading')} />
      </div>
    </div>
  );

  if (!product) return null;

  const price    = product.price || 0;
  const discP    = product.discountPrice || 0;
  const display  = discP > 0 ? discP : price;
  const disc     = calcDiscount(price, discP);
  const images   = product.images?.length ? product.images : [`https://picsum.photos/600/800?random=${id}`];
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async () => {
    if (product.sizes?.length && !selectedSize) {
      setSizeError(t('product_detail.size_error'));
      return;
    }
    setSizeError('');
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        size: selectedSize || 'Free Size',
        color: selectedColor || (product.colors?.[0] ?? 'Default'),
      });
    } catch {
      // toast already shown by store
    } finally {
      setAdding(false);
    }
  };

  // Helper: colour to CSS (works for hex and named colours)
  const colorStyle = (c) => ({ backgroundColor: c.startsWith('#') ? c : c.toLowerCase() });

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
            <li><Link to="/">{t('product_detail.home')}</Link></li>
            <li aria-hidden="true"><FaChevronRight className="breadcrumb-sep" /></li>
            <li><Link to="/products">{t('product_detail.products')}</Link></li>
            {product.category && (
              <>
                <li aria-hidden="true"><FaChevronRight className="breadcrumb-sep" /></li>
                <li><Link to={`/products?category=${product.category}`}>{product.category}</Link></li>
              </>
            )}
            <li aria-hidden="true"><FaChevronRight className="breadcrumb-sep" /></li>
            <li><span className="breadcrumb-current" aria-current="page">{product.name}</span></li>
          </ol>
        </nav>

        {/* Detail grid */}
        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="gallery-thumbs" role="list" aria-label={t('product_detail.product_images')}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className={`gallery-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  onError={(e) => { e.target.src = `https://picsum.photos/600/800?random=${i}`; }}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveImg(i)}
                />
              ))}
            </div>
            <div className="gallery-main">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="gallery-main-img"
                onError={(e) => { e.target.src = `https://picsum.photos/600/800?random=${id}`; }}
              />
            </div>
          </div>

          {/* Info panel */}
          <div className="product-info-panel">
            <div className="product-detail-brand">{product.brand}</div>
            <h1 className="product-detail-name">{product.name}</h1>

            {/* Rating */}
            {product.ratings > 0 && (
              <div className="product-detail-rating">
                <StarRow rating={product.ratings} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{Number(product.ratings).toFixed(1)}</span>
                <span className="rating-divider">|</span>
                <span className="rating-count">{t('product_detail.ratings', { count: product.numReviews })}</span>
              </div>
            )}

            <div className="detail-divider" />

            {/* Price */}
            <div className="product-detail-price">
              <span className="detail-price-current">₹{display.toLocaleString('en-IN')}</span>
              {disc > 0 && <>
                <span className="detail-price-original">₹{price.toLocaleString('en-IN')}</span>
                <span className="detail-price-off">{t('product_detail.off', { disc })}</span>
              </>}
            </div>
            {disc > 0 && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)', fontWeight: 600 }}>
                {t('product_detail.inclusive_taxes')}
              </p>
            )}

            <div className="detail-divider" />

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="detail-section-label">
                  {t('product_detail.select_size')}
                  <button className="size-guide-link" type="button">{t('product_detail.size_guide')}</button>
                </div>
                <div className="sizes-grid" role="group" aria-label={t('product_detail.select_size_group')}>
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`size-option ${selectedSize === s ? 'selected' : ''}`}
                      onClick={() => { setSelectedSize(s); setSizeError(''); }}
                      type="button"
                      aria-pressed={selectedSize === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <div className="size-error" role="alert">
                    <FaExclamationCircle /> {sizeError}
                  </div>
                )}
              </div>
            )}

            {/* Colour selection */}
            {product.colors?.length > 0 && (
              <div>
                <div className="detail-section-label">
                  {t('product_detail.colour')} <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: '0.25rem' }}>{selectedColor}</span>
                </div>
                <div className="colors-row">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      className={`color-dot-btn ${selectedColor === c ? 'selected' : ''}`}
                      style={colorStyle(c)}
                      onClick={() => setSelectedColor(c)}
                      aria-label={`Color: ${c}`}
                      aria-pressed={selectedColor === c}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            {product.stock > 0 && product.stock < 10 && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--danger)', fontWeight: 600 }}>
                {t('product_detail.only_left', { count: product.stock })}
              </p>
            )}

            {/* CTA */}
            <div className="product-cta-row">
              <button
                className="btn-add-cart"
                onClick={handleAddToCart}
                disabled={adding || cartLoading || product.stock === 0}
                aria-busy={adding}
                aria-label={
                  product.stock === 0
                    ? t('product_detail.out_of_stock')
                    : adding
                    ? t('product_detail.adding_to_cart')
                    : t('product_detail.add_cart_label', { name: product.name })
                }
              >
                <FaShoppingCart aria-hidden="true" />
                {product.stock === 0
                  ? t('product_detail.out_of_stock')
                  : adding
                  ? t('product_detail.adding')
                  : t('product_detail.add_to_cart')}
              </button>

              <button
                className={`btn-wishlist ${wishlisted ? 'wishlisted' : ''}`}
                onClick={() => toggleWishlist(product._id, isAuthenticated)}
                type="button"
                aria-label={
                  wishlisted
                    ? t('product_detail.wishlist_remove_label', { name: product.name })
                    : t('product_detail.wishlist_add_label', { name: product.name })
                }
                aria-pressed={wishlisted}
              >
                {wishlisted ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
                {wishlisted ? t('product_detail.wishlisted') : t('product_detail.add_wishlist')}
              </button>
            </div>

            <div className="detail-divider" />

            {/* Meta */}
            <div className="product-meta-list">
              {product.description && (
                <div className="product-meta-row">
                  <span className="meta-key">{t('product_detail.description')}</span>
                  <span className="meta-val">{product.description}</span>
                </div>
              )}
              {product.material && (
                <div className="product-meta-row">
                  <span className="meta-key">{t('product_detail.material')}</span>
                  <span className="meta-val">{product.material}</span>
                </div>
              )}
              {product.careInstructions && (
                <div className="product-meta-row">
                  <span className="meta-key">{t('product_detail.care')}</span>
                  <span className="meta-val">{product.careInstructions}</span>
                </div>
              )}
              <div className="product-meta-row">
                <span className="meta-key">{t('product_detail.category_label')}</span>
                <span className="meta-val">{product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        {product.reviews?.length > 0 && (
          <section className="product-reviews" aria-label="Customer reviews">
            <div className="reviews-header">
              <h2>{t('product_detail.ratings_reviews')}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaStar style={{ color: '#f59e0b' }} />
                <strong>{Number(product.ratings).toFixed(1)}</strong>
                <span style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)' }}>
                  ({t('product_detail.reviews_count', { count: product.numReviews })})
                </span>
              </div>
            </div>
            {product.reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-meta">
                  <StarRow rating={r.rating} />
                  <span className="review-author">{r.name}</span>
                  <span className="review-date">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="review-text">{r.comment}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

// Made with Bob
