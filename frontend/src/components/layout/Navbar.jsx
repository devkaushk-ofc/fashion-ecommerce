import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaHeart, FaSearch, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import { useTheme } from '../../context/ThemeContext';
import LanguageSwitcher from '../LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCartItemsCount } = useCartStore();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  // close expanded search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter')  handleSearch(e);
    if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); }
  };

  const cartCount = getCartItemsCount();
  const isDark = theme === 'dark';

  const NAV_LINKS = [
    { label: t('nav.home'),   to: '/' },
    { label: t('nav.men'),    to: '/products?category=Men' },
    { label: t('nav.women'),  to: '/products?category=Women' },
    { label: t('nav.kids'),   to: '/products?category=Kids' },
    { label: t('nav.genz'),   to: '/products?category=Accessories', badge: t('nav.new_badge') },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label={t('nav.main_nav')}>

      {/* ── Single main row ── */}
      <div className="navbar-inner container">

        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="Fashion Store home">
          <span className="logo-text">fashion<span className="logo-accent">store</span></span>
        </Link>

        {/* Category links */}
        <ul className="navbar-links" role="menubar">
          {NAV_LINKS.map(({ label, to, badge }) => (
            <li key={label} role="none">
              <Link to={to} role="menuitem" className="nav-cat-link">
                {label}
                {badge && <span className="nav-badge">{badge}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search bar — desktop */}
        <form
          className="navbar-search"
          onSubmit={handleSearch}
          role="search"
          aria-label={t('nav.search_label')}
          ref={searchRef}
        >
          <FaSearch className="search-input-icon" aria-hidden="true" />
          <input
            type="search"
            className="search-input"
            placeholder={t('nav.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKey}
            aria-label={t('nav.search_label')}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label={t('nav.search_clear')}
            >
              <FaTimes />
            </button>
          )}
        </form>

        {/* Right action icons */}
        <div className="navbar-actions">

          {/* Mobile search toggle */}
          <button
            className="mobile-search-btn nav-action-btn"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={t('nav.search_label')}
          >
            <FaSearch />
          </button>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Theme toggle */}
          <button
            className="theme-toggle nav-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? t('nav.switch_light') : t('nav.switch_dark')}
            aria-pressed={isDark}
            title={isDark ? t('nav.light_mode') : t('nav.dark_mode')}
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
            <span className="theme-toggle-icon" aria-hidden="true">
              {isDark ? <FaMoon /> : <FaSun />}
            </span>
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="nav-action-btn" aria-label={t('nav.wishlist')}>
                <FaHeart />
                <span className="nav-action-label">{t('nav.wishlist')}</span>
              </Link>

              <Link to="/cart" className="nav-action-btn" aria-label={t('nav.cart_items', { count: cartCount })}>
                <span className="cart-icon-wrap">
                  <FaShoppingCart />
                  {cartCount > 0 && (
                    <span className="cart-badge" aria-hidden="true">{cartCount}</span>
                  )}
                </span>
                <span className="nav-action-label">{t('nav.bag')}</span>
              </Link>

              <div className="user-menu">
                <button className="nav-action-btn" aria-haspopup="true" aria-label={t('nav.profile')}>
                  <FaUser />
                  <span className="nav-action-label">{t('nav.profile')}</span>
                </button>
                <div className="dropdown" role="menu">
                  <Link to="/profile"  role="menuitem">{t('nav.my_profile')}</Link>
                  <Link to="/orders"   role="menuitem">{t('nav.my_orders')}</Link>
                  <Link to="/wishlist" role="menuitem">{t('nav.wishlist')}</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" role="menuitem">{t('nav.admin_dashboard')}</Link>
                  )}
                  <button onClick={handleLogout} role="menuitem">{t('nav.logout')}</button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login"    className="btn btn-outline">{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('nav.register')}</Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-expanded={menuOpen}
            aria-label={t('nav.toggle_menu')}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile search bar (expands below main row) */}
      {searchOpen && (
        <div className="mobile-search-bar container">
          <form onSubmit={handleSearch} role="search" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <FaSearch className="search-input-icon" aria-hidden="true" />
            <input
              type="search"
              className="search-input"
              placeholder={t('nav.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              autoFocus
              aria-label={t('nav.search_label')}
            />
            {searchQuery && (
              <button type="button" className="search-clear" onClick={() => setSearchQuery('')} aria-label={t('nav.search_clear')}>
                <FaTimes />
              </button>
            )}
          </form>
        </div>
      )}

      {/* ── Mobile drawer ── */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-nav-section">
          <span className="mobile-nav-heading">{t('nav.shop')}</span>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} onClick={closeMobile}>{label}</Link>
          ))}
        </div>
        <div className="mobile-nav-divider" />
        {isAuthenticated ? (
          <div className="mobile-nav-section">
            <span className="mobile-nav-heading">{t('nav.my_account')}</span>
            <Link to="/wishlist" onClick={closeMobile}>{t('nav.wishlist')}</Link>
            <Link to="/cart"     onClick={closeMobile}>{t('nav.bag')} ({cartCount})</Link>
            <Link to="/profile"  onClick={closeMobile}>{t('nav.my_profile')}</Link>
            <Link to="/orders"   onClick={closeMobile}>{t('nav.my_orders')}</Link>
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" onClick={closeMobile}>{t('nav.admin_dashboard')}</Link>
            )}
            <button onClick={handleLogout} className="mobile-logout-btn">{t('nav.logout')}</button>
          </div>
        ) : (
          <div className="mobile-nav-section">
            <Link to="/login"    onClick={closeMobile}>{t('nav.login')}</Link>
            <Link to="/register" onClick={closeMobile}>{t('nav.register')}</Link>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
