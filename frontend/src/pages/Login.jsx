import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import './Auth.css';

/* ── Validation helpers (accept t for translations) ─── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateField = (name, value, t) => {
  switch (name) {
    case 'email':
      if (!value.trim()) return t('auth.validation.email_required');
      if (!EMAIL_RE.test(value)) return t('auth.validation.email_invalid');
      return '';
    case 'password':
      if (!value) return t('auth.validation.password_required');
      if (value.length < 6) return t('auth.validation.password_min');
      return '';
    default:
      return '';
  }
};

/* ── Component ───────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({ email: '', password: '' });
  const [touched, setTouched]   = useState({ email: false, password: false });
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = (name, value) => validateField(name, value, t);

  /* Live change — only validate if field was already touched */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
    setServerError('');
  };

  /* On blur — mark touched & validate */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  /* Submission */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email:    validate('email',    formData.email),
      password: validate('password', formData.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.values(newErrors).some(Boolean)) return;

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setServerError(err?.response?.data?.message || t('auth.validation.server_login_fallback'));
    }
  };

  const fieldState = (name) => {
    if (!touched[name] || !errors[name]) return '';
    return 'is-invalid';
  };

  return (
    <div className="auth-page">
      <div className="auth-container" role="main">
        <h2>{t('auth.welcome_back')}</h2>
        <p className="auth-subtitle">{t('auth.sign_in_subtitle')}</p>

        {serverError && (
          <div className="auth-error-banner" role="alert" aria-live="assertive">
            <FaExclamationCircle aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate aria-label={t('auth.login_form')}>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              {t('auth.email')} <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${fieldState('email')}`}
                placeholder="you@example.com"
                autoComplete="email"
                aria-required="true"
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                aria-invalid={!!(errors.email && touched.email)}
              />
            </div>
            {touched.email && errors.email && (
              <span className="field-error" id="email-error" role="alert">
                <FaExclamationCircle aria-hidden="true" /> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              {t('auth.password')} <span className="required" aria-hidden="true">*</span>
            </label>
            <div className="input-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${fieldState('password')}`}
                placeholder={t('auth.password')}
                autoComplete="current-password"
                aria-required="true"
                aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
                aria-invalid={!!(errors.password && touched.password)}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="field-error" id="password-error" role="alert">
                <FaExclamationCircle aria-hidden="true" /> {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? t('auth.signing_in') : t('auth.sign_in')}
          </button>
        </form>

        <p className="auth-link">
          {t('auth.no_account')}{' '}
          <Link to="/register">{t('auth.create_one')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

// Made with Bob
