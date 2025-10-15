import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import CardNumberField from '../components/CardInfo';
import Card from '../assets/img/bank-melat.jpg';
import api from '../utils/api';
import { showTelegramAlert } from '../utils/telegram';

function PaymentInfo() {
  const location = useLocation();
  const { bookingId } = location.state || {};

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Persian labels for booking statuses
  const statusLabels: Record<string, string> = {
    pending: 'در انتظار پرداخت',
    review: 'در حال بررسی',
    confirmed: 'تایید شده',
    cancelled: 'کنسل شده',
    expired: 'منقضی شده',
  };

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `salons/68c806bf374b8c596edb208c/bookings/${bookingId}`
        );
        setBooking(res.data);
      } catch (err) {
        console.error(err);
        showTelegramAlert('خطا در واکشی اطلاعات رزرو');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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
      showTelegramAlert(
        'رسید با موفقیت ارسال شد. رزرو برای بازبینی علامت‌گذاری شد.'
      );
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'خطا در ثبت رسید';
      showTelegramAlert(msg);
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (loading) return <p className="p-4">در حال بارگذاری اطلاعات...</p>;
  if (!booking) return <p className="p-4">اطلاعات رزرو یافت نشد.</p>;

  const normalizedStatus = statusLabels[booking.status] || booking.status;

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800">اطلاعات پرداخت</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              اطلاعات پرداخت رزرو
            </h2>
          </div>

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

            <div className="flex justify-between">
              <span className="text-gray-600">شماره تماس</span>
              <span className="font-medium">{booking.clientPhone}</span>
            </div>

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

            <div className="flex justify-between">
              <span className="text-gray-600">تاریخ انقضای پرداخت</span>
              <span className="font-medium text-red-500">
                {new Date(booking.paymentDeadline).toLocaleString('fa-IR')}
              </span>
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
              لطفا مبلغ را حواله کنید و رسید آن را آپلود کنید. سپس تیم ما رسید
              را بررسی می‌کند.
            </p>

            <FileUpload
              onUploadComplete={handleReceiptUploadComplete}
              label="آپلود رسید پرداخت"
              maxSizeMB={10}
              acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
            />

            {uploadingReceipt && (
              <p className="text-sm text-gray-500 mt-2">در حال ارسال رسید...</p>
            )}
          </div>
        )}

        {booking.status === 'review' && (
          <p className="text-sm text-yellow-600 mt-3">
            رسید دریافت شد — در حال بررسی توسط تیم ما
          </p>
        )}

        {booking.status === 'confirmed' && (
          <p className="text-sm text-green-600 mt-3">رزرو تایید شده است.</p>
        )}
      </div>
    </div>
  );
}

export default PaymentInfo;
