import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

export const EmptyState = ({
  icon,
  title,
  description,
  actionButton,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center p-8 border border-border border-dashed rounded-lg bg-surface/50 w-full min-h-[300px] animate-fade-in', className)}>
      {icon && (
        <div className="text-text-secondary/60 mb-4 p-4 bg-bg rounded-full border border-border">
          {icon}
        </div>
      )}
      {title && <h3 className="text-lg font-bold text-text mb-1">{title}</h3>}
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionButton && (
        <Button {...actionButton}>
          {actionButton.children || 'Get Started'}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
