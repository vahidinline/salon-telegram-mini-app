import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Employee } from '../types';
import { useBooking } from '../context/BookingContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TeleButton from '../components/TeleButton';
import { showTelegramAlert } from '../utils/telegram';
import { useStaggerAnimation } from '../hooks/useAnimations';

const EmployeeSelect: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookingState, setEmployee } = useBooking();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const salonId = '651a6b2f8b7a5a1d223e4c90';

  useStaggerAnimation('.employee-card', containerRef);

  useEffect(() => {
    console.log('Selected service:', bookingState.service);
    if (!bookingState.service) {
      navigate('/services');
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = await api.get(`/salons/${salonId}/employees`, {
          params: { service: bookingState.service?._id },
        });
        setEmployees(response.data);
      } catch (error: any) {
        showTelegramAlert(error.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [salonId, bookingState.service, navigate, t]);

  const handleSelectEmployee = (employee: Employee) => {
    setEmployee(employee);
    navigate('/calendar');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('selectEmployee')}
          </h1>
          <p className="text-sm text-gray-600">
            {t('service')}:{' '}
            <span className="font-medium">{bookingState.service?.name}</span>
          </p>
        </div>
      </div>

      <div ref={containerRef} className="max-w-4xl mx-auto p-4 space-y-3">
        {employees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('noResults')}
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee._id}
              className="employee-card bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {employee.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} />
                      <span>
                        {t('workDays')}: {employee.workDays.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        {t('workHours')}: {employee.startTime} -{' '}
                        {employee.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <TeleButton
                onClick={() => handleSelectEmployee(employee)}
                className="w-full">
                {t('selectEmployee')}
              </TeleButton>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeSelect;
