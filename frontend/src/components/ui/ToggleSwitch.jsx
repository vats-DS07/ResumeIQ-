import React from 'react';
import { clsx } from 'clsx';

export const ToggleSwitch = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
  id,
}) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <label
      htmlFor={switchId}
      className={clsx(
        'inline-flex items-center gap-3 select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={clsx(
            'w-11 h-6 bg-border rounded-full peer peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 transition-colors duration-200',
            'peer-checked:bg-primary'
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-surface rounded-full shadow-rest border border-border transition-transform duration-200',
            'peer-checked:translate-x-5'
          )}
        />
      </div>
      {label && <span className="text-sm font-semibold text-text">{label}</span>}
    </label>
  );
};
export default ToggleSwitch;
