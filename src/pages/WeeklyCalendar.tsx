import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import Lottie from 'lottie-react';
import gsap from 'gsap';
import 'dayjs/locale/fa';

import api from '../utils/api';
import { getTelegramUser } from '../utils/telegram';
import { useTelegramStore } from '../store/useTelegramStore';
import { usePrefersReducedMotion } from '../hooks/useAnimations';

import wellcomeAnimation from '../assets/img/wellcome.json';
import Logo from '../assets/img/logo02.png';

dayjs.extend(jalaliday);

interface DayStatus {
  date: string;
  hasWorkingEmployee: boolean;
  hasFreeSlot: boolean;
  employees: any[];
}

interface Category {
  title: string;
  name: string;
  description: string;
  type: string;
  code: string;
}

const WeeklyCalendar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isJalali = i18n.language === 'fa';

  // State
  const [week, setWeek] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);

  // User Store & Refs
  const { user, setUser } = useTelegramStore();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const userName = user?.first_name || 'Guest';

  // 1. Initialize User (Merged from Welcome.tsx)
  useEffect(() => {
    let telegramUser = getTelegramUser();

    if (!telegramUser) {
      telegramUser = {
        id: 123456789,
        first_name: 'Vahid',
        last_name: 'Afshari',
        username: 'vahiddev',
        photo_url: '',
      };
      // console.warn('⚠️ Using mock Telegram user data');
    }
    setUser(telegramUser);
  }, [setUser]);

  // 2. Fetch Weekly Calendar Data
  useEffect(() => {
    generateWeek();
  }, []);

  // 3. Header Animation (Merged from Welcome.tsx)
  useEffect(() => {
    if (!headerRef.current || prefersReducedMotion) return;

    const logo = headerRef.current.querySelector('.app-logo');
    const title = headerRef.current.querySelector('.welcome-title');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      logo,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6 }
    ).fromTo(
      title,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.3'
    );
  }, [prefersReducedMotion]);

  // 4. Animate Content Entrance
  useEffect(() => {
    if (!loading && contentRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }
  }, [loading, selectedDay, prefersReducedMotion]);

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
          employees: enhancedEmployees,
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

  const categories: Category[] = [
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

  const persianNumber = (num: string | number) =>
    num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

  const formatDate = (date: string) => {
    if (isJalali) {
      const d = dayjs(date).locale('fa').calendar('jalali');
      const day = persianNumber(d.format('D'));
      const month = d.format('MMMM');
      const weekday = d.format('dddd');
      return `${weekday} ${day} ${month}`;
    } else {
      return dayjs(date).format('dddd, MMM D');
    }
  };

  const handleSelectedDay = () => {
    setSelectedDay(null);
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-[#d6a78f]">
        <div className="w-full max-w-sm px-8">
          <Lottie
            animationData={wellcomeAnimation}
            loop={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        <p className="text-white mt-4 animate-pulse">
          در حال دریافت اطلاعات...
        </p>
      </div>
    );
  }

  return (
    // کانتینر اصلی: ارتفاع فیکس و بدون اسکرول بادی
    <div className="flex flex-col h-[100dvh] bg-[#d6a78f] overflow-hidden">
      {/* 1. Header (Fixed) - Replaces Welcome Component */}
      <div
        ref={headerRef}
        className="flex-none w-full flex flex-col items-center pt-6 pb-2 px-4 z-10">
        <div className="w-full max-w-xs flex justify-center mb-4">
          <img
            src={Logo}
            alt="App Logo"
            className="app-logo h-16 object-contain drop-shadow-sm"
          />
        </div>
        <h1 className="welcome-title text-xl font-bold text-gray-100 text-shadow-sm">
          {t('hello', { name: userName })}
        </h1>
      </div>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 w-full max-w-md mx-auto scrollbar-hide">
        <div ref={contentRef} className="space-y-3">
          {/* VIEW 1: DAY SELECTION */}
          {!selectedDay && (
            <>
              <div className="text-center py-2 mb-2 sticky top-0 bg-[#d6a78f] z-10">
                <span className="text-md text-[#fffffa] font-bold drop-shadow-md">
                  لطفا <span className="text-lg mx-1 text-white">"تاریخ"</span>{' '}
                  مورد نظر را انتخاب کنید.
                </span>
              </div>

              {week.map((day) => {
                const disabled = !day.hasWorkingEmployee;
                return (
                  <button
                    key={day.date}
                    disabled={disabled}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      w-full text-left p-4 rounded-xl border flex justify-between items-center h-14 transition-all duration-200 active:scale-[0.98] shadow-sm
                      ${
                        disabled
                          ? 'bg-white/50 text-gray-500 cursor-not-allowed border-transparent'
                          : 'bg-white hover:bg-blue-50 border-white'
                      }
                    `}>
                    {disabled ? (
                      <span className="text-gray-500 opacity-70 text-sm font-medium">
                        {formatDate(day.date)}
                      </span>
                    ) : (
                      <span
                        className={`font-bold ${
                          day.hasFreeSlot ? 'text-[#7f3d45]' : 'text-red-500'
                        }`}>
                        {formatDate(day.date)}
                      </span>
                    )}

                    {disabled ? (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-500">
                        تعطیل
                      </span>
                    ) : day.hasFreeSlot ? (
                      <span className="text-xs bg-[#7f3d45] text-white px-3 py-1 rounded-full font-bold">
                        انتخاب
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 font-bold border border-red-200 px-2 py-1 rounded bg-red-50">
                        تکمیل شد
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* VIEW 2: CATEGORY SELECTION */}
          {selectedDay && (
            <div className="animate-fadeIn">
              {/* Header for Category View */}
              <div className="bg-[#d6a78f] pb-4 pt-1 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">
                    خدمات قابل ارائه در {formatDate(selectedDay.date)}
                  </span>
                  <button
                    onClick={handleSelectedDay}
                    className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 text-white transition backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="h-px bg-white/30 w-full mb-2"></div>
                <p className="text-center text-white text-lg font-bold">
                  کدام "شاخه" را ترجیح می‌دهید؟
                </p>
              </div>

              {/* Categories List */}
              <div className="space-y-3 bg-white/10 p-3 rounded-2xl border border-white/20">
                {selectedDay.employees.length === 0 && (
                  <p className="text-white/80 text-center py-4">
                    هیچ کارمندی برای این روز ثبت نشده است.
                  </p>
                )}

                {categories.map((c, idx) => {
                  const isVIP = c.type?.toLowerCase() === 'vip';
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        navigate('/services', { state: { code: c.code } });
                      }}
                      className={`
                        cursor-pointer p-4 border rounded-xl transition-transform active:scale-[0.99] shadow-md
                        ${
                          isVIP
                            ? 'bg-gradient-to-r from-gray-50 to-yellow-50/50 border-yellow-200'
                            : 'bg-white border-gray-100'
                        }
                      `}>
                      {isVIP && (
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
                            VIP Service ✨
                          </span>
                        </div>
                      )}

                      <h3
                        className={`block font-bold text-center text-lg mb-2 ${
                          isVIP ? 'text-yellow-800' : 'text-[#7f3d45]'
                        }`}>
                        {c?.title || c.name}
                      </h3>

                      <div
                        className={`text-sm text-center leading-relaxed ${
                          isVIP ? 'text-gray-700' : 'text-gray-600'
                        }`}
                        dangerouslySetInnerHTML={{ __html: c.description }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
