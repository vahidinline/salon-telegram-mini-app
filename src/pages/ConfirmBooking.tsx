import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import PhoneOTP from '../components/PhoneOTP';
import TeleButton from '../components/TeleButton';
import api from '../utils/api';
import { getTelegramUser, showTelegramAlert } from '../utils/telegram';
import gsap from 'gsap';

dayjs.extend(jalaliday);

const ConfirmBooking: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { bookingState, resetBooking } = useBooking();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const telegramUser = getTelegramUser();
  const salonId = import.meta.env.VITE_SALON_ID;
  const isJalali = i18n.language === 'fa';

  useEffect(() => {
    if (
      !bookingState.service ||
      !bookingState.employee ||
      !bookingState.date ||
      !bookingState.slot
    ) {
      navigate('/services');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, [bookingState, navigate]);

  useEffect(() => {
    if (showSuccess && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );

      const confetti = successRef.current.querySelectorAll('.confetti');
      gsap.fromTo(
        confetti,
        { y: 0, opacity: 1, rotation: 0 },
        {
          y: -200,
          opacity: 0,
          rotation: 360,
          duration: 1.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [showSuccess]);

  const handleVerified = () => {
    setIsAuthenticated(true);
  };

  const handleConfirm = async () => {
    if (!bookingState.slot) return;

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      await api.post('/book', {
        salon: salonId,
        employee: bookingState.employee?._id,
        service: bookingState.service?._id,
        start: bookingState.slot.start,
        end: bookingState.slot.end,
        user: userId,
        telegramUserId: telegramUser?.id,
      });

      await api.post('/notifications', {
        type: 'booking_created',
        userId,
        bookingDetails: {
          service: bookingState.service?.name,
          employee: bookingState.employee?.name,
          date: formatDate(bookingState.date!),
          time: formatTime(bookingState.slot.start),
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        resetBooking();
        navigate('/bookings');
      }, 3000);
    } catch (error: any) {
      showTelegramAlert(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    if (isJalali) {
      return dayjs(date).calendar('jalali').format('DD MMMM YYYY');
    }
    return dayjs(date).format('DD MMMM YYYY');
  };

  const formatTime = (datetime: string) => {
    return dayjs(datetime).format('HH:mm');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center  p-6">
        <div ref={successRef} className="relative text-center">
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '50%',
                }}
              />
            ))}
          </div>
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t('success')}
          </h2>
          <p className="text-lg text-gray-600">{t('bookingConfirmed')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {t('confirmBooking')}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('summary')}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('service')}:</span>
              <span className="font-medium">{bookingState.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('employee')}:</span>
              <span className="font-medium">{bookingState.employee?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('date')}:</span>
              <span className="font-medium">
                {formatDate(bookingState.date!)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('time')}:</span>
              <span className="font-medium">
                {formatTime(bookingState.slot!.start)} -{' '}
                {formatTime(bookingState.slot!.end)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('duration')}:</span>
              <span className="font-medium">
                {bookingState.service?.duration} {t('minutes')}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t">
              <span className="text-gray-800 font-semibold">{t('price')}:</span>
              <span className="text-blue-600 font-bold">
                {bookingState.service?.price.toLocaleString()} {t('toman')}
              </span>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('phone')}
            </h2>
            <PhoneOTP
              onVerified={handleVerified}
              telegramUserId={telegramUser?.id}
            />
          </div>
        ) : (
          <TeleButton
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4">
            {loading ? t('loading') : t('confirm')}
          </TeleButton>
        )}
      </div>
    </div>
  );
};

export default ConfirmBooking;
