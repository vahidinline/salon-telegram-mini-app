import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { ArrowLeftRight, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import PhoneOTP from '../components/PhoneOTP';
import api from '../utils/api';
import { getTelegramUser, showTelegramAlert } from '../utils/telegram';
import gsap from 'gsap';
import { convertToPersianNumber } from '../utils/NumberFarsi';
import { useTelegramStore } from '../store/useTelegramStore';
import JalaliCalendar from '../components/JalaliCalendar';

dayjs.extend(jalaliday);

const ConfirmBooking: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { bookingState, resetBooking } = useBooking();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const [dob, setDob] = useState('');
  // const telegramUser = getTelegramUser();
  const { user } = useTelegramStore();
  const salonId = import.meta.env.VITE_SALON_ID;
  const isJalali = i18n.language === 'fa';
  const telegramUser = JSON.parse(localStorage.getItem('telegramUser') || '{}');
  const userName = telegramUser?.first_name || 'Guest';
  const photoUrl = telegramUser?.photo_url || '';
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  console.log('telegramUser', telegramUser);
  let gregorianDob = null;
  if (dob) {
    gregorianDob = dayjs(dob, 'YYYY/MM/DD')
      .calendar('jalali')
      .calendar('gregory')
      .format('YYYY-MM-DD');
  }

  // ✅ Redirect if required data is missing
  useEffect(() => {
    if (
      !bookingState.service ||
      !bookingState.employee ||
      !bookingState.date ||
      !bookingState.slot
    ) {
      navigate('/');
      return;
    }
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
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

  const handleVerified = () => setIsAuthenticated(true);

  const handleConfirm = async () => {
    if (isGift && !recipientName.trim()) {
      showTelegramAlert('لطفا نام را وارد کنید');
      setLoading(false);
      return;
    }

    if (!bookingState.slot || !bookingState.service || !bookingState.employee)
      return;

    setLoading(true);
    try {
      // Send booking request
      const response = await api.post(`/salons/${salonId}/bookings`, {
        salon: salonId,
        employee: bookingState.employee._id,
        service: bookingState.service._id,
        additionalService: bookingState.additionalService,
        start: bookingState.slot.start,
        end: bookingState.slot.end,
        user: telegramUser.id,
        telegramUsername: telegramUser.username,
        clientName: user?.username,
        clientPhone: localStorage.getItem('phoneNumber') || '',
        orderType: isGift ? 'gift' : 'self',
        recipientName: isGift ? recipientName : undefined,
        dob: gregorianDob,
      });

      const bookingId = response.data.booking._id;

      // Navigate and pass the booking ID in state
      navigate('/paymentinfo', {
        state: {
          service: bookingState.service,
          additionalService: bookingState.additionalService,
          employee: bookingState.employee,
          date: bookingState.date,
          slot: bookingState.slot,
          bookingId,
        },
      });

      setShowSuccess(true);

      // Optional: reset booking after a delay
      setTimeout(() => {
        resetBooking();
      }, 3000);
    } catch (error: any) {
      showTelegramAlert(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    isJalali
      ? dayjs(date).calendar('jalali').format('DD MMMM YYYY')
      : dayjs(date).format('DD MMMM YYYY');

  const formatTime = (datetime?: string) =>
    datetime ? dayjs(datetime).format('HH:mm') : '';
  const formatJalaliDate = (date: string | Date) => {
    const jalaliDate = dayjs(date).calendar('jalali');

    const persianMonths = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];

    const day = convertToPersianNumber(jalaliDate.date());
    const month = persianMonths[jalaliDate.month()];
    const year = convertToPersianNumber(jalaliDate.year());

    return `${day} ${month} ${year}`;
  };

  // ✅ Guard clause to prevent null render crash
  if (
    !bookingState.slot ||
    !bookingState.date ||
    !bookingState.service ||
    !bookingState.employee
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t('loading')}...
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#d6a78f] flex items-center justify-center p-6">
        <div ref={successRef} className="relative text-center">
          {telegramUser.username}
          {telegramUser.id}
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
          <div className="bg-[#d6a78f] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
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
    <div className="min-h-screen bg-[#d6a78f] pb-28 ">
      {/* Header */}
      <div className=" shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-base  text-gray-100">
            لطفا <span className="font-bold">"جزئیات رزرو "</span> خود را تایید
            کنید.
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#7f3d45]">
            {t('summary')}
          </h2>

          {/* Employee & User */}
          <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-gray-50">
            <div className="flex flex-col items-center">
              <img
                src={bookingState.employee.avatar}
                alt={bookingState.employee.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
              <span className="font-medium mt-1">
                {bookingState.employee.name}
              </span>
            </div>
            <ArrowLeftRight size={32} className="mx-auto text-gray-400" />
            <div className="flex flex-col items-center">
              <img
                src={photoUrl || ''}
                alt={userName}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
              <span className="font-medium mt-1">{userName}</span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t('service')}:</span>
              <span className="font-medium">{bookingState.service.name}</span>
            </div>
            {bookingState.additionalService && (
              <div className="flex justify-between gap-2 text-gray-600">
                <span>{t('additionalServices')}:</span>
                <span
                  dir="rtl"
                  className="font-medium text-xs text-right justify-center underline underline-offset-4">
                  {bookingState.additionalService.name}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>{t('date')}:</span>
              <span className="font-medium">
                {formatJalaliDate(bookingState.date)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('time')}:</span>
              <span className="font-medium">
                {convertToPersianNumber(formatTime(bookingState.slot.start))} -{' '}
                {convertToPersianNumber(formatTime(bookingState.slot.end))}
              </span>
            </div>

            {/* Prices */}
            <div className="pt-3 border-t flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-800">{t('price')}:</span>
              <span className="font-bold text-[#7f3d45]">
                {convertToPersianNumber(bookingState.service.price)}{' '}
                {t('toman')}
              </span>
            </div>

            {bookingState.additionalService && (
              <>
                <div className="pt-2 flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-800">
                    {t('additionalPrice')}:
                  </span>
                  <span className="font-bold text-blue-600">
                    {convertToPersianNumber(
                      bookingState.additionalService.price
                    )}{' '}
                    {t('toman')}
                  </span>
                </div>
                <div className="pt-2 flex justify-between items-center text-lg border-t">
                  <span className="font-semibold text-gray-800">
                    {t('totalPrice')}:
                  </span>
                  <span className="font-bold text-blue-600">
                    {convertToPersianNumber(
                      bookingState.service.price +
                        bookingState.additionalService.price
                    )}{' '}
                    {t('toman')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Type Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {/* <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {t('orderType')}
          </h2> */}
          <div className="flex flex-col  gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 text-xs">
              <input
                type="radio"
                name="orderType"
                checked={!isGift}
                onChange={() => setIsGift(false)}
                className="accent-[#7f3d45] w-5 h-5"
              />
              این وقت رو برای خودم گرفتم.
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-gray-700 text-xs">
              <input
                type="radio"
                name="orderType"
                checked={isGift}
                onChange={() => setIsGift(true)}
                className="accent-[#7f3d45] w-5 h-5"
              />
              این وقت رو برای شخص دیگه ای گرفتم.
            </label>
          </div>

          {isGift && (
            <div className="mt-3">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="لطفا نام شخص را وارد کنید"
                className="w-full border rounded-lg p-3 text-[#7f3d45] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-sm text-red-500 mt-1">
                هزینه سفارشات هدیه باید کامل پرداخت شود تا رزرو تکمیل شود
              </p>
            </div>
          )}
          <JalaliCalendar
            value={dob}
            onChange={setDob}
            label="لطفا تاریخ تولد خود را وارد کنید"
          />
        </div>

        {/* Authentication / Confirm Button */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-[#7f3d45] mb-4">
              لطفا شماره موبایل خود را وارد کنید
            </h2>
            <PhoneOTP
              onVerified={handleVerified}
              telegramUserId={telegramUser?.id}
            />
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#7f3d45]  text-white font-semibold hover:bg-[#7f3d45] transition">
            {loading ? t('loading') : t('confirm')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConfirmBooking;
