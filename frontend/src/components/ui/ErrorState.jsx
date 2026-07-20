import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center p-8 border border-danger/20 rounded-lg bg-red-50/5 dark:bg-red-950/5 w-full min-h-[300px] animate-fade-in', className)}>
      <div className="text-danger mb-4 p-4 bg-danger/10 rounded-full border border-danger/25">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="danger"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};
export default ErrorState;
