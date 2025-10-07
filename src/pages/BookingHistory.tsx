import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { Calendar, Clock, User, XCircle } from 'lucide-react';
import { Booking, Service, Employee } from '../types';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TeleButton from '../components/TeleButton';
import { showTelegramAlert, showTelegramConfirm } from '../utils/telegram';
import { useStaggerAnimation } from '../hooks/useAnimations';

dayjs.extend(jalaliday);

const BookingHistory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('userId');
  const isJalali = i18n.language === 'fa';

  useStaggerAnimation('.booking-card', containerRef);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/bookings`, {
        params: { user: userId },
      });
      setBookings(response.data);
    } catch (error: any) {
      showTelegramAlert(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    showTelegramConfirm(t('confirmCancel'), async (confirmed) => {
      if (confirmed && booking._id) {
        try {
          await api.delete(`/bookings/${booking._id}`);
          showTelegramAlert(t('bookingCancelled'));
          fetchBookings();
        } catch (error: any) {
          showTelegramAlert(error.response?.data?.message || t('error'));
        }
      }
    });
  };

  const formatDate = (date: string) => {
    if (isJalali) {
      return dayjs(date).calendar('jalali').format('DD MMMM YYYY');
    }
    return dayjs(date).format('DD MMMM YYYY');
  };

  const formatTime = (datetime: string) => {
    return dayjs(datetime).format('HH:mm');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen  pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {t('bookingHistory')}
          </h1>
        </div>
      </div>

      <div ref={containerRef} className="max-w-4xl mx-auto p-4 space-y-3">
        {!userId ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t('enterPhone')}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('noBookings')}
          </div>
        ) : (
          bookings.map((booking) => {
            const service = booking.service as Service;
            const employee = booking.employee as Employee;
            const canCancel =
              booking.status === 'pending' || booking.status === 'confirmed';

            return (
              <div
                key={booking._id}
                className="booking-card bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {typeof service === 'object' ? service.name : 'Service'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}>
                    {t(booking.status || 'pending')}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>
                      {typeof employee === 'object'
                        ? employee.name
                        : 'Employee'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(booking.start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>
                      {formatTime(booking.start)} - {formatTime(booking.end)}
                    </span>
                  </div>
                </div>

                {canCancel && (
                  <TeleButton
                    onClick={() => handleCancelBooking(booking)}
                    variant="danger"
                    className="w-full flex items-center justify-center gap-2">
                    <XCircle size={18} />
                    {t('cancelBooking')}
                  </TeleButton>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
