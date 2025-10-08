import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={() => {
        navigate('/');
      }}
      // className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      title={t('chooseLang')}>
      <Home size={32} color="white" />
      {/* <span className="text-sm font-medium">
        {i18n.language === 'fa' ? 'Home' : 'خانه'}
      </span> */}
    </button>
  );
};

export default LanguageSwitcher;
