import React from 'react';
import { clsx } from 'clsx';

export const ProgressBar = ({
  value = 0,
  max = 100,
  showValue = false,
  label,
  colorMode = 'score-banded', // 'static' | 'score-banded'
  className,
}) => {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const getScoreColor = (pct) => {
    if (colorMode === 'static') return 'bg-primary';
    if (pct >= 80) return 'bg-score-emerald';
    if (pct >= 50) return 'bg-score-amber';
    return 'bg-score-red';
  };

  const getScoreTextClass = (pct) => {
    if (colorMode === 'static') return 'text-primary';
    if (pct >= 80) return 'text-score-emerald';
    if (pct >= 50) return 'text-score-amber';
    return 'text-score-red';
  };

  const barColorClass = getScoreColor(percentage);
  const textColorClass = getScoreTextClass(percentage);

  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-semibold text-text">{label}</span>}
          {showValue && (
            <span className={clsx('font-bold', textColorClass)}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
        <div
          className={clsx('h-full transition-all duration-500 ease-out rounded-full', barColorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
