import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaExclamationCircle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import './Auth.css';

/* ── Validation helpers (accept t for translations) ─── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateField = (name, value, formData, t) => {
  switch (name) {
    case 'name':
      if (!value.trim()) return t('auth.validation.name_required');
      if (value.trim().length < 2) return t('auth.validation.name_min');
      return '';
    case 'email':
      if (!value.trim()) return t('auth.validation.email_required');
      if (!EMAIL_RE.test(value)) return t('auth.validation.email_invalid');
      return '';
    case 'password':
      if (!value) return t('auth.validation.password_required');
      if (value.length < 6) return t('auth.validation.password_min');
      return '';
    case 'confirmPassword':
      if (!value) return t('auth.validation.passwords_no_match');
      if (value !== formData.password) return t('auth.validation.passwords_no_match');
      return '';
    default:
      return '';
  }
};

/* ── Component ───────────────────────────────────────── */
const FIELDS = ['name', 'email', 'password', 'confirmPassword'];

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors,   setErrors]   = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [touched,  setTouched]  = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [serverError, setServerError] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);

  const validate = (name, value, data = formData) => validateField(name, value, data, t);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === 'name' || name === 'email') {
      if (touched[name]) {
        setErrors(prev => ({ ...prev, [name]: validate(name, value, updated) }));
      }
    }
    if (name === 'confirmPassword' && touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validate('confirmPassword', value, updated) }));
    }
    if (name === 'password' && touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validate('confirmPassword', updated.confirmPassword, updated) }));
    }

    setServerError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTouched = Object.fromEntries(FIELDS.map(f => [f, true]));
    const newErrors  = Object.fromEntries(FIELDS.map(f => [f, validate(f, formData[f])]));
    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      navigate('/');
    } catch (err) {
      setServerError(err?.response?.data?.message || t('auth.validation.server_register_fallback'));
    }
  };

  const fieldState = (name) => {
    if (!touched[name] || !errors[name]) return '';
    return 'is-invalid';
  };

  return (
    <div className="auth-page">
      <div className="auth-container" role="main">
        <h2>{t('auth.create_account')}</h2>
        <p className="auth-subtitle">{t('auth.register_subtitle')}</p>

        {serverError && (
          <div className="auth-error-banner" role="alert" aria-live="assertive">
            <FaExclamationCircle aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate aria-label={t('auth.registration_form')}>

          {/* Full name */}
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">
              {t('auth.full_name')} <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrapper">
              <FaUser className="input-icon" aria-hidden="true" />
              <input
                id="reg-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${fieldState('name')}`}
                placeholder="Jane Doe"
                autoComplete="name"
                aria-required="true"
                aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                aria-invalid={!!(errors.name && touched.name)}
              />
            </div>
            {touched.name && errors.name && (
              <span className="field-error" id="name-error" role="alert">
                <FaExclamationCircle aria-hidden="true" /> {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              {t('auth.email')} <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" aria-hidden="true" />
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${fieldState('email')}`}
                placeholder="you@example.com"
                autoComplete="email"
                aria-required="true"
                aria-describedby={errors.email && touched.email ? 'reg-email-error' : undefined}
                aria-invalid={!!(errors.email && touched.email)}
              />
            </div>
            {touched.email && errors.email && (
              <span className="field-error" id="reg-email-error" role="alert">
                <FaExclamationCircle aria-hidden="true" /> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              {t('auth.password')} <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${fieldState('password')}`}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={errors.password && touched.password ? 'reg-password-error' : undefined}
                aria-invalid={!!(errors.password && touched.password)}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? t('auth.hide_password') : t('auth.show_password')}
              >
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {touched.password && errors.password && (
              <span className="field-error" id="reg-password-error" role="alert">
                <FaExclamationCircle aria-hidden="true" /> {errors.password}
              </span>
            )}
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">
              {t('auth.confirm_password')} <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input
                id="reg-confirm"
                type={showCPw ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${fieldState('confirmPassword')}`}
                placeholder="Repeat your password"
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={errors.confirmPassword && touched.confirmPassword ? 'confirm-error' : undefined}
                aria-invalid={!!(errors.confirmPassword && touched.confirmPassword)}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowCPw(v => !v)}
                aria-label={showCPw ? t('auth.hide_password') : t('auth.show_password')}
              >
                {showCPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="field-error" id="confirm-error" role="alert">
                <FaExclamationCircle aria-hidden="true" /> {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? t('auth.creating') : t('auth.create_account')}
          </button>
        </form>

        <p className="auth-link">
          {t('auth.already_account')}{' '}
          <Link to="/login">{t('auth.sign_in_here')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

// Made with Bob
