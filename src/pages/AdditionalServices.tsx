import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useBooking } from '../context/BookingContext';
import { useStaggerAnimation } from '../hooks/useAnimations';
import { convertToPersianNumber } from '../utils/NumberFarsi';
import TeleButton from '../components/TeleButton';

const AdditionalServiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAdditionalService } = useBooking();

  const containerRef = useRef<HTMLDivElement>(null);
  useStaggerAnimation('.service-card', containerRef);

  // 👇 get subService from previous screen
  const additionalService = location.state?.additionalService || [];
  console.log('subServices', additionalService);
  const handleSelectService = (service) => {
    setAdditionalService(service);
    navigate('/employees');
  };

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-b from-[#d6a78f] to-white">
      {/* Header */}
      <div className=" shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-xl font-bold text-gray-100 mb-1">
            انتخاب سرویس‌های اضافی
          </h1>
          <p className="text-sm text-gray-200">
            سرویس‌های تکمیلی مرتبط با انتخاب شما
          </p>
        </div>
      </div>

      {/* List */}
      <div ref={containerRef} className="max-w-4xl mx-auto p-4 space-y-4">
        {additionalService.length === 0 ? (
          <div className="text-center py-14 text-gray-500">
            {t('noResults')}
          </div>
        ) : (
          additionalService.map((item, index) => (
            <div
              key={index}
              className="
            service-card
            p-4 rounded-2xl border
            bg-white/90 backdrop-blur-lg shadow-[0_4px_15px_rgba(0,0,0,0.06)]
            transition-all duration-300
          ">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.name}
              </h3>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              <div>{item.description}</div>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Price */}
              {item.price && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">قیمت</span>
                  <span className="text-blue-600 font-bold text-base">
                    {convertToPersianNumber(item.price.toLocaleString())}{' '}
                    {t('toman')}
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSelectService(item)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition">
                  انتخاب سرویس
                </button>

                <button
                  onClick={() => console.log('رد کردن', item.name)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition">
                  رد کردن
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          <TeleButton onClick={() => navigate('/employees')} className="w-full">
            {t('skip')}
          </TeleButton>
        </div>
      </div>
    </div>
  );
};

export default AdditionalServiceList;
