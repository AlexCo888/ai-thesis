'use client';

import { useState } from 'react';
import clsx from 'clsx';

export interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  initial?: number;
}

export function Tabs({ tabs, initial = 0 }: TabsProps) {
  const [i, setI] = useState(initial);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b flex gap-1.5 lg:gap-2 p-1.5 lg:p-2 flex-shrink-0">
        {tabs.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={clsx(
              'px-2.5 lg:px-3 py-1 rounded-md text-sm transition-colors',
              i === idx
                ? 'bg-neutral-100 dark:bg-neutral-900'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
            )}
          >
            <span className="inline-flex items-center gap-1.5 lg:gap-2">
              {t.icon}
              {t.label}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto min-h-0">{tabs[i]?.content}</div>
    </div>
  );
}
