import React from 'react';
import { clsx } from 'clsx';

export const Badge = ({
  className,
  variant = 'neutral',
  outline = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none border w-fit transition-colors duration-150';
  
  const solidVariants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    neutral: 'bg-bg text-text-secondary border-border',
    emerald: 'bg-score-emerald/10 text-score-emerald border-score-emerald/20',
    amber: 'bg-score-amber/10 text-score-amber border-score-amber/20',
    red: 'bg-score-red/10 text-score-red border-score-red/20',
  };

  const outlineVariants = {
    primary: 'bg-transparent text-primary border-primary',
    neutral: 'bg-transparent text-text-secondary border-border',
    emerald: 'bg-transparent text-score-emerald border-score-emerald',
    amber: 'bg-transparent text-score-amber border-score-amber',
    red: 'bg-transparent text-score-red border-score-red',
  };

  return (
    <span
      className={clsx(
        baseStyles,
        outline ? outlineVariants[variant] : solidVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
