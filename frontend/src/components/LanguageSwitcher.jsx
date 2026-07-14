import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'de', label: 'Deutsch' },
];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || 'en';

  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      className="lang-select"
      value={LANGUAGES.find((l) => current.startsWith(l.code))?.code ?? 'en'}
      onChange={handleChange}
      aria-label={t('lang.label', 'Language')}
      title={t('lang.select', 'Select language')}
    >
      {LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
