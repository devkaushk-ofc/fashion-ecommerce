import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import './Admin.css';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATEGORIES      = ['Men', 'Women', 'Kids', 'Accessories', 'Shoes', 'Bags', 'Jewelry', 'Watches'];

const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '',
  category: 'Men', subcategory: '', brand: '', sizes: [],
  colors: [], images: [], stock: '', isFeatured: false,
  material: '', careInstructions: '',
};

/* ── Helper IDs for accessible form labels ── */
const fid = (name) => `apf-${name}`;

const Products = () => {
  const { t } = useTranslation();
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [message,        setMessage]        = useState({ type: '', text: '' });
  const [formData,       setFormData]       = useState(EMPTY_FORM);

  /* Focus management for modal */
  const modalRef    = useRef(null);
  const firstFocRef = useRef(null);
  const triggerRef  = useRef(null); // button that opened modal

  /* ── fetch ── */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products || []);
    } catch {
      showMsg('error', t('admin.products.failed_fetch'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  /* ── form handlers ── */
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSizeToggle = (size) => {
    setFormData((p) => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter((s) => s !== size) : [...p.sizes, size],
    }));
  };

  const handleColorAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const color = e.target.value.trim();
      if (!formData.colors.includes(color)) {
        setFormData((p) => ({ ...p, colors: [...p.colors, color] }));
      }
      e.target.value = '';
    }
  };

  const handleColorRemove = (color) => {
    setFormData((p) => ({ ...p, colors: p.colors.filter((c) => c !== color) }));
  };

  const handleImageUrl = (e) => {
    const url = e.target.value.trim();
    setFormData((p) => ({ ...p, images: url ? [url] : [] }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setCurrentProduct(null);
  };

  /* ── modal open / close ── */
  const handleOpenModal = (product = null, btnEl = null) => {
    triggerRef.current = btnEl;
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setFormData({
        name:             product.name             || '',
        description:      product.description      || '',
        price:            product.price            || '',
        discountPrice:    product.discountPrice    || '',
        category:         product.category         || 'Men',
        subcategory:      product.subcategory      || '',
        brand:            product.brand            || '',
        sizes:            product.sizes            || [],
        colors:           product.colors           || [],
        images:           product.images           || [],
        stock:            product.stock            || '',
        isFeatured:       product.isFeatured       || false,
        material:         product.material         || '',
        careInstructions: product.careInstructions || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    // Return focus to trigger element
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  /* Trap focus inside modal & close on Escape */
  useEffect(() => {
    if (!showModal) return;

    // Focus first focusable element when modal opens
    setTimeout(() => firstFocRef.current?.focus(), 50);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { handleCloseModal(); return; }
      if (e.key !== 'Tab') return;

      const el = modalRef.current;
      if (!el) return;
      const focusable = Array.from(
        el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((n) => !n.disabled && n.offsetParent !== null);

      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price ||
        !formData.category || !formData.subcategory || !formData.brand) {
      showMsg('error', t('admin.products.fill_required'));
      return;
    }
    if (!formData.sizes.length)  { showMsg('error', t('admin.products.select_size'));  return; }
    if (!formData.colors.length) { showMsg('error', t('admin.products.add_color'));    return; }
    if (!formData.images.length) { showMsg('error', t('admin.products.add_image'));    return; }

    try {
      if (editMode) {
        await api.put(`/products/${currentProduct._id}`, formData);
        showMsg('success', t('admin.products.updated'));
      } else {
        await api.post('/products', formData);
        showMsg('success', t('admin.products.created'));
      }
      handleCloseModal();
      await fetchProducts();
    } catch (err) {
      showMsg('error', err.response?.data?.message || t('admin.products.failed_save'));
    }
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.products.delete_confirm'))) return;
    try {
      await api.delete(`/products/${id}`);
      showMsg('success', t('admin.products.deleted'));
      await fetchProducts();
    } catch {
      showMsg('error', t('admin.products.failed_delete'));
    }
  };

  /* ── toggle featured ── */
  const handleToggleFeatured = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { ...product, isFeatured: !product.isFeatured });
      showMsg('success', !product.isFeatured
        ? t('admin.products.featured_success')
        : t('admin.products.unfeatured_success'));
      fetchProducts();
    } catch {
      showMsg('error', t('admin.products.failed_update'));
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="container py-4">
        <div className="spinner" role="status" aria-label={t('admin.products.loading')} />
      </div>
    );
  }

  const modalTitle = editMode ? t('admin.products.modal_edit') : t('admin.products.modal_add');
  const modalId    = 'product-modal-title';

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>{t('admin.products.title')}</h1>
        <button
          className="btn btn-primary"
          onClick={(e) => handleOpenModal(null, e.currentTarget)}
          aria-haspopup="dialog"
        >
          {t('admin.products.add_new')}
        </button>
      </div>

      {/* Status messages */}
      {message.text && (
        <div
          className={`alert alert-${message.type}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message.text}
        </div>
      )}

      {/* Products table */}
      <div className="products-table-container">
        <table className="products-table" aria-label={t('admin.products.table_label')}>
          <caption className="sr-only">{t('admin.products.table_caption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('admin.products.image')}</th>
              <th scope="col">{t('admin.products.name')}</th>
              <th scope="col">{t('admin.products.category')}</th>
              <th scope="col">{t('admin.products.price')}</th>
              <th scope="col">{t('admin.products.stock')}</th>
              <th scope="col">{t('admin.products.featured')}</th>
              <th scope="col">{t('admin.products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">{t('admin.products.no_products')}</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.images?.[0] || 'https://picsum.photos/400/400'}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>
                    <div className="product-name">{product.name}</div>
                    <div className="product-brand">{product.brand}</div>
                  </td>
                  <td>
                    <div>{product.category}</div>
                    <div className="text-muted">{product.subcategory}</div>
                  </td>
                  <td>
                    <div className="product-price">
                      ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
                      {product.discountPrice > 0 && (
                        <span className="original-price">₹{product.price}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {t('admin.products.units', { count: product.stock })}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-toggle ${product.isFeatured ? 'active' : ''}`}
                      onClick={() => handleToggleFeatured(product)}
                      aria-pressed={product.isFeatured}
                      aria-label={product.isFeatured
                        ? t('admin.products.unfeature_label', { name: product.name })
                        : t('admin.products.feature_label',   { name: product.name })}
                    >
                      {product.isFeatured ? t('admin.products.feature_btn') : t('admin.products.unfeature_btn')}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => handleOpenModal(product, e.currentTarget)}
                        aria-haspopup="dialog"
                        aria-label={t('admin.products.edit_label', { name: product.name })}
                      >
                        {t('admin.products.edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product._id)}
                        aria-label={t('admin.products.delete_label', { name: product.name })}
                      >
                        {t('admin.products.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Product Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalId}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id={modalId}>{modalTitle}</h2>
              <button
                className="modal-close"
                onClick={handleCloseModal}
                aria-label={t('admin.products.close_dialog')}
                ref={firstFocRef}
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="product-form"
              noValidate
              aria-label={modalTitle}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={fid('name')}>
                    {t('admin.products.product_name')} <span aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id={fid('name')}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInput}
                    placeholder={t('admin.products.name_placeholder')}
                    required
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={fid('brand')}>
                    {t('admin.products.brand')} <span aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id={fid('brand')}
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInput}
                    placeholder={t('admin.products.brand_placeholder')}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={fid('description')}>
                  {t('admin.products.description')} <span aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <textarea
                  id={fid('description')}
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  placeholder={t('admin.products.desc_placeholder')}
                  rows="4"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={fid('category')}>
                    {t('admin.products.category')} <span aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <select
                    id={fid('category')}
                    name="category"
                    value={formData.category}
                    onChange={handleInput}
                    required
                    aria-required="true"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={fid('subcategory')}>
                    {t('admin.products.subcategory')} <span aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id={fid('subcategory')}
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInput}
                    placeholder={t('admin.products.subcat_placeholder')}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={fid('price')}>
                    {t('admin.products.price_label')} <span aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id={fid('price')}
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInput}
                    placeholder={t('admin.products.price_placeholder')}
                    step="0.01"
                    min="0"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={fid('discountPrice')}>{t('admin.products.discount_price')}</label>
                  <input
                    id={fid('discountPrice')}
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInput}
                    placeholder={t('admin.products.discount_placeholder')}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={fid('stock')}>
                    {t('admin.products.stock_label')} <span aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id={fid('stock')}
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInput}
                    placeholder={t('admin.products.stock_placeholder')}
                    min="0"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="form-group">
                <span id="apf-sizes-legend">
                  {t('admin.products.sizes_legend')} <span aria-hidden="true">*</span>
                  <span className="sr-only">(required — select at least one)</span>
                </span>
                <div
                  className="size-selector"
                  role="group"
                  aria-labelledby="apf-sizes-legend"
                >
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`size-btn ${formData.sizes.includes(size) ? 'selected' : ''}`}
                      onClick={() => handleSizeToggle(size)}
                      aria-pressed={formData.sizes.includes(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="form-group">
                <label htmlFor={fid('colorInput')}>
                  {t('admin.products.colors_label')} <span aria-hidden="true">*</span>
                  <span className="sr-only">(required — press Enter to add)</span>
                </label>
                <input
                  id={fid('colorInput')}
                  type="text"
                  placeholder={t('admin.products.color_placeholder')}
                  onKeyDown={handleColorAdd}
                  aria-describedby="apf-color-hint"
                />
                <span id="apf-color-hint" className="sr-only">
                  {t('admin.products.color_hint')}
                </span>
                <div className="tags-container" role="list" aria-label={t('admin.products.added_colors')}>
                  {formData.colors.map((color) => (
                    <span key={color} className="tag" role="listitem">
                      {color}
                      <button
                        type="button"
                        onClick={() => handleColorRemove(color)}
                        aria-label={t('admin.products.remove_color', { color })}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label htmlFor={fid('imageUrl')}>
                  {t('admin.products.image_url')} <span aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id={fid('imageUrl')}
                  type="url"
                  value={formData.images[0] || ''}
                  onChange={handleImageUrl}
                  placeholder={t('admin.products.image_placeholder')}
                  required
                  aria-required="true"
                />
                <small className="form-text" id="apf-img-hint">{t('admin.products.image_hint')}</small>
                {formData.images[0] && (
                  <div className="image-preview-single">
                    <img
                      src={formData.images[0]}
                      alt={t('admin.products.product_preview')}
                      onError={(e) => { e.target.src = 'https://picsum.photos/400/400?random=1'; }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={fid('material')}>{t('admin.products.material')}</label>
                <input
                  id={fid('material')}
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInput}
                  placeholder={t('admin.products.material_placeholder')}
                />
              </div>

              <div className="form-group">
                <label htmlFor={fid('careInstructions')}>{t('admin.products.care')}</label>
                <input
                  id={fid('careInstructions')}
                  type="text"
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleInput}
                  placeholder={t('admin.products.care_placeholder')}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInput}
                  />
                  <span>{t('admin.products.featured_check')}</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  {t('admin.products.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? t('admin.products.update') : t('admin.products.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
