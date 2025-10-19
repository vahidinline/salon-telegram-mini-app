import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface PaymentCountdownProps {
  deadline: string | Date;
  onExpire?: () => void; // optional callback if you want to handle expiration
}

const PaymentCountdown: React.FC<PaymentCountdownProps> = ({
  deadline,
  onExpire,
}) => {
  const [remaining, setRemaining] = useState<number>(
    new Date(deadline).getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(deadline).getTime() - Date.now();
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (remaining <= 0) {
    return (
      <span className="font-medium text-red-600 text-sm">
        زمان پرداخت به پایان رسید
      </span>
    );
  }

  const dur = dayjs.duration(remaining);
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  return (
    <span className="font-medium text-green-600 text-sm">
      {`${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')} تا پایان`}
    </span>
  );
};

export default PaymentCountdown;
