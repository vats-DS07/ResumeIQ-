import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-rest hover:shadow-hover active:scale-[0.98]',
    secondary: 'bg-surface text-text border border-border hover:bg-bg shadow-rest hover:shadow-hover active:scale-[0.98]',
    outline: 'bg-transparent text-text border border-border hover:bg-bg active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg hover:text-text active:scale-[0.98]',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-rest hover:shadow-hover active:scale-[0.98]',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    lg: 'h-11 px-6 text-lg gap-2.5',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
