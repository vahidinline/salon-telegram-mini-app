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
import { showTelegramAlert } from '../utils/telegram';

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

  const generateSlotsFrontend = () => {
    const employee = bookingState.employee;
    const service = bookingState.service;

    if (!employee || !service) return;

    setLoading(true);
    setSelectedSlot(null);

    const dayName = dayjs(selectedDate).format('dddd').toLowerCase();

    if (!employee.workDays.includes(dayName)) {
      setSlots([]);
      setLoading(false);
      return;
    }

    const [startHour, startMinute] = employee.startTime.split(':').map(Number);
    const [endHour, endMinute] = employee.endTime.split(':').map(Number);

    let current = dayjs(selectedDate).hour(startHour).minute(startMinute);
    const end = dayjs(selectedDate).hour(endHour).minute(endMinute);
    const duration = service.duration;

    const slotList: TimeSlot[] = [];
    while (
      current.add(duration, 'minute').isSame(end) ||
      current.add(duration, 'minute').isBefore(end)
    ) {
      const next = current.clone().add(duration, 'minute');
      slotList.push({ start: current.toDate(), end: next.toDate() });
      current = next;
    }

    setSlots(slotList);
    setLoading(false);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      setDateTime(selectedDate, selectedSlot);
      navigate('/confirm');
    }
  };

  const formatDate = (date: Date) => {
    return isJalali
      ? dayjs(date).calendar('jalali').format('DD MMMM YYYY')
      : dayjs(date).format('DD MMMM YYYY');
  };

  const formatDayName = (date: Date) => {
    return isJalali
      ? dayjs(date).calendar('jalali').format('dddd')
      : dayjs(date).format('dddd');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('selectDateTime')}
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
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

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {t('selectDate')}
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
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
                      {formatDayName(date).substring(0, 3)}
                    </div>
                    <div className="text-2xl font-bold">
                      {dayjs(date).date()}
                    </div>
                    <div className="text-xs">{dayjs(date).format('MMM')}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {t('availableSlots')} - {formatDate(selectedDate)}
          </h2>
          {loading ? (
            <LoadingSpinner />
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('noSlotsAvailable')}
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
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <TeleButton onClick={handleContinue} className="w-full">
                {t('next')}
              </TeleButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSlots;
