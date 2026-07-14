import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3>Fashion Store</h3>
            <p>{t('footer.brand_desc')}</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>{t('footer.quick_links')}</h4>
            <ul>
              <li><Link to="/products">{t('footer.shop')}</Link></li>
              <li><Link to="/products?category=Men">{t('footer.men')}</Link></li>
              <li><Link to="/products?category=Women">{t('footer.women')}</Link></li>
              <li><Link to="/products?category=Kids">{t('footer.kids')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4>{t('footer.customer_service')}</h4>
            <ul>
              <li><Link to="/contact">{t('footer.contact_us')}</Link></li>
              <li><Link to="/shipping">{t('footer.shipping_info')}</Link></li>
              <li><Link to="/returns">{t('footer.returns')}</Link></li>
              <li><Link to="/faq">{t('footer.faq')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h4>{t('footer.newsletter')}</h4>
            <p>{t('footer.newsletter_desc')}</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="form-control"
                aria-label={t('footer.newsletter')}
              />
              <button type="submit" className="btn btn-primary">{t('footer.subscribe')}</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
          <div className="footer-links">
            <Link to="/privacy">{t('footer.privacy_policy')}</Link>
            <Link to="/terms">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// Made with Bob
