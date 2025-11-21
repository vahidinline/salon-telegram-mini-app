// // components/JalaliMonthlyCalendar.tsx
// import React from 'react';
// import dayjs, { Dayjs } from 'dayjs';
// import jalaliday from 'jalaliday';

// dayjs.extend(jalaliday);

// interface Props {
//   selectedDate: Dayjs;
//   onSelectDate: (date: Dayjs) => void;
//   month?: number; // 0-11 (Jalali)
//   year?: number; // e.g. 1403
//   className?: string;
// }

// const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// const JalaliMonthlyCalendar: React.FC<Props> = ({
//   selectedDate,
//   onSelectDate,
//   month,
//   year,
//   className = '',
// }) => {
//   const safeDate = dayjs(selectedDate).calendar('jalali');

//   const currentMonth = month ?? safeDate.month();
//   const currentYear = year ?? safeDate.year();

//   const startOfMonth = dayjs()
//     .calendar('jalali')
//     .year(currentYear)
//     .month(currentMonth)
//     .date(1);

//   const startWeekday = startOfMonth.day(); // 0-6

//   // Generate 42 days (6 weeks)
//   const daysGrid: Dayjs[] = [];
//   for (let i = 0; i < 42; i++) {
//     daysGrid.push(startOfMonth.subtract(startWeekday, 'day').add(i, 'day'));
//   }

//   return (
//     <div
//       className={`w-full max-w-md bg-white rounded-xl p-4 shadow ${className}`}>
//       {/* عنوان ماه */}
//       <h2 className="text-center text-lg font-bold mb-4">
//         {startOfMonth.locale('fa').format('MMMM YYYY')}
//       </h2>

//       {/* ردیف روزهای هفته */}
//       <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2">
//         {dayNames.map((name) => (
//           <div key={name}>{name}</div>
//         ))}
//       </div>

//       {/* روزها */}
//       <div className="grid grid-cols-7 gap-2">
//         {daysGrid.map((date, index) => {
//           const isCurrentMonth =
//             date.calendar('jalali').month() === currentMonth;
//           const isSelected = date.isSame(selectedDate, 'day');

//           return (
//             <button
//               key={index}
//               onClick={() => onSelectDate(date)}
//               className={`p-2 h-14 rounded-lg flex items-center justify-center
//                 border-2 transition-all duration-150 text-sm
//                 ${
//                   isSelected
//                     ? 'border-[#7f3d45] bg-blue-50 text-[#7f3d45]'
//                     : isCurrentMonth
//                     ? 'border-gray-200 hover:border-blue-300'
//                     : 'border-gray-100 text-gray-300'
//                 }
//               `}>
//               {date.locale('fa').calendar('jalali').format('D')}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default JalaliMonthlyCalendar;

// components/JalaliMonthlyCalendar.tsx
import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import jalaliday from 'jalaliday';
import { convertToPersianNumber } from '../utils/NumberFarsi';

dayjs.extend(jalaliday);

interface Props {
  selectedDate: Dayjs;
  onSelectDate: (date: Dayjs) => void;
  className?: string;
}

const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const JalaliMonthlyCalendar: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  // کنترل ماه و سال در State داخلی
  const initial = dayjs(selectedDate).calendar('jalali');
  const [month, setMonth] = useState(initial.month());
  const [year, setYear] = useState(initial.year());

  // وقتی تاریخ انتخابی تغییر کند، ماه/سال را sync کنیم
  useEffect(() => {
    const d = dayjs(selectedDate).calendar('jalali');
    setMonth(d.month());
    setYear(d.year());
  }, [selectedDate]);

  // شروع ماه
  const startOfMonth = dayjs()
    .calendar('jalali')
    .year(year)
    .month(month)
    .date(1);

  const startWeekday = (startOfMonth.day() + 1) % 7;

  // ساخت Grid‌ ۶ هفته‌ای (۴۲ روز)
  const daysGrid: Dayjs[] = [];
  for (let i = 0; i < 42; i++) {
    daysGrid.push(startOfMonth.subtract(startWeekday, 'day').add(i, 'day'));
  }

  // تغییر ماه
  const goToPrevMonth = () => {
    const newDate = startOfMonth.subtract(1, 'month');
    setMonth(newDate.month());
    setYear(newDate.year());
  };

  const goToNextMonth = () => {
    const newDate = startOfMonth.add(1, 'month');
    setMonth(newDate.month());
    setYear(newDate.year());
  };

  return (
    <div
      className={`w-full max-w-md bg-white rounded-xl p-4 shadow-md ${className}`}>
      {/* هدِر + دکمه‌های ماه قبل/بعد */}
      <div className="flex border rounded-md items-center justify-between mb-4">
        <button onClick={goToPrevMonth} className="p-2 rounded text-[#7f3d45]">
          ▶
        </button>

        <h2 className="text-center text-lg text-[#7f3d45] font-bold">
          {startOfMonth.locale('fa').format('MMMM YYYY')}
        </h2>

        <button onClick={goToNextMonth} className="p-2 rounded text-[#7f3d45]">
          ◀
        </button>
      </div>

      {/* روزهای هفته */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2">
        {dayNames.map((name) => (
          <div key={name}>{name}</div>
        ))}
      </div>

      {/* خانه‌های روزها */}
      <div className="grid grid-cols-7 gap-2">
        {daysGrid.map((date, index) => {
          const isCurrentMonth = date.calendar('jalali').month() === month;

          const isSelected = date.isSame(selectedDate, 'day');
          const today = dayjs().startOf('day');
          const isPast = date.isBefore(today, 'day'); //
          return (
            <button
              key={index}
              onClick={() => !isPast && onSelectDate(date)}
              className={`p-2 w-10 h-10  rounded-full flex items-center justify-center
                border-2 transition-all duration-150 text-sm
                ${
                  isSelected
                    ? 'border-[#7f3d45] bg-blue-50 text-[#7f3d45]'
                    : isPast
                    ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' // 🔴 غیرفعال
                    : isCurrentMonth
                    ? 'border-gray-200 hover:border-blue-300'
                    : 'border-gray-100 text-gray-300'
                }
              `}>
              {convertToPersianNumber(
                date.locale('fa').calendar('jalali').format('D')
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JalaliMonthlyCalendar;
