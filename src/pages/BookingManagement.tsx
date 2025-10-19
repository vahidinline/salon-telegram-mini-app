import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { Calendar, Clock, User, XCircle } from 'lucide-react';
import { Booking, Service, Employee } from '../types';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TeleButton from '../components/TeleButton';
import { showTelegramAlert } from '../utils/telegram';
import { useStaggerAnimation } from '../hooks/useAnimations';
import { useTelegramStore } from '../store/useTelegramStore';
import { useLocation } from 'react-router-dom';
import CardNumberField from '../components/CardInfo';
import PaymentCountdown from '../components/PaymentCountdown';
import Card from '../assets/img/bank-melat.jpg';
import FileUpload from '../components/FileUpload';

dayjs.extend(jalaliday);

const BookingManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { bookingId } = location.state || {};
  const containerRef = useRef<HTMLDivElement>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [sowPaymentInfo, setShowPaymentInfo] = useState(true);
  const { user } = useTelegramStore();
  const isJalali = i18n.language === 'fa';

  const togglePaymentInfo = () => {
    setShowPaymentInfo(!sowPaymentInfo);
  };

  useStaggerAnimation('.booking-card', containerRef);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    if (!bookingId) {
      console.warn('⚠️ bookingId is missing');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching booking by ID:', bookingId);

      const response = await api.get(
        `/salons/651a6b2f8b7a5a1d223e4c90/bookings/${encodeURIComponent(
          bookingId
        )}`
      );

      console.log('✅ Response:', response.data);
      setBooking(response.data);
    } catch (error: any) {
      showTelegramAlert(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await api.patch(
        `/salons/68c806bf374b8c596edb208c/bookings/${bookingId}/cancel`,
        { reason: 'byUser' }
      );
      console.log('cancel result', res);
      showTelegramAlert('رزرو کنسل شد');
      fetchBooking();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'خطا در لغو رزرو';
      showTelegramAlert(msg);
    }
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

  const handleReceiptUploadComplete = async (fileUrl: string) => {
    if (!bookingId) {
      showTelegramAlert('شناسه رزرو موجود نیست');
      return;
    }

    setUploadingReceipt(true);
    try {
      const res = await api.patch(
        `salons/68c806bf374b8c596edb208c/bookings/${bookingId}/receipt`,
        { receiptUrl: fileUrl }
      );

      setBooking(res.data.booking || res.data);
      showTelegramAlert('رسید با موفقیت ارسال شد.');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'خطا در ثبت رسید';
      showTelegramAlert(msg);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const getCancelStatus = (status?: string) => {
    switch (status) {
      case 'byUser':
        return 'کنسل شده توسط شما';
      case 'bySalon':
        return 'کنسل شده توسط سالن';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className="text-center py-12 text-gray-500">{t('noBookings')}</div>
    );
  }

  const service = booking.service as Service;
  const employee = booking.employee as Employee;
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
  const normalizedStatus = statusLabels[booking.status] || booking.status;

  const cancelStatusLabels: Record<string, string> = {
    byUser: 'کنسل شده توسط شما',
    bySalon: 'کنسل شده توسط سالن',
    unPaid: 'پرداخت نشده',
    conflictingSchedule: 'برنامه زمانی متضاد',
  };

  const cancelStatus =
    cancelStatusLabels[booking.cancelationReason] || booking.cancelationReason;

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mt-15 text-gray-800">
            مدیریت رزرو
          </h1>
        </div>
      </div>

      <div ref={containerRef} className="max-w-4xl mx-auto p-4 space-y-3">
        <div className="booking-card bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {typeof service === 'object' ? service.name : 'سرویس انتخابی'}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                booking.status
              )}`}>
              {normalizedStatus} {cancelStatus && `- ${cancelStatus}`}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>
                {typeof employee === 'object' ? employee.name : 'کارمند'}
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

            {booking.paymentDeadline && (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <Clock size={16} />
                <span>
                  مهلت پرداخت: {formatTime(booking.paymentDeadline)} (
                  {formatDate(booking.paymentDeadline)})
                </span>
              </div>
            )}
          </div>

          <button onClick={togglePaymentInfo} className="text-sm text-blue-600">
            {sowPaymentInfo
              ? 'پنهان کردن اطلاعات پرداخت'
              : 'نمایش اطلاعات پرداخت'}
          </button>

          {sowPaymentInfo && (
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="shadow-sm border rounded-lg">
                  <img src={Card} alt="Bank card" className="rounded-lg" />
                </div>

                <div className="mt-4">
                  <CardNumberField />
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">نام صاحب کارت</span>
                    <span className="font-medium">مرجان</span>
                  </div>

                  {/* <div className="flex justify-between">
              <span className="text-gray-600">شماره تماس</span>
              <span className="font-medium">{booking.clientPhone}</span>
            </div> */}

                  <div className="flex justify-between">
                    <span className="text-gray-600">وضعیت رزرو</span>
                    <span
                      className={`font-medium ${
                        booking.status === 'pending'
                          ? 'text-blue-600'
                          : booking.status === 'review'
                          ? 'text-yellow-600'
                          : booking.status === 'confirmed'
                          ? 'text-green-600'
                          : booking.status === 'cancelled'
                          ? 'text-gray-500'
                          : booking.status === 'expired'
                          ? 'text-red-500'
                          : ''
                      }`}>
                      {normalizedStatus}
                    </span>
                  </div>

                  {/* <div className="flex justify-between">
              <span className="text-gray-600">تاریخ انقضای پرداخت</span>
              <span className="font-medium text-red-500">
                {new Date(booking.paymentDeadline).toLocaleString('fa-IR')}
              </span>
            </div> */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">
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
                </div>
              </div>

              {booking.receiptUrl && (
                <div className="mt-3">
                  <a
                    href={booking.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600">
                    مشاهده رسید ارسال‌شده
                  </a>
                </div>
              )}

              {booking.status === 'pending' && (
                <div className="mt-4">
                  <p className="text-sm text-red-500">
                    لطفا مبلغ را حواله کنید و رسید آن را آپلود کنید. پس از بررسی
                    رسید توسط تیم ما، رزرو شما تایید خواهد شد.
                  </p>

                  <FileUpload
                    onUploadComplete={handleReceiptUploadComplete}
                    label="آپلود رسید پرداخت"
                    maxSizeMB={10}
                    acceptedTypes={[
                      'image/jpeg',
                      'image/png',
                      'application/pdf',
                    ]}
                  />

                  {uploadingReceipt && (
                    <p className="text-sm text-gray-500 mt-2">
                      در حال ارسال رسید...
                    </p>
                  )}
                </div>
              )}

              {booking.status === 'review' && (
                <p className="text-sm text-yellow-600 mt-3">
                  رسید دریافت شد — در حال بررسی توسط تیم ما
                </p>
              )}

              {booking.status === 'confirmed' && (
                <p className="text-sm text-green-600 mt-3">
                  رزرو تایید شده است.
                </p>
              )}
            </div>
          )}
          <div className="flex gap-3">
            {isCancelable ? (
              <TeleButton
                disabled={booking.status === 'cancelled'}
                onClick={() => handleCancel(booking._id!)}
                variant="alert"
                className="w-full flex items-center justify-center gap-2">
                <XCircle size={18} />
                {booking.status === 'cancelled'
                  ? getCancelStatus(booking.cancelationReason)
                  : t('cancelBooking')}
              </TeleButton>
            ) : (
              <TeleButton
                onClick={() => handleCancel(booking._id!)}
                variant="danger"
                className="w-full flex items-center justify-center gap-2">
                <XCircle size={18} />
                لغو اضطراری
              </TeleButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
