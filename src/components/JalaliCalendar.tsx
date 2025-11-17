import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

dayjs.extend(jalaliday);

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

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

const weekdayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export default function JalaliCalendar({ value, onChange, label }: Props) {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(dayjs().calendar('jalali'));
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handleClick(e: any) {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const daysInMonth = current.daysInMonth();
  const firstDay = current.startOf('month').day(); // week day
  const emptySlots = firstDay === 6 ? 0 : firstDay + 1;

  const handleSelect = (day: number) => {
    const selected = current.date(day);
    const formatted = selected.calendar('jalali').format('YYYY/MM/DD');
    onChange(formatted);
    setShow(false);
  };

  return (
    <div className="w-full relative" ref={ref} dir="rtl">
      {label && (
        <label className="block mb-1 text-gray-800 font-medium">{label}</label>
      )}

      {/* input */}
      <div
        onClick={() => setShow(!show)}
        className="flex items-center justify-between w-full p-3 border rounded-lg cursor-pointer bg-white hover:border-blue-500 transition">
        <span className={`${value ? 'text-gray-800' : 'text-gray-400'}`}>
          {value || 'انتخاب کنید'}
        </span>

        <CalendarIcon className="text-gray-500" size={20} />
      </div>

      {show && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border p-4">
          {/* header */}
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setCurrent(current.subtract(1, 'month'))}>
              <ChevronRight size={20} />
            </button>

            <div className="font-semibold text-gray-800">
              {persianMonths[current.month()]} {current.year()}
            </div>

            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setCurrent(current.add(1, 'month'))}>
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* weekdays */}
          <div className="grid grid-cols-7 text-center text-gray-500 mb-2">
            {weekdayNames.map((w) => (
              <div key={w} className="py-1 text-sm font-medium">
                {w}
              </div>
            ))}
          </div>

          {/* days */}
          <div className="grid grid-cols-7 text-center gap-1">
            {/* empty slots */}
            {Array.from({ length: emptySlots }).map((_, idx) => (
              <div key={idx} />
            ))}

            {/* days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              return (
                <button
                  key={day}
                  onClick={() => handleSelect(day)}
                  className={`py-2 rounded-lg text-sm hover:bg-blue-100 transition ${
                    value ===
                    current.date(day).calendar('jalali').format('YYYY/MM/DD')
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50'
                  }`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
