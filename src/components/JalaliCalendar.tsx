import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
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

  // Default date logic
  const initial = value
    ? dayjs(value, 'YYYY/MM/DD').calendar('jalali')
    : dayjs().calendar('jalali');

  const [current, setCurrent] = useState(initial);
  const [yearSelect, setYearSelect] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: any) {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
        setYearSelect(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const daysInMonth = current.daysInMonth();
  const firstDay = current.startOf('month').day();
  const emptySlots = firstDay === 6 ? 0 : firstDay + 1;

  const handleSelect = (day: number) => {
    const selected = current.date(day);
    const formatted = selected.calendar('jalali').format('YYYY/MM/DD');
    onChange(formatted);
    setShow(false);
    setYearSelect(false);
  };

  const YEARS = Array.from({ length: 200 }, (_, i) => 1320 + i); // Change range if needed

  return (
    <div className="w-full relative" ref={ref} dir="rtl">
      {label && (
        <label className="block mb-1 text-[#7f3d45] font-medium">{label}</label>
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

      {/* CALENDAR DROPDOWN */}
      {show && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {/* Prev month */}
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setCurrent(current.subtract(1, 'month'))}>
              <ChevronRight size={20} />
            </button>

            {/* Month + Clickable year */}
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-800">
                {persianMonths[current.month()]}
              </div>

              <button
                onClick={() => setYearSelect(!yearSelect)}
                className="flex items-center gap-1 font-semibold text-blue-600 hover:bg-gray-100 px-2 py-1 rounded-lg">
                {current.year()}
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Next month */}
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setCurrent(current.add(1, 'month'))}>
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* YEAR SELECTOR */}
          {yearSelect && (
            <div className="max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-3">
              {YEARS.map((yr) => (
                <div
                  key={yr}
                  onClick={() => {
                    setCurrent(current.year(yr));
                    setYearSelect(false);
                  }}
                  className={`p-2 rounded-lg cursor-pointer text-center hover:bg-blue-100 ${
                    yr === current.year() ? 'bg-blue-200 font-bold' : ''
                  }`}>
                  {yr}
                </div>
              ))}
            </div>
          )}

          {/* Weekday names */}
          <div className="grid grid-cols-7 text-center text-gray-500 mb-2">
            {weekdayNames.map((w) => (
              <div key={w} className="py-1 text-sm font-medium">
                {w}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {!yearSelect && (
            <div className="grid grid-cols-7 text-center gap-1">
              {Array.from({ length: emptySlots }).map((_, idx) => (
                <div key={idx} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const full = current
                  .date(day)
                  .calendar('jalali')
                  .format('YYYY/MM/DD');

                return (
                  <button
                    key={day}
                    onClick={() => handleSelect(day)}
                    className={`py-2 rounded-lg text-sm hover:bg-blue-100 transition ${
                      value === full ? 'bg-blue-500 text-white' : 'bg-gray-50'
                    }`}>
                    {day}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
