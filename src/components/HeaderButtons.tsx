import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBigLeft, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeaderButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const handleBack = (): void => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const onRoot = location.pathname === '/';

  return (
    <div className="flex flex-row justify-end items-center w-full mt-2 gap-2">
      {!onRoot && (
        <button
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center p-2 text-gray-700">
          <ArrowBigLeft />
        </button>
      )}

      {onRoot && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 text-gray-700">
          <Home />
          {/* Optional text */}
          {/* <span className="text-sm font-medium">{i18n.language === 'fa' ? 'خانه' : 'Home'}</span> */}
        </button>
      )}
    </div>
  );
};

export default HeaderButtons;
