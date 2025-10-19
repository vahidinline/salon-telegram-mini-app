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
import { useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../store/useTelegramStore';
import PaymentCountdown from '../components/PaymentCountdown';

dayjs.extend(jalaliday);

const BookingHistory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useTelegramStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const userId = user?.id;
  const isJalali = i18n.language === 'fa';

  useStaggerAnimation('.booking-card', containerRef);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!userId) {
      console.warn('⚠️ userId is missing, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching bookings for user:', userId);

      const response = await api.get(
        `/salons/651a6b2f8b7a5a1d223e4c90/bookings?user=${encodeURIComponent(
          userId
        )}`
      );

      console.log('✅ Response:', response.data);
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
          await api.delete(`/salons/salonId/bookings/`);
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
          <h1 className="text-2xl font-bold mt-15 text-gray-800">
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
            const bookingStart = dayjs(booking.start);
            const canCancelTime = bookingStart.subtract(12, 'hour');
            const isCancelable = dayjs().isBefore(canCancelTime);

            const statusLabels: Record<string, string> = {
              pending: 'در انتظار پرداخت',
              review: 'در حال بررسی',
              confirmed: 'تایید شده',
              cancelled: 'کنسل شده',
              expired: 'منقضی شده',
            };
            const normalizedStatus =
              statusLabels[booking.status] || booking.status;

            return (
              <div
                key={booking._id}
                className="booking-card bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}>
                    {normalizedStatus}
                  </span>
                </div>
                {/* {booking?.user} */}

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>
                      {/* {typeof employee === 'object' ? employee.name : 'مریم'} */}
                      {employee}
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
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 text-sm">
                    زمان باقی‌مانده تا پرداخت
                  </span>
                  <PaymentCountdown
                    deadline={booking.paymentDeadline}
                    onExpire={() => {
                      console.log('Deadline reached!');
                      // Optionally: disable payment button, show modal, or redirect
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  {/* <TeleButton
                    onClick={() => handleCancelBooking(booking)}
                    variant="alert"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!isCancelable} // disable button if less than 12h
                  >
                    {' '}
                    {isCancelable ? (
                      <>
                        <XCircle size={18} />
                        {t('cancelBooking')}
                      </>
                    ) : (
                      'لغو رزرو امکان پذیر نیست'
                    )}
                  </TeleButton> */}

                  <TeleButton
                    onClick={() =>
                      navigate('/bookingmanagement', {
                        state: { bookingId: booking._id },
                      })
                    }
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2">
                    <XCircle size={18} />
                    {t('manageBooking')}
                  </TeleButton>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
