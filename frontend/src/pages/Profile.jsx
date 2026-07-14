import { useState, useEffect } from 'react';
import { FaUser, FaBox, FaHeart, FaLock, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, updatePassword, logout, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing,   setEditing]   = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', state: '', zipCode: '', country: '',
  });

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name:    user.name    || '',
        email:   user.email   || '',
        phone:   user.phone   || '',
        street:  user.address?.street  || '',
        city:    user.address?.city    || '',
        state:   user.address?.state   || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      await updateUser({
        name:  formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street:  formData.street,
          city:    formData.city,
          state:   formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });
      setEditing(false);
    } catch { /* toast handled by store */ } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwData.newPassword !== pwData.confirmNew) {
      setPwError(t('profile.pw_no_match'));
      return;
    }
    if (pwData.newPassword.length < 6) {
      setPwError(t('profile.pw_too_short'));
      return;
    }
    try {
      await updatePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      setPwData({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch { /* toast handled */ }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const TABS = [
    { key: 'profile',  label: t('profile.my_profile'),       icon: <FaUser /> },
    { key: 'orders',   label: t('profile.my_orders'),         icon: <FaBox /> },
    { key: 'wishlist', label: t('profile.my_wishlist'),       icon: <FaHeart /> },
    { key: 'password', label: t('profile.change_password'),   icon: <FaLock /> },
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar" aria-hidden="true">{initials}</div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-email">{user?.email}</div>
            </div>
            <nav className="profile-nav" aria-label={t('profile.profile_nav')}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`profile-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key === 'orders')   navigate('/orders');
                    if (tab.key === 'wishlist') navigate('/wishlist');
                  }}
                  aria-current={activeTab === tab.key ? 'page' : undefined}
                  aria-label={tab.label}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <button
                className="profile-nav-item"
                onClick={handleLogout}
                style={{ color: 'var(--danger)' }}
                aria-label={t('profile.logout_label')}
              >
                <FaSignOutAlt aria-hidden="true" /> {t('profile.logout')}
              </button>
            </nav>
          </aside>

          {/* Main */}
          <div className="profile-main">
            {/* Personal info */}
            {activeTab === 'profile' && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2>{t('profile.personal_info')}</h2>
                  <button className="profile-edit-btn" onClick={() => setEditing((v) => !v)}>
                    {editing ? t('profile.cancel') : t('profile.edit')}
                  </button>
                </div>
                <div className="profile-card-body">
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label htmlFor="pf-name">{t('profile.full_name')}</label>
                      {editing
                        ? <input id="pf-name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                        : <div className="profile-display-value">{formData.name || '—'}</div>}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pf-email">{t('profile.email')}</label>
                      {editing
                        ? <input id="pf-email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                        : <div className="profile-display-value">{formData.email || '—'}</div>}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pf-phone">{t('profile.phone')}</label>
                      {editing
                        ? <input id="pf-phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder={t('profile.phone_placeholder')} />
                        : <div className="profile-display-value">{formData.phone || '—'}</div>}
                    </div>
                  </div>
                </div>

                {/* Address section */}
                <div className="profile-card-header" style={{ borderTop: '1px solid var(--border)' }}>
                  <h2>{t('profile.delivery_address')}</h2>
                </div>
                <div className="profile-card-body">
                  <div className="profile-form-grid">
                    <div className="profile-form-group full-width">
                      <label htmlFor="pf-street">{t('profile.street')}</label>
                      {editing
                        ? <input id="pf-street" value={formData.street} onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))} />
                        : <div className="profile-display-value">{formData.street || '—'}</div>}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pf-city">{t('profile.city')}</label>
                      {editing
                        ? <input id="pf-city" value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} />
                        : <div className="profile-display-value">{formData.city || '—'}</div>}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pf-state">{t('profile.state')}</label>
                      {editing
                        ? <input id="pf-state" value={formData.state} onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))} />
                        : <div className="profile-display-value">{formData.state || '—'}</div>}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pf-zip">{t('profile.zip')}</label>
                      {editing
                        ? <input id="pf-zip" value={formData.zipCode} onChange={(e) => setFormData((p) => ({ ...p, zipCode: e.target.value }))} />
                        : <div className="profile-display-value">{formData.zipCode || '—'}</div>}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pf-country">{t('profile.country')}</label>
                      {editing
                        ? <input id="pf-country" value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} />
                        : <div className="profile-display-value">{formData.country || '—'}</div>}
                    </div>
                  </div>
                  {editing && (
                    <div className="profile-save-row">
                      <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saveLoading}>
                        {saveLoading ? t('profile.saving') : t('profile.save_changes')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Change password */}
            {activeTab === 'password' && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2>{t('profile.change_password')}</h2>
                </div>
                <div className="profile-card-body">
                  <form onSubmit={handlePasswordChange} noValidate style={{ maxWidth: '420px' }}>
                    <div className="profile-form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="pw-current">{t('profile.current_password')}</label>
                      <input
                        id="pw-current"
                        type="password"
                        value={pwData.currentPassword}
                        onChange={(e) => setPwData((p) => ({ ...p, currentPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="profile-form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="pw-new">{t('profile.new_password')}</label>
                      <input
                        id="pw-new"
                        type="password"
                        value={pwData.newPassword}
                        onChange={(e) => setPwData((p) => ({ ...p, newPassword: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="profile-form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="pw-confirm">{t('profile.confirm_new')}</label>
                      <input
                        id="pw-confirm"
                        type="password"
                        value={pwData.confirmNew}
                        onChange={(e) => { setPwData((p) => ({ ...p, confirmNew: e.target.value })); setPwError(''); }}
                        required
                      />
                    </div>
                    {pwError && (
                      <p
                        role="alert"
                        aria-live="assertive"
                        style={{ fontSize: 'var(--font-size-xs)', color: 'var(--danger)', marginBottom: '0.75rem' }}
                      >
                        {pwError}
                      </p>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? t('profile.updating') : t('profile.update_password')}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// Made with Bob
