import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { FaSearch, FaHeart, FaRegHeart, FaSlidersH, FaTimes, FaStar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import useWishlistStore from '../store/useWishlistStore';
import useAuthStore from '../store/useAuthStore';
import './Products.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const calcDiscount = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

const Products = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggle: toggleWishlist } = useWishlistStore();

  const location = useLocation();

  /* ── derive filters directly from URL — single source of truth ── */
  const filtersFromParams = () => ({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sizes:    searchParams.get('sizes')?.split(',').filter(Boolean) || [],
    sort:     searchParams.get('sort')     || '',
    page:     parseInt(searchParams.get('page') || '1'),
  });

  /* ── state ── */
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // filters is always derived from URL — never stale
  const [filters, setFilters] = useState(filtersFromParams);

  /* ── re-sync filters on every URL change (navbar, category cards, back/fwd) ── */
  useEffect(() => {
    setFilters(filtersFromParams());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /* ── fetch ── */
  const fetchProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.category) params.set('category', f.category);
      if (f.search)   params.set('search',   f.search);
      if (f.minPrice) params.set('minPrice', f.minPrice);
      if (f.maxPrice) params.set('maxPrice', f.maxPrice);
      if (f.sizes?.length) params.set('sizes', f.sizes.join(','));
      params.set('page',  f.page  || 1);
      params.set('limit', 16);
      if (f.sort) {
        if (f.sort === 'price_asc')    { params.set('sort', 'price');   params.set('order', 'asc');  }
        if (f.sort === 'price_desc')   { params.set('sort', 'price');   params.set('order', 'desc'); }
        if (f.sort === 'rating_desc')  { params.set('sort', 'ratings'); params.set('order', 'desc'); }
        if (f.sort === 'newest')       { params.set('sort', 'createdAt'); params.set('order', 'desc'); }
      }
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  /* ── helpers ── */
  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, Array.isArray(value) ? value.join(',') : value);
    else sp.delete(key);
    sp.set('page', '1');
    setSearchParams(sp, { replace: true });
  };

  const toggleSize = (size) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    updateFilter('sizes', next);
  };

  const clearAll = () => {
    const fresh = { search: '', category: searchParams.get('category') || '', minPrice: '', maxPrice: '', sizes: [], sort: '', page: 1 };
    setFilters(fresh);
    const sp = new URLSearchParams();
    if (fresh.category) sp.set('category', fresh.category);
    setSearchParams(sp, { replace: true });
  };

  const handlePage = (p) => {
    const next = { ...filters, page: p };
    setFilters(next);
    const sp = new URLSearchParams(searchParams);
    sp.set('page', p);
    setSearchParams(sp, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = filters.category
    ? t('products.collection', { category: filters.category })
    : t('products.all_products');

  /* ── render ── */
  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="container">
          <div className="products-header-inner">
            <div>
              <h1>{pageTitle}</h1>
              {!loading && <span className="products-count">{t('products.items_count', { count: totalItems })}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Filter overlay (mobile) */}
      <div
        className={`filter-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className="products-layout">
        {/* Sidebar */}
        <aside
          id="filters-sidebar"
          className={`filters-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
          aria-label={t('products.filters')}
        >
          {mobileOpen && (
            <button
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--muted)' }}
              onClick={() => setMobileOpen(false)}
              aria-label={t('products.close_filters')}
            >
              <FaTimes />
            </button>
          )}

          <div className="filters-header">
            <h3>{t('products.filters')}</h3>
            <button className="filters-clear" onClick={clearAll}>{t('products.clear_all')}</button>
          </div>

          {/* Price */}
          <div className="filter-group">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend className="filter-group-title">{t('products.price_range')}</legend>
              <div className="price-inputs">
                <label htmlFor="filter-min-price" className="sr-only">{t('products.min_price')}</label>
                <input
                  id="filter-min-price"
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  min="0"
                  aria-label={t('products.min_price')}
                />
                <label htmlFor="filter-max-price" className="sr-only">{t('products.max_price')}</label>
                <input
                  id="filter-max-price"
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  min="0"
                  aria-label={t('products.max_price')}
                />
              </div>
            </fieldset>
          </div>

          {/* Sizes */}
          <div className="filter-group">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend className="filter-group-title">{t('products.size')}</legend>
              <div className="size-filter-grid" role="group" aria-label={t('products.filter_by_size')}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className={`size-filter-btn ${filters.sizes.includes(s) ? 'active' : ''}`}
                    onClick={() => toggleSize(s)}
                    aria-pressed={filters.sizes.includes(s)}
                    aria-label={t('products.size_label', { size: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Category */}
          <div className="filter-group">
            <div className="filter-group-title">{t('products.category')}</div>
            <div className="filter-options">
              {['Men', 'Women', 'Kids', 'Accessories', 'Shoes', 'Bags'].map((cat) => (
                <label key={cat} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.category === cat}
                    onChange={() => updateFilter('category', filters.category === cat ? '' : cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button
                className="mobile-filter-btn"
                onClick={() => setMobileOpen(true)}
                aria-expanded={mobileOpen}
                aria-controls="filters-sidebar"
                aria-label={t('products.open_filters')}
              >
                <FaSlidersH aria-hidden="true" /> {t('products.filters')}
              </button>
              <div className="search-bar" role="search">
                <label htmlFor="products-search" className="sr-only">{t('products.search_products')}</label>
                <FaSearch aria-hidden="true" />
                <input
                  id="products-search"
                  type="search"
                  placeholder={t('products.search_placeholder')}
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  aria-label={t('products.search_products')}
                />
              </div>
            </div>
            <label htmlFor="products-sort" className="sr-only">{t('products.sort')}</label>
            <select
              id="products-sort"
              className="sort-select"
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              aria-label={t('products.sort')}
            >
              <option value="">{t('products.recommended')}</option>
              <option value="newest">{t('products.newest')}</option>
              <option value="price_asc">{t('products.price_low')}</option>
              <option value="price_desc">{t('products.price_high')}</option>
              <option value="rating_desc">{t('products.top_rated')}</option>
            </select>
          </div>

          {/* Grid */}
          <div
            className="products-grid"
            aria-live="polite"
            aria-busy={loading}
            aria-label={t('products.all_products')}
          >
            {loading ? (
              <div className="products-spinner">
                <div className="spinner" role="status" aria-label={t('products.loading')} />
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty" role="status">
                <FaSearch aria-hidden="true" />
                <h3>{t('products.no_products')}</h3>
                <p>{t('products.no_products_hint')}</p>
              </div>
            ) : (
              products.map((product) => {
                const price    = product.price || 0;
                const discP    = product.discountPrice || 0;
                const display  = discP > 0 ? discP : price;
                const disc     = calcDiscount(price, discP);
                const image    = product.images?.[0] || `https://picsum.photos/400/600?random=${product._id}`;
                const wishlisted = isWishlisted(product._id);

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
                        {product.stock === 0 && (
                          <div className="out-of-stock-overlay">
                            <span className="out-of-stock-label">{t('products.out_of_stock')}</span>
                          </div>
                        )}
                      </div>
                      <div className="product-listing-info">
                        <div className="product-listing-brand">{product.brand}</div>
                        <div className="product-listing-name">{product.name}</div>
                        <div className="product-listing-price">
                          <span className="price-current">₹{display.toLocaleString('en-IN')}</span>
                          {disc > 0 && <>
                            <span className="price-original">₹{price.toLocaleString('en-IN')}</span>
                            <span className="price-discount">{t('products.off', { disc })}</span>
                          </>}
                        </div>
                        {product.ratings > 0 && (
                          <div
                            className="product-listing-rating"
                            aria-label={`${product.ratings.toFixed(1)} out of 5 stars${product.numReviews > 0 ? `, ${product.numReviews} reviews` : ''}`}
                          >
                            <FaStar className="rating-star" aria-hidden="true" />
                            <span aria-hidden="true">{product.ratings.toFixed(1)}</span>
                            {product.numReviews > 0 && <span aria-hidden="true">({product.numReviews})</span>}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Wishlist heart — outside <Link> */}
                    <button
                      className={`card-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id, isAuthenticated); }}
                      aria-label={wishlisted ? t('products.wishlist_remove') : t('products.wishlist_add')}
                    >
                      {wishlisted ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav className="pagination" aria-label="Product pages">
              <button
                className="pagination-btn"
                onClick={() => handlePage(filters.page - 1)}
                disabled={filters.page <= 1}
                aria-label={t('products.prev_page')}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${p === filters.page ? 'active' : ''}`}
                  onClick={() => handlePage(p)}
                  aria-current={p === filters.page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => handlePage(filters.page + 1)}
                disabled={filters.page >= totalPages}
                aria-label={t('products.next_page')}
              >
                ›
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

// Made with Bob
