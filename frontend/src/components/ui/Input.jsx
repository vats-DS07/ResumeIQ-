import React from 'react';
import { clsx } from 'clsx';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  id,
  disabled,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text select-none cursor-pointer"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-text-secondary pointer-events-none flex items-center justify-center w-5 h-5">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={clsx(
            'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text placeholder:text-text-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger focus-visible:ring-danger',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-text-secondary pointer-events-none flex items-center justify-center w-5 h-5">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-danger animate-fade-in">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
