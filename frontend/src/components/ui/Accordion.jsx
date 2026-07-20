import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpenIndex = null,
  className,
}) => {
  const [openIndexes, setOpenIndexes] = useState(() => {
    if (defaultOpenIndex !== null) {
      return allowMultiple ? [defaultOpenIndex] : defaultOpenIndex;
    }
    return allowMultiple ? [] : null;
  });

  const handleToggle = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev === index ? null : index));
    }
  };

  const isOpen = (index) => {
    return allowMultiple ? openIndexes.includes(index) : openIndexes === index;
  };

  return (
    <div className={clsx('flex flex-col border border-border rounded-lg bg-surface divide-y divide-border overflow-hidden', className)}>
      {items.map((item, index) => {
        const active = isOpen(index);
        return (
          <div key={index} className="flex flex-col">
            <button
              type="button"
              onClick={() => handleToggle(index)}
              className="flex items-center justify-between w-full px-6 py-4 font-semibold text-text text-left hover:bg-bg/50 transition-colors duration-150 cursor-pointer"
              aria-expanded={active}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={clsx(
                  'w-5 h-5 text-text-secondary transition-transform duration-200 shrink-0',
                  active && 'rotate-180 text-primary'
                )}
              />
            </button>
            <div
              className={clsx(
                'overflow-hidden transition-all duration-200 ease-in-out',
                active ? 'max-h-[1000px] border-t border-border bg-bg/25' : 'max-h-0'
              )}
            >
              <div className="p-6 text-sm text-text-secondary leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
