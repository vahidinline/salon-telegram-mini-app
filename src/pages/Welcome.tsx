import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTelegramUser } from '../utils/telegram';
import Logo from '../assets/img/logo.png';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/useAnimations';
import { useTelegramStore } from '../store/useTelegramStore';

const Welcome: React.FC = () => {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showSplash, setShowSplash] = React.useState(true);

  const { user, setUser } = useTelegramStore();

  useEffect(() => {
    let telegramUser = getTelegramUser();

    if (!telegramUser) {
      telegramUser = {
        id: 123456789,
        first_name: 'Vahid',
        last_name: 'Afshari',
        username: 'vahiddev',
        photo_url: 'https://i.pravatar.cc/150?img=12',
        // auth_date: new Date().toISOString(),
      };

      console.warn('⚠️ Using mock Telegram user data:', telegramUser);
    }

    setUser(telegramUser);
  }, [setUser]);

  const userName = user?.first_name || 'Guest';
  const photoUrl = user?.photo_url || '';

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const title = containerRef.current.querySelector('.welcome-title');
    const subtitle = containerRef.current.querySelector('.welcome-subtitle');
    const buttons = containerRef.current.querySelectorAll('.action-button');

    gsap.fromTo(
      title,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo(
      subtitle,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, delay: 0.3 }
    );

    gsap.fromTo(
      buttons,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        delay: 0.5,
        ease: 'power3.out',
      }
    );
  }, [prefersReducedMotion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className=" flex flex-col items-center max-h-screen justify-center bg-[#d6a78f] p-2 overflow-auto">
      <div className="max-w-md w-full  space-y-8">
        <span className="flex justify-center   p-5">
          <img src={Logo} alt="App Logo" className="h-15 w-full" />
        </span>
        <div className="text-center">
          <h1 className="welcome-title text-4xl font-bold text-gray-100 mb-4">
            {t('hello', { name: userName })}
          </h1>
        </div>
      </div>

      {/* <div className="static ">
        <div className="absolute bottom-0 right-1 text-white text-xs">
          <p>نسخه ۰.۰.۴ </p>
        </div>
      </div> */}
    </div>
  );
};

export default Welcome;
