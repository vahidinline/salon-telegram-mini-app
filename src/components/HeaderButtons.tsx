import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBigLeft, History, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TeleButton from './TeleButton';

const HeaderButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const handleBack = (): void => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const onRoot = location.pathname === '/';

  return (
    <div className="flex flex-row  justify-end items-center w-full mt-2 gap-2">
      {!onRoot && (
        <button
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center p-2 text-gray-700">
          <ArrowBigLeft color="white" />
        </button>
      )}

      {onRoot && (
        <div className="flex flex-row items-center justify-between w-full p-2 ">
          {/* Left Button */}
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fffffa] text-[#7f3d45] hover:bg-gray-200 text-sm  font-bold transition">
            {t('bookingHistory')}
          </button>

          {/* Right Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[] text-gray-700 hover:bg-gray-200 transition">
            <Home className="w-5 h-5" color="white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderButtons;
