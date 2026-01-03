import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { TimeSlot } from '../types';
import { useBooking } from '../context/BookingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SlotCard from '../components/SlotCard';
import 'dayjs/locale/fa';
import api from '../utils/api';
import JalaliMonthlyCalendar from '../components/MonthlyCal';

dayjs.extend(jalaliday);

const CalendarSlots: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { bookingState, setDateTime } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);

  const isJalali = i18n.language === 'fa';

  useEffect(() => {
    if (!bookingState.service || !bookingState.employee) {
      navigate('/');
      return;
    }
  }, [bookingState, navigate]);

  useEffect(() => {
    if (selectedDate) {
      generateSlotsFrontend();
    }
  }, [selectedDate]);

  const handleContinue = () => {
    if (selectedSlot) {
      setDateTime(selectedDate, selectedSlot);
      navigate('/confirm');
    }
  };

  const generateSlotsFrontend = async () => {
    const employee = bookingState.employee;
    const service = bookingState.service;
    if (!employee || !service) return;

    setLoading(true);
    setSelectedSlot(null);

    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const response = await api.get(
        `/salons/651a6b2f8b7a5a1d223e4c90/employees/${employee._id}/availability`,
        {
          params: { employee: employee._id, date: dateStr },
        }
      );
      const bookedSlots = response.data;

      const dayName = dayjs(selectedDate).format('dddd').toLowerCase();
      const schedule = employee.workSchedule?.find(
        (d: any) => d.day.toLowerCase() === dayName
      );

      if (!schedule) {
        setSlots([]);
        setLoading(false);
        return;
      }

      const [startHour, startMinute] = schedule.startTime
        ? schedule.startTime.split(':').map(Number)
        : [9, 0];
      const [endHour, endMinute] = schedule.endTime
        ? schedule.endTime.split(':').map(Number)
        : [17, 0];
      const duration = service.duration || 30;

      let current = dayjs(selectedDate).hour(startHour).minute(startMinute);
      const end = dayjs(selectedDate).hour(endHour).minute(endMinute);

      const slotList: TimeSlot[] = [];
      while (
        current.add(duration, 'minute').isBefore(end) ||
        current.add(duration, 'minute').isSame(end)
      ) {
        const next = current.clone().add(duration, 'minute');
        const newSlot = { start: current.toDate(), end: next.toDate() };

        const isOccupied = bookedSlots.some((b: any) => {
          const bookingStart = dayjs(b.start);
          const bookingEnd = dayjs(b.end);
          return current.isBefore(bookingEnd) && next.isAfter(bookingStart);
        });

        if (!isOccupied) slotList.push(newSlot);

        current = next;
      }

      setSlots(slotList);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. کانتینر اصلی: ارتفاع ثابت برابر با ویوپورت و جلوگیری از اسکرول کلی صفحه
    <div className="flex flex-col h-[100dvh] bg-[#d6a78f] overflow-hidden">
      {/* 2. هدر: ارتفاع محتوا را می‌گیرد و ثابت است (flex-none) */}
      <div className="flex-none bg-[#d6a78f] shadow-sm z-10 w-full">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-md text-white mb-2">
            لطفا <span className="font-bold">" تاریخ و ساعت "</span> خود را
            انتخاب کنید.
          </h1>
          <div className="border-t border-[#7f3d45] my-2"></div>
          <div className="text-sm text-[#7f3d45] space-y-1">
            <p>
              {t('service')} انتخابی شما :{' '}
              <span className="font-medium">{bookingState.service?.name}</span>
            </p>
            <p>
              {t('employee')} انتخابی شما :{' '}
              <span className="font-medium">{bookingState.employee?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. محتوای وسط: فضای باقی‌مانده را پر می‌کند و فقط خودش اسکرول می‌شود (flex-1 overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-4xl mx-auto scrollbar-hide">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {t('selectDate')}
          </h2>
          <div className="pb-2">
            <JalaliMonthlyCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>

        <div className="pb-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            {t('availableSlots')}
          </h2>
          {loading ? (
            <LoadingSpinner />
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-3 text-gray-400"
                fill="none" // Changed to none for better visibility with stroke
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" // Using a clock icon instead
                />
              </svg>
              <p className="text-sm font-medium text-white text-center">
                زمان آزادی برای این روز وجود ندارد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pb-2">
              {slots.map((slot, index) => (
                <SlotCard
                  key={index}
                  slot={slot}
                  selected={selectedSlot === slot}
                  onSelect={() => setSelectedSlot(slot)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. فوتر (دکمه ادامه): همیشه پایین صفحه می‌چسبد (flex-none) */}
      {selectedSlot && (
        <div className="flex-none p-4 bg-[#d6a78f] border-t border-[#7f3d45]/20 w-full max-w-4xl mx-auto z-20">
          <button
            onClick={handleContinue}
            className="w-full bg-[#7f3d45] text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-[#6d323a] active:scale-[0.98] transition-all">
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarSlots;
