import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  const handleBack = (): void => {
    // Go back if possible, otherwise navigate home
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-row justify-between">
      <button
        onClick={() => {
          navigate('/');
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors">
        <Home size={32} color="white" />
        {/* <span className="text-sm font-medium">
        {i18n.language === 'fa' ? 'Home' : 'خانه'}
      </span> */}
      </button>
      <button
        onClick={handleBack}
        aria-label="Back"
        className="flex items-center justify-center backdrop-blur-sm  text-white  p-2 transition">
        <ArrowLeft size={18} />
      </button>
    </div>
  );
};

export default BackButton;
