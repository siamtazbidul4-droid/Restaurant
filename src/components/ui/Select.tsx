import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ label: string; value: string | number }>;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs uppercase tracking-wider text-[#D1CCC0] font-sans">
            {label}
            {props.required && <span className="text-[#C5A880] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-[#16161C] border ${
            error ? 'border-rose-500' : 'border-white/15 focus:border-[#C5A880]'
          } text-sm text-white px-3.5 py-2.5 outline-none transition-colors focus:ring-1 focus:ring-[#C5A880]/30 disabled:opacity-50 ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#16161C] text-white">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {helperText && !error && <p className="text-[11px] text-stone-400">{helperText}</p>}
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
