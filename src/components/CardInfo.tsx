import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CardNumberField() {
  const cardNumber = '6104337882900792';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative text-right flex items-center justify-between bg-gray-100 px-4 py-3 rounded-xl shadow-sm w-full max-w-sm">
      <span dir="ltr" className="font-mono text-lg tracking-widest select-all">
        {cardNumber}
      </span>

      <button
        onClick={handleCopy}
        className="relative ml-3 text-gray-600 hover:text-blue-500 transition">
        {copied ? (
          <>
            <Check className="w-5 h-5 text-green-500" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm rounded-lg px-3 py-1 shadow-md animate-fadeIn">
              شماره کپی شد
            </div>
          </>
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
