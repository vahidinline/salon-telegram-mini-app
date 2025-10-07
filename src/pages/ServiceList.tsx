import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Clock, DollarSign } from 'lucide-react';
import { Service } from '../types';
import { useBooking } from '../context/BookingContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { showTelegramAlert } from '../utils/telegram';
import { useStaggerAnimation } from '../hooks/useAnimations';
import { convertToPersianNumber } from '../utils/NumberFarsi';

const ServiceList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setService } = useBooking();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const salonId = import.meta.env.VITE_SALON_ID;

  useStaggerAnimation('.service-card', containerRef);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get(
          `/salons/651a6b2f8b7a5a1d223e4c90/services`
        );
        console.log('Fetched services:', response.data);
        setServices(response.data);
        setFilteredServices(response.data);
      } catch (error: any) {
        showTelegramAlert(error.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [salonId, t]);

  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchQuery, services]);

  const handleSelectService = (service: Service) => {
    setService(service);
    navigate('/employees');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pb-20 ">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 bg-transparent">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('selectService')}
          </h1>
          {/* <div className="relative">
            <Search
              className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}
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
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={16} />
                  <span>
                    {service.duration} {t('minutes')}
                  </span>
                </div>
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
    </div>
  );
};

export default ServiceList;
