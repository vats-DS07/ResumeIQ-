import React from 'react';
import { clsx } from 'clsx';

export const Skeleton = ({
  className,
  variant = 'rectangle', // 'circle' | 'text' | 'rectangle'
  width,
  height,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'animate-pulse-skeleton bg-border',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-3 rounded-md w-full',
        variant === 'rectangle' && 'rounded-md',
        className
      )}
      style={{
        width: width,
        height: height,
        ...props.style
      }}
      {...props}
    />
  );
};
