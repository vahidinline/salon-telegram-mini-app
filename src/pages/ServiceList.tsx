import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Search } from 'lucide-react';
import { Service } from '../types';
import { useBooking } from '../context/BookingContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { showTelegramAlert } from '../utils/telegram';
import { useStaggerAnimation } from '../hooks/useAnimations';
import { convertToPersianNumber } from '../utils/NumberFarsi';
import ServiceFeaturesAccordion from '../components/Accrodion';

const ServiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setService } = useBooking();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // دریافت کد از state با هندل کردن حالت undefined
  const code = location.state?.code;

  useStaggerAnimation('.service-card', containerRef);

  // 1. دریافت سرویس‌ها
  useEffect(() => {
    if (!code) {
      navigate('/'); // اگر کدی نبود برگرد به صفحه اصلی
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await api.get(
          `/salons/651a6b2f8b7a5a1d223e4c90/services`
        );
        setServices(response.data);
      } catch (error: any) {
        showTelegramAlert(error.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [code, navigate, t]);

  // 2. فیلتر کردن بر اساس سرچ و کد دسته‌بندی
  useEffect(() => {
    if (!code) return;

    const filtered = services.filter((service) => {
      // اول بررسی میکنیم که آیا کد سرویس با کد صفحه یکی هست؟
      const matchesCode = service.code?.toLowerCase() === code.toLowerCase();

      // دوم بررسی سرچ کاربر
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCode && matchesSearch;
    });

    setFilteredServices(filtered);
  }, [searchQuery, services, code]);

  const handleSelectService = (service: Service) => {
    setService(service);

    if (service.subService && service.subService.length > 0) {
      navigate('/additionalservices', {
        state: {
          additionalService: service.subService,
        },
      });
    } else {
      navigate('/employees');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // کانتینر اصلی: ارتفاع فیکس و بدون اسکرول بادی
    <div className="flex flex-col h-[100dvh] bg-[#d6a78f] overflow-hidden">
      {/* هدر ثابت */}
      <div className="flex-none bg-[#d6a78f] shadow-sm z-10 w-full">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-base text-white mb-4">
            لطفا سرویس خود را از{' '}
            <span className="font-bold">"شاخه {code}"</span> انتخاب کنید.
          </h1>
          <div className="relative">
            <Search
              className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7f3d45] focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* لیست اسکرول‌شونده */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 w-full max-w-4xl mx-auto scrollbar-hide pb-8">
        {filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/80">
            <Search size={48} className="mb-2 opacity-50" />
            <p>{t('noResults')}</p>
          </div>
        ) : (
          filteredServices.map((service) => {
            const isVIP = service.serviceType?.toLowerCase() === 'vip';

            return (
              <div
                key={service._id}
                // کلاس‌های شرطی و ثابت ادغام شدند
                className={`service-card p-4 border rounded-xl transition shadow-sm relative overflow-hidden
                  ${
                    isVIP
                      ? 'bg-gradient-to-br from-gray-50 to-yellow-50/30 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }
                `}>
                {/* برچسب نوع سرویس */}
                <div className="flex items-center gap-1 mb-2">
                  {isVIP ? (
                    <>
                      <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-2 py-0.5 rounded-full">
                        VIP Service
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-semibold text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      BASIC Service
                    </span>
                  )}
                </div>

                <h3
                  className={`block font-bold text-lg mb-1 ${
                    isVIP ? 'text-yellow-800' : 'text-gray-800'
                  }`}>
                  {service.name}
                </h3>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <ServiceFeaturesAccordion service={service} />

                <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={16} />
                    <span>
                      {convertToPersianNumber(service.duration)} {t('minutes')}
                    </span>
                  </div>

                  <div className="font-bold">
                    <span className="text-[#7f3d45] text-lg">
                      {service.price != null
                        ? convertToPersianNumber(service.price.toLocaleString())
                        : '-'}
                    </span>
                    <span className="text-xs text-gray-500 mr-1">
                      {t('toman')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectService(service)}
                  className="w-full mt-4 bg-[#7f3d45] hover:bg-[#6d323a] active:scale-[0.98] transition-all rounded-lg h-11 shadow-md flex items-center justify-center gap-2">
                  <span className="text-white font-bold text-sm">
                    {t('selectService')}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ServiceList;
