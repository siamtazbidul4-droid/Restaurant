import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans tracking-widest uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A880] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0';

  const sizeStyles = {
    sm: 'text-[11px] py-1.5 px-3',
    md: 'text-xs py-2.5 px-5',
    lg: 'text-xs py-3.5 px-7',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#C5A880] text-[#0D0D0E] font-medium hover:bg-[#D4AF37] border border-[#C5A880] shadow-sm',
    secondary:
      'bg-[#1A1A22] text-[#F6F4EE] hover:bg-[#252530] border border-white/10 hover:border-[#C5A880]/40',
    outline:
      'bg-transparent text-[#E0CEB5] border border-[#C5A880]/50 hover:bg-[#C5A880]/10 hover:border-[#C5A880]',
    ghost:
      'bg-transparent text-stone-300 hover:text-white hover:bg-white/5 border border-transparent',
    danger:
      'bg-rose-950/70 text-rose-200 border border-rose-800/60 hover:bg-rose-900',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Processing</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
