import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, History } from 'lucide-react';
import { getTelegramUser } from '../utils/telegram';
import TeleButton from '../components/TeleButton';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '../hooks/useAnimations';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="welcome-title text-4xl font-bold text-gray-800 mb-4">
            {t('welcome')}
          </h1>
          <p className="welcome-subtitle text-xl text-gray-600">
            {t('hello', { name: userName })}
          </p>
        </div>

        <div className="space-y-4">
          <TeleButton
            onClick={() => navigate('/services')}
            className="action-button w-full py-6 text-lg flex items-center justify-center gap-3">
            <Calendar size={24} />
            {t('reserve')}
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
    </div>
  );
};

export default Welcome;
