import React, { useState } from 'react';
import { clsx } from 'clsx';

export const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const statusClasses = {
    online: 'bg-score-emerald ring-surface',
    offline: 'bg-text-secondary ring-surface',
    busy: 'bg-score-red ring-surface',
    away: 'bg-score-amber ring-surface',
  };

  const statusIndicatorSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={clsx(
          'rounded-full overflow-hidden flex items-center justify-center font-bold bg-bg text-text-secondary border border-border select-none shadow-rest',
          sizeClasses[size],
          className
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>
      
      {status && statusClasses[status] && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2',
            statusClasses[status],
            statusIndicatorSize[size]
          )}
        />
      )}
    </div>
  );
};
