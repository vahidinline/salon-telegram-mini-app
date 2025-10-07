import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, FolderKanban, History } from 'lucide-react';
import { getTelegramUser } from '../utils/telegram';
import TeleButton from '../components/TeleButton';
import Logo from '../assets/img/logo.png';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/useAnimations';
import Lottie from 'lottie-react';
import wellcomeAnimation from '../assets/img/wellcome.json';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showSplash, setShowSplash] = React.useState(true);

  const telegramUser = getTelegramUser();
  const userName = telegramUser?.first_name || 'Guest';
  console.log('username', userName);
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
    }, 3000); // Display splash screen for 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen flex flex-col items-center justify-center bg-transparent p-6 ">
      {showSplash ? (
        <div
          style={{
            // height: '100%',
            // width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // backgroundColor: '#fff', // or Telegram theme background
          }}>
          <Lottie
            animationData={wellcomeAnimation}
            loop={true} // or false if you want it to play once
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="max-w-md w-full space-y-8">
          <span className="flex justify-center">
            <img src={Logo} alt="App Logo" className="h-15 w-full" />
          </span>
          <div className="text-center">
            <h1 className="welcome-title text-4xl font-bold text-gray-100 mb-4">
              {/* {t('welcome')} */}
              {t('hello', { name: userName })}
            </h1>
            {/* <p className="welcome-subtitle text-xl text-gray-600">
            {t('hello', { name: userName })}
          </p> */}
          </div>

          <div className="space-y-4">
            <TeleButton
              onClick={() => navigate('/services')}
              className="action-button w-full py-6 text-lg flex items-center justify-center gap-3">
              <Calendar size={24} />
              {t('reserve')}
            </TeleButton>

            <TeleButton
              onClick={() => navigate('/')}
              variant="secondary"
              className="action-button w-full py-6 text-lg flex items-center justify-center gap-3">
              <FolderKanban />
              {t('bookingManagement')} ( بزودی)
            </TeleButton>
            <TeleButton
              onClick={() => navigate('/bookings')}
              variant="secondary"
              className="action-button w-full py-6 text-lg flex items-center justify-center gap-3">
              <History size={24} />
              {t('bookingHistory')}
            </TeleButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
