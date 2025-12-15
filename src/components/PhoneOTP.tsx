import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TeleButton from './TeleButton';
import api from '../utils/api';
import { showTelegramAlert } from '../utils/telegram';

interface PhoneOTPProps {
  onVerified: (token: string, userId: string) => void;
  telegramUserId?: number;
}

const PhoneOTP: React.FC<PhoneOTPProps> = ({ onVerified, telegramUserId }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      showTelegramAlert(t('invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/client-auth', {
        phoneNumber: phone.replace(/\s/g, ''),
        telegramUserId,
      });
      console.log('OTP sent response:', res.data);
      setStep('otp');
      setCountdown(60);
      showTelegramAlert(t('otpSent'));
    } catch (error: any) {
      showTelegramAlert(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      showTelegramAlert(t('invalidOTP'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/client-auth/verify-otp', {
        phone: phone.replace(/\s/g, ''),
        otp: otp,
      });
      const { status, userData } = response.data;
      console.log('verif', status, userData);
      localStorage.setItem('token', status);
      localStorage.setItem('userId', userData._id);
      onVerified(status, userData._id);
    } catch (error: any) {
      showTelegramAlert(error.response?.data?.message || t('invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-[#7f3d45] mb-2">
              {t('phone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              className="w-full px-4 py-3 border border-[#7f3d45] rounded-lg focus:ring-2 focus:ring-[#7f3d45] focus:border-[#7f3d45]"
              dir="ltr"
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading || !phone}
            className="w-full bg-[#7f3d45] text-white px-4 py-3 rounded-lg hover:bg-[#6e343c] disabled:opacity-50">
            {loading ? t('loading') : t('sendOTP')}
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('otpCode')}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              dir="ltr"
            />
            <p className="text-sm text-gray-500 mt-2">{t('enterOTP')}</p>
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length < 4}
            className="w-full bg-[#7f3d45] text-white px-4 py-3 rounded-lg hover:bg-[#6e343c] disabled:opacity-50">
            {loading ? t('loading') : t('verifyOTP')}
          </button>
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                {t('waitBeforeResend', { seconds: countdown })}
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-sm text-blue-500 hover:text-blue-600">
                {t('resendOTP')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneOTP;
