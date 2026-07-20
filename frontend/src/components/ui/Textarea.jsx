import React from 'react';
import { clsx } from 'clsx';

export const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  id,
  disabled,
  rows = 4,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const textareaId = id || generatedId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-text select-none cursor-pointer"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        rows={rows}
        className={clsx(
          'flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text placeholder:text-text-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y',
          error && 'border-danger focus-visible:ring-danger',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-danger animate-fade-in">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
