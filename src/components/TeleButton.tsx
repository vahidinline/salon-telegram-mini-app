import React from 'react';

interface TeleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'link'
    | 'outline'
    | 'info'
    | 'alert';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const TeleButton: React.FC<TeleButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseClasses =
    'px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
    link: 'bg-transparent text-blue-500 underline hover:text-blue-600',
    outline:
      'bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-100',
    info: 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl',
    alert:
      'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default TeleButton;
