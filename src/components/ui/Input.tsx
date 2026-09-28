import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs uppercase tracking-wider text-[#D1CCC0] font-sans">
            {label}
            {props.required && <span className="text-[#C5A880] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[#16161C] border ${
            error ? 'border-rose-500' : 'border-white/15 focus:border-[#C5A880]'
          } text-sm text-white px-3.5 py-2.5 outline-none transition-colors placeholder:text-stone-600 focus:ring-1 focus:ring-[#C5A880]/30 disabled:opacity-50 disabled:bg-stone-900 ${className}`}
          {...props}
        />
        {helperText && !error && <p className="text-[11px] text-stone-400">{helperText}</p>}
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
