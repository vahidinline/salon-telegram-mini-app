import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Service } from '../types';
import { useBooking } from '../context/BookingContext';

import { useStaggerAnimation } from '../hooks/useAnimations';
import { convertToPersianNumber } from '../utils/NumberFarsi';
import TeleButton from '../components/TeleButton';

const AdditionalServiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAdditionalService } = useBooking();

  const [filteredServices, setFilteredServices] = useState<Service[]>([
    {
      _id: '1',
      name: 'ترمیم ناخن شکسته',
      description:
        'به ازای هر ناخن شکسته200/000 تومان به فاکتور شما اضافه می شود.',
      price: 200000,
    },
    {
      _id: '2',
      name: 'خدمات کف سابی',
      description: 'خدمت کف سابی، 200.000 به فاکتور شما اضافه می کند.',
      price: 200000,
    },
    {
      _id: '3',
      name: 'بلند کردن قد ناخن',
      description:
        'به ازای بلند کردن قد ناحن 300000 تا 600000 تومان به فاکتور شما اضافه می کند.',
      price: 300000,
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  useStaggerAnimation('.service-card', containerRef);

  const handleSelectService = (service: Service) => {
    setAdditionalService(service);
    navigate('/employees');
  };

  return (
    <div className="min-h-screen pb-20 ">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 bg-transparent">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            انتخاب سرویس های اضافی
          </h1>
        </div>
      </div>

      <div ref={containerRef} className="max-w-4xl mx-auto p-4 space-y-3">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('noResults')}
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service._id}
              onClick={() => handleSelectService(service)}
              className=" service-card bg-white  rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {service.name}
              </h3>
              {service.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {service.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-blue-600 font-medium">
                  <span>
                    <span>
                      {service.price != null
                        ? convertToPersianNumber(
                            service.price.toLocaleString()
                          ) +
                          ' ' +
                          t('toman')
                        : '-'}{' '}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
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
