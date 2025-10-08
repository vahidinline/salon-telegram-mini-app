import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
    <button
      onClick={handleBack}
      aria-label="Back"
      className="flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full shadow-md p-2 transition">
      <ArrowLeft size={18} />
    </button>
  );
};

export default BackButton;
