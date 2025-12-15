import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import 'dayjs/locale/fa';
import Lottie from 'lottie-react';
dayjs.extend(jalaliday);
import wellcomeAnimation from '../assets/img/wellcome.json';
import Welcome from './Welcome';
import { useNavigate } from 'react-router-dom';

interface DayStatus {
  date: string;
  hasWorkingEmployee: boolean;
  hasFreeSlot: boolean;
}

const WeeklyCalendar: React.FC<{
  salonId: string;
  onDaySelect: (date: string) => void;
}> = ({ salonId, onDaySelect }) => {
  const { i18n } = useTranslation();
  const isJalali = i18n.language === 'fa';
  const navigate = useNavigate();
  const [week, setWeek] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  useEffect(() => {
    generateWeek();
  }, []);

  const handleSelectedDay = () => {
    setSelectedDay(null);
  };

  const generateWeek = async () => {
    setLoading(true);

    const promises = Array.from({ length: 7 }).map(async (_, i) => {
      const dateObj = dayjs().add(i, 'day');
      const dateStr = dateObj.format('YYYY-MM-DD');

      try {
        const res = await api.get(
          `/salons/651a6b2f8b7a5a1d223e4c90/availability/freeslots`,
          { params: { date: dateStr } }
        );
        console.log('res', res);
        const employees = res.data;

        const weekday = dateObj
          .toDate()
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase();

        const enhancedEmployees = employees.map((e: any) => ({
          ...e,
          worksToday: e.employee.workSchedule.some(
            (w: any) => w.day.toLowerCase() === weekday
          ),
        }));

        const hasWorkingEmployee = enhancedEmployees.some(
          (e: any) => e.worksToday
        );
        const hasFreeSlot = enhancedEmployees.some(
          (e: any) => e.worksToday && e.hasFreeSlot
        );

        return {
          date: dateStr,
          hasWorkingEmployee,
          hasFreeSlot,
          employees: enhancedEmployees, // ⬅ مهم
        };
      } catch (error) {
        return {
          date: dateStr,
          hasWorkingEmployee: false,
          hasFreeSlot: false,
          employees: [],
        };
      }
    });

    const results = await Promise.all(promises);
    setWeek(results);
    setLoading(false);
  };

  const categories = [
    {
      title: 'ROSE',
      name: ' خدمات Basic  تیم Nials By Marjan',
      description:
        'خدمات رز شامل سرویس  <strong>BASIC</strong> است که توسط <strong>اعضای تیم</strong> ارائه می شود.',
      type: 'Basic',
      code: 'ROSE',
    },
    {
      title: 'LILY',
      name: 'لی لی | خدمات Basic  توسط خانم مرجان ترکمن',
      description:
        'خدمات لی لی شامل سرویس <strong>BASIC</strong> است که توسط <strong>مرجان</strong> ارائه می شود.',
      type: 'Basic',
      code: 'LILY',
    },
    {
      title: 'ORCHID',
      name: 'ارکیده | خدمات VIP  تیم Nials By Marjan',
      description:
        'خدمات ارکیده شامل سرویس  <strong>VIP</strong> است که توسط <strong>اعضای تیم</strong> ارائه می شود.',
      type: 'Vip',
      code: 'ORCHID',
    },
    {
      title: 'PEONY',
      name: 'پیونی | خدمات VIP  توسط خانم مرجان ترکمن',
      description:
        'خدمات پیونی شامل سرویس  <strong>VIP</strong> است که توسط   <strong> مرجان</strong> ارائه می شود.',
      type: 'Vip',
      code: 'PEONY',
    },
  ];

  // const generateWeek = async () => {
  //   const temp: DayStatus[] = [];
  //   setLoading(true);

  //   for (let i = 0; i < 7; i++) {
  //     const dateObj = dayjs().add(i, 'day');
  //     const dateStr = dateObj.format('YYYY-MM-DD');

  //     try {
  //       const res = await api.get(
  //         `/salons/651a6b2f8b7a5a1d223e4c90/availability/freeslots`,
  //         {
  //           params: { date: dateStr },
  //         }
  //       );

  //       const employees = res.data;
  //       console.log('employees', employees);
  //       const hasWorkingEmployee = employees.some(
  //         (e: any) =>
  //           !!e.employee.workSchedule.find((w: any) => {
  //             const weekday = dateObj
  //               .toDate()
  //               .toLocaleDateString('en-US', { weekday: 'long' })
  //               .toLowerCase();
  //             return w.day.toLowerCase() === weekday;
  //           })
  //       );

  //       const hasFreeSlot = employees.some((e: any) => e.hasFreeSlot);

  //       temp.push({
  //         date: dateStr,
  //         hasWorkingEmployee,
  //         hasFreeSlot,
  //       });
  //     } catch (e) {
  //       temp.push({
  //         date: dateStr,
  //         hasWorkingEmployee: false,
  //         hasFreeSlot: false,
  //       });
  //     }
  //   }

  //   setWeek(temp);
  //   setLoading(false);
  // };

  const persianNumber = (num: string | number) =>
    num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

  const formatDate = (date: string) => {
    if (isJalali) {
      const d = dayjs(date).locale('fa').calendar('jalali');
      // format day with Persian numerals and full month name
      const day = persianNumber(d.format('D'));
      const month = d.format('MMMM'); // full month name
      const weekday = d.format('dddd'); // weekday name
      return `${weekday} ${day} ${month}`;
    } else {
      return dayjs(date).format('dddd, MMM D');
    }
  };

  if (loading)
    return (
      <div className="p-4 bg-[#d6a78f] h-screen text-center">
        {' '}
        <div className="flex  items-center justify-center">
          <Lottie
            animationData={wellcomeAnimation}
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );

  return (
    <div className=" space-y-3 flex min-h-screen flex-col items-center justify-center bg-[#d6a78f] p-6 ">
      <Welcome />
      {!selectedDay && (
        <>
          <span className="flex text-md justify-center text-[#fffffa] font-bold text-shadow-md">
            لطفا
            <span className="text-md font-bold mx-1"> "تاریخ"</span>
            مورد نظر خود را برای رزرو انتخاب کنید.
          </span>
          {week.map((day) => {
            const disabled = !day.hasWorkingEmployee;

            return (
              <button
                key={day.date}
                disabled={disabled}
                onClick={() => setSelectedDay(day)} // ⬅ روز انتخاب شده ذخیره می‌شود
                className={`w-full text-left p-4 rounded-xl border flex justify-between items-center h-8
    ${
      disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white hover:bg-blue-50'
    }
  `}>
                {/* <span className=" text-[#7f3d45] font-bold">

                </span> */}

                {disabled ? (
                  <span className="text-gray-400"> {formatDate(day.date)}</span>
                ) : day.hasFreeSlot ? (
                  <span className="text-[#7f3d45] font-bold">
                    {' '}
                    {formatDate(day.date)}
                  </span>
                ) : (
                  <span className="text-red-500 font-bold">
                    {formatDate(day.date)}
                  </span>
                )}

                {disabled ? (
                  <span className="text-gray-400"> تعطیل</span>
                ) : day.hasFreeSlot ? (
                  <span className="text-[#7f3d45] font-bold"> انتخاب روز</span>
                ) : (
                  <span className="text-red-500 font-bold">
                    همه وقت‌ها پر هستند
                  </span>
                )}
              </button>
            );
          })}
        </>
      )}
      {selectedDay && (
        <>
          <div className="h-16 text-center">
            <span className="text-white font-bold text-md">
              تمایل دارید از کدام "شاخه" سرویس دریافت کنید؟
            </span>
            <br />
            <span className="text-gray-100 font-bold text-sm ">
              <span>(</span>
              خدمات <span className=" text-sm">"قابل ارائه" </span>
              در روز {formatDate(selectedDay.date)}
            </span>
            <span className="text-white">)</span>
          </div>
          <div className="relative w-full p-2 bg-[#d6a78f]  rounded-xl shadow-md border">
            {/* Top Row: Close Button (Left) + Title (Right) */}
            <div className="flex items-center justify-between px-2 py-1 absolute top-2 left-0 right-0">
              {/* Title Text */}

              {/* Close Button */}
              <button
                onClick={() => handleSelectedDay()}
                className="p-1 rounded-full hover:bg-gray-100 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-100">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </button>
            </div>

            {/* Add padding so content doesn't overlap top bar */}
            <div className="pt-12">
              {selectedDay.employees.length === 0 && (
                <p className="text-gray-500">
                  هیچ کارمندی برای این روز ثبت نشده است.
                </p>
              )}

              <div className="space-y-2">
                {categories.map((c, idx) => {
                  const isVIP = c.type?.toLowerCase() === 'vip';

                  return (
                    <div
                      onClick={() => {
                        navigate('/services', {
                          state: { code: c.code },
                        });
                      }}
                      key={idx}
                      className={`
              p-4 border rounded-xl transition shadow-sm
              ${
                isVIP
                  ? 'bg-gray-50 border-gray-300'
                  : // ? 'bg-gradient-to-br from-[#fdf5e6] via-[#fff8dc] to-[#f5e6c4] border-yellow-400 shadow-[0_0_12px_rgba(255,215,0,0.4)]'
                    'bg-gray-50 border-gray-300'
              }
            `}>
                      {/* VIP Badge */}
                      {isVIP && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-600 font-semibold text-sm">
                            VIP Service
                          </span>
                          <span className="text-yellow-600">✨</span>
                        </div>
                      )}

                      <span
                        className={`block font-semibold text-center text-lg ${
                          isVIP ? 'text-yellow-700' : 'text-yellow-700'
                        }`}>
                        {c?.title || c.name}
                      </span>

                      <p
                        className={`text-sm text-center mt-1 ${
                          isVIP ? 'text-yellow-800/90' : 'text-yellow-700'
                        }`}>
                        <p
                          dangerouslySetInnerHTML={{ __html: c.description }}
                        />
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyCalendar;
