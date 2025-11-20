import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { TimeSlot } from '../types';
import { useBooking } from '../context/BookingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SlotCard from '../components/SlotCard';
import TeleButton from '../components/TeleButton';
import 'dayjs/locale/fa';
import { convertToPersianNumber } from '../utils/NumberFarsi';
import api from '../utils/api';

dayjs.extend(jalaliday);

const CalendarSlots: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { bookingState, setDateTime } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<Date[]>([]);
  const isJalali = i18n.language === 'fa';
  console.log(
    'Booking State:',
    bookingState,
    selectedDate,
    slots,
    selectedSlot
  );
  useEffect(() => {
    if (!bookingState.service || !bookingState.employee) {
      navigate('/services');
      return;
    }
    generateCalendar();
  }, [bookingState, navigate]);

  useEffect(() => {
    if (selectedDate) {
      generateSlotsFrontend();
    }
  }, [selectedDate]);

  const generateCalendar = () => {
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      dates.push(dayjs().add(i, 'day').toDate());
    }
    setCalendar(dates);
  };

  // const generateSlotsFrontend = () => {
  //   const employee = bookingState.employee;
  //   const service = bookingState.service;

  //   if (!employee || !service) return;

  //   setLoading(true);
  //   setSelectedSlot(null);

  //   const dayName = dayjs(selectedDate).format('dddd').toLowerCase();

  //   // ✅ Find today's schedule from workSchedule
  //   const schedule = employee.workSchedule?.find(
  //     (d: any) => d.day.toLowerCase() === dayName
  //   );

  //   if (!schedule) {
  //     setSlots([]);
  //     setLoading(false);
  //     return;
  //   }

  //   const [startHour, startMinute] = schedule.startTime
  //     ? schedule.startTime.split(':').map(Number)
  //     : [9, 0];
  //   const [endHour, endMinute] = schedule.endTime
  //     ? schedule.endTime.split(':').map(Number)
  //     : [17, 0];

  //   let current = dayjs(selectedDate).hour(startHour).minute(startMinute);
  //   const end = dayjs(selectedDate).hour(endHour).minute(endMinute);
  //   const duration = service.duration || 30;

  //   const slotList: TimeSlot[] = [];
  //   while (
  //     current.add(duration, 'minute').isBefore(end) ||
  //     current.add(duration, 'minute').isSame(end)
  //   ) {
  //     const next = current.clone().add(duration, 'minute');
  //     slotList.push({ start: current.toDate(), end: next.toDate() });
  //     current = next;
  //   }

  //   setSlots(slotList);
  //   setLoading(false);
  // };

  const handleContinue = () => {
    if (selectedSlot) {
      setDateTime(selectedDate, selectedSlot);
      navigate('/confirm');
    }
  };

  const formatDate = (date: Date) => {
    return isJalali
      ? dayjs(date).calendar('jalali').locale('fa').format('DDDD MMMM YYYY')
      : dayjs(date).format('DDDD MMMM YYYY');
  };

  const formatDayName = (date: Date) => {
    return isJalali
      ? dayjs(date).calendar('jalali').locale('fa').format('dddd')
      : dayjs(date).format('dddd');
  };

  const generateSlotsFrontend = async () => {
    const employee = bookingState.employee;
    const service = bookingState.service;
    if (!employee || !service) return;

    setLoading(true);
    setSelectedSlot(null);

    try {
      // 1️⃣ Fetch booked slots for this date
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');

      console.log('Sending to backend:', {
        employee: employee._id,
        dateStr,
      });
      const response = await api.get(
        `/salons/651a6b2f8b7a5a1d223e4c90/employees/${employee._id}/availability`,
        {
          params: { employee: employee._id, date: dateStr },
        }
      );
      const bookedSlots = response.data; // [{ start, end }]

      // 2️⃣ Generate potential slots
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

        // 3️⃣ Check if this slot overlaps with any existing booking
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
    <div className="max-h-screen pb-20">
      <div className="bg-[#d6a78f] shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('selectDateTime')}
          </h1>
          <div className="text-sm text-gray-100 space-y-1">
            <p>
              {t('service')}:{' '}
              <span className="font-medium">{bookingState.service?.name}</span>
            </p>
            <p>
              {t('employee')}:{' '}
              <span className="font-medium">{bookingState.employee?.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl bg-[#d6a78f] h-screen mx-auto p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {t('selectDate')}
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2  min-w-max">
              {calendar.map((date, index) => {
                const isSelected = dayjs(date).isSame(selectedDate, 'day');
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      flex flex-col items-center justify-center w-20 h-24 rounded-lg border-2 transition-all duration-200
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }
                    `}>
                    <div className="text-xs mb-1">
                      {formatDayName(date).substring(0, 9)}
                    </div>
                    <div className="text-2xl font-bold">
                      {convertToPersianNumber(
                        dayjs(date).calendar('jalali').locale('fa').format('D')
                      )}
                    </div>
                    {dayjs(date).calendar('jalali').locale('fa').format('MMMM')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {t('availableSlots')}
          </h2>
          {loading ? (
            <LoadingSpinner />
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10m-9 4h8m-10 4h12a2 2 0 002-2V7a2 2 0 00-2-2h-3V3m-6 2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-500">
                هیچ زمان آزادی برای این روز وجود ندارد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
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

        {selectedSlot && (
          <div className="fixed bottom-5 left-0 right-0 h-10 border-gray-200 p-4">
            <div className="max-w-4xl mx-auto ">
              <button
                onClick={handleContinue}
                className="w-full bg-[#8d98d6] text-white py-2 rounded-lg font-semibold shadow-md hover:bg-[#7a85c2] transition-colors">
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSlots;
