import React, { ReactNode } from "react";

type ButtonProps = {
  onClick: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
};

export default function Button({
   onClick,
   children,
   size = 'md',
   type = 'primary',
   disabled = false,
   className = ''
 }: ButtonProps) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3'
  };

  const typeClasses = {
    primary: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300',
    secondary: 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200'
  };

  const disabledClasses = 'text-gray-400 bg-gray-400 cursor-not-allowed hover:bg-gray-500 focus:ring-0';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded-lg focus:ring-4 ${sizeClasses[size]} ${typeClasses[type]} ${disabled ? disabledClasses : ''} ${className}`}
    >
      {children}
    </button>
  );
}