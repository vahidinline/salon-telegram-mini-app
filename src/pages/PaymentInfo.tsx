import React from 'react';
import { useLocation } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import CardNumberField from '../components/CardInfo';
import Card from '../assets/img/bank-melat.jpg';
import { convertToPersianNumber } from '../utils/NumberFarsi';

function PaymentInfo() {
  const location = useLocation();
  const { service, employee } = location.state || {};

  if (!service || !employee)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        در حال بارگذاری...
      </div>
    );

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
              <span className="text-gray-600">مبلغ قابل پرداخت</span>
              <span className="font-medium text-blue-600"></span>
            </div>

            <div className="flex flex-col text-sm text-gray-700 mt-2">
              <p>
                رزرو وقت <strong>{service.name}</strong> با{' '}
                <strong>{employee.name}</strong> برای <strong>{'date'}</strong>{' '}
                انجام شد.
              </p>
            </div>
          </div>
        </div>

        <FileUpload />
      </div>
    </div>
  );
}

export default PaymentInfo;
