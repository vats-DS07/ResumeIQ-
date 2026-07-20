import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export const Chip = ({
  className,
  label,
  onDelete,
  active = false,
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 border select-none',
        isClickable && 'cursor-pointer hover:shadow-rest',
        active
          ? 'bg-primary text-white border-primary shadow-rest'
          : 'bg-surface text-text border-border hover:bg-bg',
        className
      )}
      {...props}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={clsx(
            'rounded-full p-0.5 inline-flex items-center justify-center cursor-pointer transition-colors',
            active
              ? 'hover:bg-primary-hover text-white/80 hover:text-white'
              : 'hover:bg-border text-text-secondary hover:text-text'
          )}
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
