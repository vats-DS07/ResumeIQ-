import React, { useState } from 'react';
import { clsx } from 'clsx';

export const Tabs = ({
  tabs = [],
  defaultTabId,
  variant = 'underline', // 'underline' | 'pills'
  className,
  contentClassName,
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const containerStyles = {
    underline: 'border-b border-border flex gap-6',
    pills: 'bg-bg p-1 rounded-lg inline-flex gap-1 w-fit border border-border',
  };

  const tabStyles = (isActive) => {
    if (variant === 'underline') {
      return clsx(
        'pb-3 pt-1 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer select-none -mb-px',
        isActive
          ? 'border-primary text-primary font-bold'
          : 'border-transparent text-text-secondary hover:text-text hover:border-border'
      );
    }
    // pills variant
    return clsx(
      'px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer select-none',
      isActive
        ? 'bg-surface text-text shadow-rest font-bold'
        : 'text-text-secondary hover:text-text'
    );
  };

  return (
    <div className={clsx('flex flex-col gap-4 w-full', className)}>
      <div className={containerStyles[variant]}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={tabStyles(tab.id === activeTabId)}
          >
            <div className="flex items-center gap-1.5">
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
      <div className={clsx('animate-fade-in py-2', contentClassName)}>
        {activeTab?.content}
      </div>
    </div>
  );
};
