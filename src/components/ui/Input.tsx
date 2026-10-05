import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = 'text', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            "w-full bg-graphite border border-graphite-border rounded-sm px-3.5 py-2.5 text-sm text-warm-white placeholder:text-muted-dark transition-colors duration-150 focus:border-accent-gold/80 focus:ring-1 focus:ring-accent-gold/40 focus:outline-none",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-muted-dark">{hint}</p>}
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full bg-graphite border border-graphite-border rounded-xs pl-3.5 pr-10 py-3 text-sm text-warm-white transition-colors duration-150 focus:border-accent-gold/80 focus:ring-1 focus:ring-accent-gold/40 focus:outline-none cursor-pointer appearance-none min-h-[46px]",
              error && "border-red-500/80",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
            <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
