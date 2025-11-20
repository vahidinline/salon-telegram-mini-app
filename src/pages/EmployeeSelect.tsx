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

  // Persian day translation map
  const dayMap: Record<string, string> = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنجشنبه',
    friday: 'جمعه',
  };

  useEffect(() => {
    if (!bookingState.service) {
      navigate('/');
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = await api.get(
          `/salons/${salonId}/employees/${bookingState.service?._id}`,
          {
            params: { service: bookingState.service?._id },
          }
        );
        console.log('Fetched employees:', response.data);
        setEmployees(response.data);
      } catch (error: any) {
        console.error(error);
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
    <div className="min-h-screen pb-20">
      <div className="bg-[#d6a78f] shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            {t('selectEmployee')}
          </h1>
          <p className="text-sm text-gray-200">
            {t('service')}:{' '}
            <span className="font-medium">{bookingState.service?.name}</span>
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="max-w-4xl bg-[#d6a78f] mx-auto p-4 space-y-3">
        {employees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('noResults')}
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee._id}
              className="employee-card bg-[#fffffa] rounded-lg shadow-sm p-4">
              <div className="flex  items-start gap-4 mb-4">
                <div className="flex flex-col">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-full h-full bg-gray-300 rounded-xl object-cover"
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <h3 className="text-md text-center mt-2 font-semibold text-gray-800">
                    {employee.name}
                  </h3>
                </div>
                <div className="flex-1">
                  {/* ✅ Display work schedule dynamically */}
                  {/* <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {employee.workSchedule &&
                    employee.workSchedule.length > 0 ? (
                      employee.workSchedule.map((dayItem, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CalendarIcon size={16} />
                          <span>{dayMap[dayItem.day] || dayItem.day}</span>
                          <Clock size={16} className="ml-1" />
                          <span>
                            {dayItem.startTime || '--:--'} -{' '}
                            {dayItem.endTime || '--:--'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">
                        {t('noScheduleAvailable')}
                      </span>
                    )}
                  </div> */}
                  <div className="mt-4 flex justify-end w-full">
                    <button
                      onClick={() => handleSelectEmployee(employee)}
                      className=" text-md bg-[#8d98d6] hover:bg-[#c5947e] text-white  py-2 px-4 rounded-lg shadow-sm">
                      {t('selectEmployee')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeSelect;
