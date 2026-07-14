import { useTranslation } from 'react-i18next';

const Users = () => {
  const { t } = useTranslation();
  return (
    <div className="container py-4">
      <h1>{t('admin.users.title')}</h1>
      <p>{t('admin.users.desc')}</p>
    </div>
  );
};

export default Users;

// Made with Bob
